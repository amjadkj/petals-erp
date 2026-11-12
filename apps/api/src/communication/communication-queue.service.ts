import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { PrismaService } from '../common/prisma/prisma.service';
import { CacheService } from '../common/redis/cache.service';
import {
  WHATSAPP_PROVIDER,
  WhatsAppProvider,
} from './interfaces/whatsapp-provider.interface';
import {
  EMAIL_PROVIDER,
  EmailProvider,
} from './interfaces/email-provider.interface';
import { CommunicationChannel, MessageStatus } from '@petals/types';

export interface CommunicationJobData {
  logId: string;
  clientId: string;
  channel: CommunicationChannel;
  recipient: string;
  templateName?: string;
  language?: string;
  parameters?: Record<string, string>;
  message?: string;
  subject?: string;
}

@Injectable()
export class CommunicationQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CommunicationQueueService.name);
  private queue: Queue<CommunicationJobData> | null = null;
  private worker: Worker<CommunicationJobData> | null = null;
  private isRedisConnected = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsAppProvider: WhatsAppProvider,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {}

  async onModuleInit() {
    if (!this.cacheService.isReady()) {
      this.isRedisConnected = false;
      this.logger.log('Redis is offline; using in-memory job processing fallback.');
      return;
    }

    let redisHost = process.env.REDIS_HOST || 'localhost';
    let redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    let redisPassword = process.env.REDIS_PASSWORD || undefined;

    if (process.env.REDIS_URL) {
      try {
        const parsed = new URL(process.env.REDIS_URL);
        redisHost = parsed.hostname || redisHost;
        redisPort = parsed.port ? parseInt(parsed.port, 10) : redisPort;
        if (parsed.password) {
          redisPassword = decodeURIComponent(parsed.password);
        }
      } catch {
        // Fall back to individual vars
      }
    }

    const connectionOptions = {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: () => null, // Do not hang if offline
    };

    try {
      this.queue = new Queue<CommunicationJobData>('communication-messages', {
        connection: connectionOptions,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      this.queue.on('error', (err) => {
        this.logger.debug(`BullMQ Queue error: ${err.message}`);
      });

      this.worker = new Worker<CommunicationJobData>(
        'communication-messages',
        async (job: Job<CommunicationJobData>) => {
          await this.processJob(job.data);
        },
        {
          connection: connectionOptions,
          concurrency: 5,
        },
      );

      this.worker.on('error', (err) => {
        this.logger.debug(`BullMQ Worker error: ${err.message}`);
      });

      this.worker.on('failed', async (job, err) => {
        if (job) {
          this.logger.error(
            `Job ${job.id} for log ${job.data.logId} failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${err.message}`,
          );
          if (job.attemptsMade >= (job.opts.attempts || 3)) {
            await this.markLogFailed(job.data.logId);
          }
        }
      });

      await this.queue.waitUntilReady();
      this.isRedisConnected = true;
      this.logger.log('BullMQ Communication queue initialized successfully');
    } catch (err: any) {
      this.isRedisConnected = false;
      this.logger.warn(
        `Redis offline for BullMQ (${err.message}). Using in-memory job processing fallback.`,
      );
      if (this.queue) {
        try {
          await this.queue.close();
        } catch {}
        this.queue = null;
      }
      if (this.worker) {
        try {
          await this.worker.close();
        } catch {}
        this.worker = null;
      }
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
  }

  /**
   * Enqueue a communication job with retry & backoff
   */
  async addJob(data: CommunicationJobData): Promise<void> {
    if (this.isRedisConnected && this.queue) {
      try {
        await this.queue.add('send-message', data);
        return;
      } catch (err: any) {
        this.logger.warn(`Failed to add job to BullMQ queue: ${err.message}. Running fallback.`);
      }
    }

    // In-memory fallback processor with retry & backoff
    this.processJobWithRetry(data, 3, 1000).catch((err) => {
      this.logger.error(`In-memory job processing completely failed: ${err.message}`);
    });
  }

  /**
   * In-memory retry loop with exponential backoff matching BullMQ configuration
   */
  private async processJobWithRetry(
    data: CommunicationJobData,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
  ): Promise<void> {
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        await this.processJob(data);
        return;
      } catch (err: any) {
        this.logger.warn(
          `In-memory job processing attempt ${attempt}/${maxAttempts} failed for log ${data.logId}: ${err.message}`,
        );
        if (attempt >= maxAttempts) {
          await this.markLogFailed(data.logId);
          throw err;
        }
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Dispatches the message via the proper provider and updates CommunicationLog
   */
  public async processJob(data: CommunicationJobData): Promise<void> {
    if (data.channel === CommunicationChannel.WHATSAPP) {
      const result = await this.whatsAppProvider.sendMessage({
        to: data.recipient,
        templateName: data.templateName || '',
        language: data.language,
        parameters: data.parameters,
      });

      await this.prisma.unscopedClient.communicationLog.update({
        where: { id: data.logId },
        data: {
          status: result.status,
          providerRef: result.providerRef,
        },
      });
    } else if (data.channel === CommunicationChannel.EMAIL) {
      const result = await this.emailProvider.sendEmail({
        to: data.recipient,
        subject: data.subject || 'Notification from Petals CDC',
        body: data.message || '',
      });

      await this.prisma.unscopedClient.communicationLog.update({
        where: { id: data.logId },
        data: {
          status: MessageStatus.SENT,
          providerRef: result.providerRef,
        },
      });
    }
  }

  private async markLogFailed(logId: string): Promise<void> {
    try {
      await this.prisma.unscopedClient.communicationLog.update({
        where: { id: logId },
        data: { status: MessageStatus.FAILED },
      });
    } catch (err: any) {
      this.logger.error(`Failed to mark log ${logId} as FAILED: ${err.message}`);
    }
  }
}
