import { EmailContentType } from '@/mails/domain/enums';
import { SendEmailOptions } from '../types';

export interface MailSendingStrategy {
  send(options: SendEmailOptions): Promise<void>;
  getContentType(): EmailContentType;
  supports(contentType: EmailContentType): boolean;
}
