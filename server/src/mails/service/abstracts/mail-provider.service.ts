export type PlainMail = {
  to: string;
  subject: string;
  content: string;
  /**
   * The sender of the mail.
   * Will override the default sender if provided.
   * @default value from config.mail.from
   */
  from?: string;
};

export type HtmlMail = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export abstract class MailProviderService {
  abstract sendPlainMail(options: PlainMail): Promise<void>;
  abstract sendHtmlMail(options: HtmlMail): Promise<void>;
}
