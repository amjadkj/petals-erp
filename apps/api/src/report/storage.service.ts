import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

@Injectable()
export class StorageService {
  private readonly signingSecret: string;
  private readonly storageBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.signingSecret = this.config.get<string>('JWT_SECRET') || 'storage-secret-key-petals';
    this.storageBaseUrl = this.config.get<string>('STORAGE_BASE_URL') || 'https://storage.petals.com';
  }

  validateFile(mimeType: string, sizeBytes: number): void {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        `File type "${mimeType}" is not allowed. Allowed types: PDF, Word (doc/docx), Images (JPEG/PNG/WebP)`,
      );
    }

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds the 15MB limit');
    }
  }

  generateSignedUploadUrl(
    clientId: string,
    fileName: string,
    mimeType: string,
    expiresInSeconds: number = 900, // 15 mins
  ) {
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const randomHex = crypto.randomBytes(6).toString('hex');
    const fileKey = `clients/${clientId}/${Date.now()}_${randomHex}_${sanitizedName}`;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const payload = `PUT:${fileKey}:${mimeType}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(payload)
      .digest('hex');

    const uploadUrl = `${this.storageBaseUrl}/upload/${fileKey}?expires=${expiresAt}&signature=${signature}`;
    const fileUrl = `${this.storageBaseUrl}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
      expiresInSeconds,
      headers: {
        'Content-Type': mimeType,
      },
    };
  }

  generateSignedDownloadUrl(fileUrlOrKey: string, expiresInSeconds: number = 3600) {
    const fileKey = fileUrlOrKey.startsWith('http')
      ? fileUrlOrKey.replace(`${this.storageBaseUrl}/`, '')
      : fileUrlOrKey;

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = `GET:${fileKey}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(payload)
      .digest('hex');

    const downloadUrl = `${this.storageBaseUrl}/download/${fileKey}?expires=${expiresAt}&signature=${signature}`;

    return {
      downloadUrl,
      expiresInSeconds,
    };
  }
}
