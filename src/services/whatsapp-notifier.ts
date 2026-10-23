import { IWhatsAppNotifier } from '../domain/automation-engine.js';
import { WhatsAppNotification } from '../domain/types.js';

export class WhatsAppNotifierService implements IWhatsAppNotifier {
  private notificationsHistory: WhatsAppNotification[] = [];
  private targetPhone: string;

  constructor(targetPhone = '+55 11 99999-8888') {
    this.targetPhone = targetPhone;
  }

  async send(message: string): Promise<boolean> {
    const notification: WhatsAppNotification = {
      to: this.targetPhone,
      message,
      timestamp: new Date().toISOString(),
      sent: true
    };

    this.notificationsHistory.unshift(notification);
    if (this.notificationsHistory.length > 50) {
      this.notificationsHistory.pop();
    }

    console.log(`\n======================================================`);
    console.log(`[WHATSAPP MOCK ENVIADO]`);
    console.log(`Para: ${notification.to}`);
    console.log(`Data: ${notification.timestamp}`);
    console.log(`Mensagem: ${notification.message}`);
    console.log(`======================================================\n`);

    return true;
  }

  getHistory(): WhatsAppNotification[] {
    return this.notificationsHistory;
  }
}
