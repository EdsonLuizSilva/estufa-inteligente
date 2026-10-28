import fs from 'fs';
import path from 'path';
import https from 'https';
import { IWhatsAppNotifier } from '../domain/automation-engine.js';
import { WhatsAppNotification, WhatsAppConfig } from '../domain/types.js';

function fetchCallMeBot(url: string, timeoutMs = 12000): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Tempo limite esgotado ao contatar CallMeBot (12s)'));
    });
  });
}

export class WhatsAppNotifierService implements IWhatsAppNotifier {
  private notificationsHistory: WhatsAppNotification[] = [];
  private targetPhone: string;
  private apiKey: string;
  private enabled: boolean;
  private configFilePath: string;

  constructor(
    defaultPhone = process.env.CALLMEBOT_PHONE || '+55 11 99999-8888',
    defaultApiKey = process.env.CALLMEBOT_APIKEY || '',
    configFilePath = path.resolve(process.cwd(), 'data', 'whatsapp-config.json')
  ) {
    this.targetPhone = defaultPhone;
    this.apiKey = defaultApiKey;
    this.enabled = true;
    this.configFilePath = configFilePath;
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configFilePath)) {
        const raw = fs.readFileSync(this.configFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.targetPhone) this.targetPhone = data.targetPhone;
        if (data.apiKey !== undefined) this.apiKey = data.apiKey;
        if (data.enabled !== undefined) this.enabled = Boolean(data.enabled);
      }
    } catch (err: any) {
      console.warn('[WhatsAppNotifier] Aviso ao carregar configurações salvas:', err.message);
    }
  }

  private saveConfig(): void {
    try {
      const dir = path.dirname(this.configFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data: WhatsAppConfig = {
        targetPhone: this.targetPhone,
        apiKey: this.apiKey,
        enabled: this.enabled
      };
      fs.writeFileSync(this.configFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[WhatsAppNotifier] Falha ao persistir configurações:', err.message);
    }
  }

  getConfig(): WhatsAppConfig {
    return {
      targetPhone: this.targetPhone,
      apiKey: this.apiKey,
      enabled: this.enabled
    };
  }

  updateConfig(config: Partial<WhatsAppConfig>): WhatsAppConfig {
    if (config.targetPhone !== undefined) {
      this.targetPhone = config.targetPhone.trim();
    }
    if (config.apiKey !== undefined) {
      this.apiKey = config.apiKey.trim();
    }
    if (config.enabled !== undefined) {
      this.enabled = Boolean(config.enabled);
    }
    this.saveConfig();
    return this.getConfig();
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Trata a peculiaridade de números celulares brasileiros no WhatsApp:
   * Contas no Brasil podem estar registradas internacionalmente com 8 ou 9 dígitos no número local.
   */
  private getAlternativeBrazilianPhone(phone: string): string | null {
    const clean = this.cleanPhoneNumber(phone);
    if (!clean.startsWith('55')) return null;

    // Se tem 13 dígitos: 55 + DDD (2) + 9 + 8 dígitos -> Tenta com 12 dígitos (sem o 9 inicial)
    if (clean.length === 13 && clean[4] === '9') {
      return clean.slice(0, 4) + clean.slice(5);
    }
    // Se tem 12 dígitos: 55 + DDD (2) + 8 dígitos -> Tenta com 13 dígitos (com o 9 inicial)
    if (clean.length === 12) {
      return clean.slice(0, 4) + '9' + clean.slice(4);
    }
    return null;
  }

  private parseCallMeBotResponse(responseText: string): { success: boolean; error?: string } {
    const lower = responseText.toLowerCase();

    if (lower.includes('paused')) {
      return {
        success: false,
        error: 'Sua conta está Pausada no CallMeBot. Envie a palavra "resume" no WhatsApp para o bot (+34 611 021 695) para reativar.'
      };
    }

    if (lower.includes('apikey is invalid')) {
      return {
        success: false,
        error: 'APIKey inválida para este número no CallMeBot. Verifique se digitou a chave correta.'
      };
    }

    if (lower.includes('error')) {
      // Extrai texto limpo de tags HTML se houver
      const clean = responseText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        success: false,
        error: clean.slice(0, 150)
      };
    }

    return { success: true };
  }

  async send(message: string): Promise<boolean> {
    if (!this.enabled) {
      console.log('[WhatsAppNotifier] Notificações desativadas nas configurações.');
      return false;
    }

    let cleanPhone = this.cleanPhoneNumber(this.targetPhone);
    const hasApiKey = Boolean(this.apiKey && this.apiKey.trim().length > 0);

    let sent = false;
    let provider = 'Simulador Local';
    let errorMessage: string | undefined;

    if (hasApiKey) {
      provider = 'CallMeBot';
      try {
        const encodedText = encodeURIComponent(message);
        let url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${this.apiKey.trim()}`;

        console.log(`[CallMeBot] Enviando WhatsApp para ${cleanPhone}...`);

        let responseText = await fetchCallMeBot(url);
        let parsed = this.parseCallMeBotResponse(responseText);

        // Se falhou por "APIKey is invalid" e for número do Brasil, tenta automaticamente o formato alternativo (com/sem 9)
        if (!parsed.success && responseText.includes('APIKey is invalid')) {
          const altPhone = this.getAlternativeBrazilianPhone(cleanPhone);
          if (altPhone) {
            console.log(`[CallMeBot] Tentando formato alternativo brasileiro: ${altPhone}...`);
            const altUrl = `https://api.callmebot.com/whatsapp.php?phone=${altPhone}&text=${encodedText}&apikey=${this.apiKey.trim()}`;
            const altResponseText = await fetchCallMeBot(altUrl);
            const altParsed = this.parseCallMeBotResponse(altResponseText);
            
            if (altParsed.success || altResponseText.includes('Paused')) {
              cleanPhone = altPhone;
              responseText = altResponseText;
              parsed = altParsed;
            }
          }
        }

        if (parsed.success) {
          sent = true;
          console.log(`[CallMeBot] Sucesso: Mensagem enviada para ${cleanPhone}`);
        } else {
          sent = false;
          errorMessage = parsed.error || `Resposta da API: ${responseText.slice(0, 120)}`;
          console.warn(`[CallMeBot] Falha no retorno: ${errorMessage}`);
        }
      } catch (err: any) {
        sent = false;
        errorMessage = err.message || 'Erro de rede ao contatar CallMeBot';
        console.error(`[CallMeBot] Erro de requisição: ${errorMessage}`);
      }
    } else {
      // Modo Simulação (para testes locais sem API Key cadastrada)
      sent = true;
      provider = 'Simulador Local';
      console.log(`\n======================================================`);
      console.log(`[WHATSAPP SIMULADO / LOCAL]`);
      console.log(`Para: ${this.targetPhone} (CallMeBot não configurado)`);
      console.log(`Data: ${new Date().toISOString()}`);
      console.log(`Mensagem: ${message}`);
      console.log(`======================================================\n`);
    }

    const notification: WhatsAppNotification = {
      to: this.targetPhone,
      message,
      timestamp: new Date().toISOString(),
      sent,
      provider,
      error: errorMessage
    };

    this.notificationsHistory.unshift(notification);
    if (this.notificationsHistory.length > 50) {
      this.notificationsHistory.pop();
    }

    return sent;
  }

  async sendTestMessage(): Promise<boolean> {
    const testMsg = `🧪 [Estufa Inteligente] Teste de Notificação via WhatsApp (${this.apiKey ? 'CallMeBot' : 'Simulador'})\n\nConexão com o sistema de monitoramento está ativa!\nHorário: ${new Date().toLocaleTimeString('pt-BR')}`;
    return this.send(testMsg);
  }

  getHistory(): WhatsAppNotification[] {
    return this.notificationsHistory;
  }
}
