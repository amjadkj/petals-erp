import type {
  CommunicationChannel,
  MessageStatus,
  TemplateStatus,
} from '@petals/types';
import type {
  CommunicationTemplateDto,
  CommunicationLogDto,
  SendMessagePayload,
  SendBulkPayload,
  CallLogPayload,
} from '@/lib/api/communication';

export type CommunicationTab = 'messages' | 'templates' | 'bulk';

export interface MessageFilterState {
  search: string;
  channel: string;
  status: string;
  date: string;
}

export type {
  CommunicationChannel,
  MessageStatus,
  TemplateStatus,
  CommunicationTemplateDto,
  CommunicationLogDto,
  SendMessagePayload,
  SendBulkPayload,
  CallLogPayload,
};

