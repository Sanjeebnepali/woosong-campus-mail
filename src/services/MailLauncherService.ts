/**
 * @file src/services/MailLauncherService.ts
 * @description Production Object-Oriented Mail Launcher & URL Builder.
 * Constructs RFC-6068 compliant `mailto:` URIs as well as direct web compose links
 * for Gmail, Naver Mail, and Microsoft Outlook/365 so students never have to copy-paste manually.
 */

/**
 * @class MailLauncherService
 * @description Encapsulates email recipient, subject, and body, providing safe URI encoding
 * for native and web-based email clients used in Korean & international universities.
 */
export class MailLauncherService {
  private readonly recipientEmail: string;
  private readonly subject: string;
  private readonly body: string;

  /**
   * Constructor stores and trims the email parameters.
   * @param recipientEmail Professor's official email address
   * @param subject Formatted email subject line
   * @param body Complete etiquette-compliant email body
   */
  constructor(recipientEmail: string, subject: string, body: string) {
    this.recipientEmail = recipientEmail.trim();
    this.subject = subject.trim();
    this.body = body.trim();
  }

  /**
   * Builds a standard `mailto:` URI that opens the student's default system mail app
   * (Apple Mail, Windows Mail, iOS Mail, Android Gmail).
   */
  public getMailtoUri(): string {
    const encodedSubject = encodeURIComponent(this.subject);
    const encodedBody = encodeURIComponent(this.body);
    return `mailto:${this.recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  /**
   * Builds a direct Gmail Web compose URL that opens a pre-filled Gmail compose tab.
   */
  public getGmailWebUrl(): string {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: this.recipientEmail,
      su: this.subject,
      body: this.body,
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  /**
   * Builds a direct Naver Mail Web compose URL popular among Korean university students.
   */
  public getNaverMailWebUrl(): string {
    const params = new URLSearchParams({
      srvid: "note",
      to: this.recipientEmail,
      subject: this.subject,
      body: this.body,
    });
    return `https://mail.naver.com/write/popup?${params.toString()}`;
  }

  /**
   * Builds a direct Microsoft Outlook / Office 365 Web compose URL (used by university .ac.kr accounts).
   */
  public getOutlookWebUrl(): string {
    const params = new URLSearchParams({
      to: this.recipientEmail,
      subject: this.subject,
      body: this.body,
    });
    return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
  }

  /**
   * Formats the complete email (Recipient + Subject + Body) for 1-click clipboard copying.
   */
  public getFormattedClipboardText(): string {
    return `받는 사람 (To): ${this.recipientEmail}\n제목 (Subject): ${this.subject}\n\n${this.body}`;
  }
}
