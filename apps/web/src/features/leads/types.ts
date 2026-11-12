import { LeadStage, type LeadDto } from '@petals/types';

export interface LeadItem extends LeadDto {
  ownerName?: string;
  ownerAvatar?: string;
  followUpDate?: string;
  isOverdue?: boolean;
  convertedDate?: string;
  closedDate?: string;
  lostReason?: string;
}

export interface LeadColumnConfig {
  stage: LeadStage;
  title: string;
  dotColor: 'purple' | 'teal' | 'gray';
  emptyMessage?: string;
}

export interface ConvertPreviewData {
  childName: string;
  dob?: string;
  branchId?: string;
  parentName?: string;
  phone?: string;
  email?: string;
  concerns?: string;
}
