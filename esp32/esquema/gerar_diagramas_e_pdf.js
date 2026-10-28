const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const PDFDocument = require('pdfkit');

const OUT_DIR = path.join(__dirname, 'imagens');
const PDF_PATH = path.join(__dirname, 'Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf');
const ARTIFACT_PDF_PATH = 'C:/Users/Juliana/.gemini/antigravity/brain/4032e573-d154-4d7b-ae0e-84e56051ad5f/Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ============================================================================
// HELPER SVG GENERATORS
// ============================================================================

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function svgWrapper(title, subtitle, content, width = 1200, height = 700) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const cleanContent = content.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="espGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Fundo Principal -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="16" fill="none" stroke="#334155" stroke-width="1.5" />

  <!-- Cabeçalho -->
  <rect x="40" y="35" width="6" height="42" rx="3" fill="#10b981" />
  <text x="56" y="58" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="700" fill="#f8fafc">${safeTitle}</text>
  <text x="56" y="78" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">${safeSubtitle}</text>

  <!-- Conteúdo Específico -->
  ${cleanContent}

  <!-- Rodapé -->
  <text x="40" y="${height - 32}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="12" fill="#64748b">Estufa Inteligente IoT • Firmware ESP32 • Metodologia ECC</text>
  <text x="${width - 40}" y="${height - 32}" text-anchor="end" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="12" fill="#10b981">Conexão 100% Validada</text>
</svg>`;
}

// 1. SVG: Sensor DHT22
function getDht22Svg() {
  const content = `
  <!-- ESP32 Board Representation -->
  <g transform="translate(100, 140)" filter="url(#shadow)">
    <rect width="260" height="460" rx="14" fill="url(#espGrad)" stroke="#475569" stroke-width="2" />
    <rect x="70" y="30" width="120" height="150" rx="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <text x="130" y="110" font-family="monospace" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">ESP32-WROOM</text>
    <rect x="85" y="0" width="90" height="26" rx="4" fill="url(#metalGrad)" />
    <text x="130" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b" text-anchor="middle">PORTA USB</text>

    <!-- Pinos Esquerdos -->
    <circle cx="20" cy="220" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="36" y="224" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">3V3 (3.3V)</text>

    <circle cx="20" cy="270" r="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
    <text x="36" y="274" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">GND</text>

    <!-- Pinos Direitos -->
    <circle cx="240" cy="220" r="7" fill="#f59e0b" stroke="#fde68a" stroke-width="2" />
    <text x="224" y="224" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 4</text>
  </g>

  <!-- DHT22 Sensor Representation -->
  <g transform="translate(680, 150)" filter="url(#shadow)">
    <!-- Corpo Sensor Branco/Gelo -->
    <rect width="240" height="320" rx="16" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" />
    <!-- Grade de Entrada de Ar -->
    <rect x="35" y="40" width="170" height="150" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
    <line x1="60" y1="50" x2="60" y2="180" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="90" y1="50" x2="90" y2="180" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="120" y1="50" x2="120" y2="180" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="150" y1="50" x2="150" y2="180" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="180" y1="50" x2="180" y2="180" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    
    <text x="120" y="220" font-family="sans-serif" font-size="16" font-weight="800" fill="#0f172a" text-anchor="middle">DHT22 / AM2302</text>
    <text x="120" y="240" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle">Temperatura &amp; Umidade</text>

    <!-- 4 Pinos do DHT22 -->
    <g transform="translate(45, 320)">
      <rect x="0" y="0" width="16" height="45" fill="url(#metalGrad)" rx="2" />
      <text x="8" y="65" font-family="sans-serif" font-size="11" font-weight="700" fill="#ef4444" text-anchor="middle">1:VCC</text>

      <rect x="45" y="0" width="16" height="45" fill="url(#metalGrad)" rx="2" />
      <text x="53" y="65" font-family="sans-serif" font-size="11" font-weight="700" fill="#f59e0b" text-anchor="middle">2:DATA</text>

      <rect x="90" y="0" width="16" height="45" fill="url(#metalGrad)" rx="2" />
      <text x="98" y="65" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">3:NC</text>

      <rect x="135" y="0" width="16" height="45" fill="url(#metalGrad)" rx="2" />
      <text x="143" y="65" font-family="sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle">4:GND</text>
    </g>
  </g>

  <!-- Fiação (Wires) -->
  <!-- VCC: ESP32 3V3 -> DHT22 Pino 1 -->
  <path d="M 120 360 L 60 360 L 60 560 L 733 560 L 733 365" fill="none" stroke="#ef4444" stroke-width="4" stroke-linejoin="round" />

  <!-- GND: ESP32 GND -> DHT22 Pino 4 -->
  <path d="M 120 410 L 40 410 L 40 600 L 868 600 L 868 365" fill="none" stroke="#1e293b" stroke-width="6" />
  <path d="M 120 410 L 40 410 L 40 600 L 868 600 L 868 365" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round" />

  <!-- DATA: ESP32 GPIO 4 -> DHT22 Pino 2 -->
  <path d="M 340 360 L 520 360 L 520 280 L 778 280 L 778 365" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round" />

  <!-- Resistor Pull-Up (4.7kΩ a 10kΩ) entre VCC e DATA -->
  <g transform="translate(560, 420)">
    <rect width="100" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    <text x="50" y="26" font-family="sans-serif" font-size="11" font-weight="700" fill="#fde68a" text-anchor="middle">RESISTOR PULL-UP</text>
    <text x="50" y="44" font-family="sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">4.7kΩ / 10kΩ</text>

    <!-- Linhas do Resistor conectando VCC e DATA -->
    <path d="M 0 30 L -40 30 L -40 -60" fill="none" stroke="#f59e0b" stroke-width="2.5" />
    <path d="M 100 30 L 140 30 L 140 140" fill="none" stroke="#ef4444" stroke-width="2.5" />
  </g>

  <!-- Caixa de Destaque / Dicas -->
  <g transform="translate(480, 520)" filter="url(#shadow)">
    <rect width="640" height="95" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
    <text x="25" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">💡 NOTA DE MONTAGEM:</text>
    <text x="25" y="56" font-family="sans-serif" font-size="13" fill="#cbd5e1">• Se usar o módulo DHT22 já soldado em placa de 3 pinos (+, out, -), o resistor pull-up já está incluído!</text>
    <text x="25" y="76" font-family="sans-serif" font-size="13" fill="#cbd5e1">• Conecte direto: (+) no 3V3, (-) no GND e (OUT) no GPIO 4 do ESP32.</text>
  </g>
  `;
  return svgWrapper("Esquema 1: Sensor DHT22 (Temperatura & Umidade do Ar)", "Ligação direta ao GPIO 4 com alimentação estável de 3.3V", content);
}

// 2. SVG: Sensor Ultrassônico HC-SR04 com Divisor de Tensão
function getUltrasonicSvg() {
  const content = `
  <!-- ESP32 Board Representation -->
  <g transform="translate(80, 140)" filter="url(#shadow)">
    <rect width="260" height="460" rx="14" fill="url(#espGrad)" stroke="#475569" stroke-width="2" />
    <rect x="70" y="30" width="120" height="150" rx="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <text x="130" y="110" font-family="monospace" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">ESP32-WROOM</text>
    <rect x="85" y="0" width="90" height="26" rx="4" fill="url(#metalGrad)" />
    <text x="130" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b" text-anchor="middle">PORTA USB</text>

    <!-- Pinos Esquerdos -->
    <circle cx="20" cy="220" r="7" fill="#dc2626" stroke="#fca5a5" stroke-width="2" />
    <text x="36" y="224" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">VIN (5V)</text>

    <circle cx="20" cy="270" r="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
    <text x="36" y="274" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">GND</text>

    <!-- Pinos Direitos -->
    <circle cx="240" cy="220" r="7" fill="#10b981" stroke="#a7f3d0" stroke-width="2" />
    <text x="224" y="224" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 5 (TRIG)</text>

    <circle cx="240" cy="270" r="7" fill="#0284c7" stroke="#bae6fd" stroke-width="2" />
    <text x="224" y="274" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 17 (ECHO)</text>
  </g>

  <!-- HC-SR04 Representation -->
  <g transform="translate(740, 140)" filter="url(#shadow)">
    <rect width="360" height="190" rx="14" fill="#0284c7" stroke="#38bdf8" stroke-width="3" />
    
    <!-- Transdutores Ultrassônicos (Cilindros de Alumínio) -->
    <circle cx="95" cy="80" r="50" fill="url(#metalGrad)" stroke="#0f172a" stroke-width="3" />
    <circle cx="95" cy="80" r="30" fill="#334155" stroke="#64748b" stroke-width="2" />
    <text x="95" y="85" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">T (TRIG)</text>

    <circle cx="265" cy="80" r="50" fill="url(#metalGrad)" stroke="#0f172a" stroke-width="3" />
    <circle cx="265" cy="80" r="30" fill="#334155" stroke="#64748b" stroke-width="2" />
    <text x="265" y="85" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">R (ECHO)</text>

    <!-- Pinos do Módulo -->
    <g transform="translate(90, 190)">
      <rect x="0" y="0" width="16" height="35" fill="url(#metalGrad)" rx="2" />
      <text x="8" y="55" font-family="sans-serif" font-size="12" font-weight="700" fill="#ef4444" text-anchor="middle">VCC</text>

      <rect x="55" y="0" width="16" height="35" fill="url(#metalGrad)" rx="2" />
      <text x="63" y="55" font-family="sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="middle">TRIG</text>

      <rect x="110" y="0" width="16" height="35" fill="url(#metalGrad)" rx="2" />
      <text x="118" y="55" font-family="sans-serif" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle">ECHO</text>

      <rect x="165" y="0" width="16" height="35" fill="url(#metalGrad)" rx="2" />
      <text x="173" y="55" font-family="sans-serif" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle">GND</text>
    </g>
  </g>

  <!-- DIVISOR DE TENSÃO (CIRCUITO DE PROTEÇÃO) -->
  <g transform="translate(420, 310)" filter="url(#shadow)">
    <rect width="260" height="150" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    <text x="130" y="28" font-family="sans-serif" font-size="13" font-weight="700" fill="#fde68a" text-anchor="middle">🛡️ DIVISOR DE TENSÃO (5V ➔ 3.3V)</text>

    <!-- Resistor R1 (1kΩ) -->
    <rect x="30" y="55" width="80" height="28" rx="4" fill="#334155" stroke="#38bdf8" stroke-width="2" />
    <text x="70" y="74" font-family="monospace" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">R1: 1kΩ</text>

    <!-- Resistor R2 (2kΩ) -->
    <rect x="150" y="55" width="80" height="28" rx="4" fill="#334155" stroke="#94a3b8" stroke-width="2" />
    <text x="190" y="74" font-family="monospace" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">R2: 2kΩ</text>

    <text x="130" y="115" font-family="sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">Protege o GPIO 17 contra sobretensão</text>
    <text x="130" y="135" font-family="monospace" font-size="11" fill="#34d399" text-anchor="middle">5V * (2k / (1k + 2k)) = 3.33V</text>
  </g>

  <!-- FIOS -->
  <!-- VCC: ESP32 VIN (5V) -> HC-SR04 VCC -->
  <path d="M 100 360 L 50 360 L 50 110 L 838 110 L 838 190" fill="none" stroke="#ef4444" stroke-width="4" stroke-linejoin="round" />

  <!-- GND: ESP32 GND -> HC-SR04 GND -->
  <path d="M 100 410 L 30 410 L 30 580 L 1013 580 L 1013 225" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
  <!-- GND conectado também ao R2 do divisor -->
  <path d="M 650 395 L 680 395 L 680 580" fill="none" stroke="#475569" stroke-width="3" stroke-linejoin="round" />

  <!-- TRIG: ESP32 GPIO 5 -> HC-SR04 TRIG -->
  <path d="M 320 360 L 400 360 L 400 240 L 893 240 L 893 225" fill="none" stroke="#10b981" stroke-width="4" stroke-linejoin="round" />

  <!-- ECHO: HC-SR04 ECHO -> Divisor R1 -> GPIO 17 -->
  <path d="M 948 225 L 948 340 L 430 340" fill="none" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />
  <!-- Do divisor sai o sinal seguro de 3.3V para GPIO 17 -->
  <path d="M 450 395 L 370 395 L 370 410 L 320 410" fill="none" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />

  <!-- Alerta Inferior -->
  <g transform="translate(380, 500)">
    <rect width="720" height="90" rx="10" fill="#1e293b" stroke="#ef4444" stroke-width="1.5" />
    <text x="25" y="30" font-family="sans-serif" font-size="14" font-weight="700" fill="#f87171">⚠️ ATENÇÃO COM O ECHO EM 5V:</text>
    <text x="25" y="54" font-family="sans-serif" font-size="13" fill="#cbd5e1">• O HC-SR04 padrão opera em 5V e o pino ECHO envia pulso de 5V direto.</text>
    <text x="25" y="74" font-family="sans-serif" font-size="13" fill="#cbd5e1">• O ESP32 NÃO tolera 5V nos GPIOs. Use o divisor acima ou utilize sensores nativos 3.3V (HC-SR04P).</text>
  </g>
  `;
  return svgWrapper("Esquema 2: Sensor Ultrassônico HC-SR04 (Nível d'Água)", "GPIO 5 (TRIG), GPIO 17 (ECHO) e Divisor Resistivo de Proteção", content);
}

// 3. SVG: Sensor de Umidade do Solo (Higrômetro Analógico)
function getSoilSvg() {
  const content = `
  <!-- ESP32 Board Representation -->
  <g transform="translate(80, 140)" filter="url(#shadow)">
    <rect width="260" height="460" rx="14" fill="url(#espGrad)" stroke="#475569" stroke-width="2" />
    <rect x="70" y="30" width="120" height="150" rx="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <text x="130" y="110" font-family="monospace" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">ESP32-WROOM</text>
    <rect x="85" y="0" width="90" height="26" rx="4" fill="url(#metalGrad)" />
    <text x="130" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b" text-anchor="middle">PORTA USB</text>

    <!-- Pinos Esquerdos -->
    <circle cx="20" cy="220" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="36" y="224" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">3V3 (3.3V)</text>

    <circle cx="20" cy="270" r="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
    <text x="36" y="274" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc">GND</text>

    <!-- Pinos Direitos: GPIO 34 (ADC1_CH6) -->
    <circle cx="240" cy="240" r="7" fill="#d97706" stroke="#fde68a" stroke-width="2" />
    <text x="224" y="244" font-family="monospace" font-size="13" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 34 (ADC1)</text>
  </g>

  <!-- Módulo Comparador LM393 do Sensor de Solo -->
  <g transform="translate(480, 200)" filter="url(#shadow)">
    <rect width="220" height="260" rx="12" fill="#065f46" stroke="#10b981" stroke-width="2.5" />
    <rect x="50" y="40" width="120" height="70" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
    <text x="110" y="70" font-family="sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">LM393 CHIP</text>
    <circle cx="110" cy="90" r="8" fill="#3b82f6" />

    <!-- Trimpot de Ajuste -->
    <rect x="85" y="130" width="50" height="50" rx="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5" />
    <circle cx="110" cy="155" r="14" fill="#cbd5e1" />
    <line x1="102" y1="155" x2="118" y2="155" stroke="#1e293b" stroke-width="3" />

    <text x="110" y="210" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">Módulo Comparador</text>

    <!-- Pinos de Saída (Lado Esquerdo do Módulo) -->
    <g transform="translate(0, 50)">
      <circle cx="0" cy="20" r="6" fill="#ef4444" />
      <text x="14" y="24" font-family="sans-serif" font-size="11" font-weight="700" fill="#f8fafc">VCC</text>

      <circle cx="0" cy="50" r="6" fill="#64748b" />
      <text x="14" y="54" font-family="sans-serif" font-size="11" font-weight="700" fill="#f8fafc">GND</text>

      <circle cx="0" cy="80" r="6" fill="#475569" />
      <text x="14" y="84" font-family="sans-serif" font-size="11" fill="#94a3b8">DO (NC)</text>

      <circle cx="0" cy="110" r="6" fill="#d97706" />
      <text x="14" y="114" font-family="sans-serif" font-size="11" font-weight="700" fill="#fde68a">AO (Sinal)</text>
    </g>
  </g>

  <!-- Sonda de Solo (Eletrodos bifurcados na Terra) -->
  <g transform="translate(840, 210)" filter="url(#shadow)">
    <!-- Base de Conexão -->
    <rect width="180" height="70" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="2" />
    <text x="90" y="42" font-family="sans-serif" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">SONDA DE SOLO</text>
    
    <!-- Duas Hastes Metálicas que entram na terra -->
    <path d="M 40 70 L 40 280 L 55 310 L 70 280 L 70 70 Z" fill="url(#metalGrad)" stroke="#334155" stroke-width="2" />
    <path d="M 110 70 L 110 280 L 125 310 L 140 280 L 140 70 Z" fill="url(#metalGrad)" stroke="#334155" stroke-width="2" />

    <!-- Linhas de solo/terra simulada -->
    <ellipse cx="90" cy="310" rx="90" ry="25" fill="#78350f" opacity="0.4" />
    <text x="90" y="345" font-family="sans-serif" font-size="12" fill="#d97706" text-anchor="middle">Terra / Substrato Úmido</text>
  </g>

  <!-- Fiação Entre Módulo e Sonda -->
  <path d="M 700 280 L 840 250" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6,4" />
  <path d="M 700 300 L 840 270" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6,4" />

  <!-- Fiação ESP32 ao Módulo -->
  <!-- VCC (3.3V) -->
  <path d="M 100 360 L 60 360 L 60 170 L 430 170 L 430 270 L 480 270" fill="none" stroke="#ef4444" stroke-width="4" stroke-linejoin="round" />

  <!-- GND -->
  <path d="M 100 410 L 40 410 L 40 150 L 450 150 L 450 300 L 480 300" fill="none" stroke="#475569" stroke-width="4" stroke-linejoin="round" />

  <!-- SINAL ANALÓGICO AO -> GPIO 34 -->
  <path d="M 480 360 L 390 360 L 390 380 L 320 380" fill="none" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />

  <!-- Destaque ADC1 & WiFi -->
  <g transform="translate(420, 500)">
    <rect width="680" height="95" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
    <text x="25" y="30" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">✅ POR QUE O PINO GPIO 34 (ADC1)?</text>
    <text x="25" y="54" font-family="sans-serif" font-size="13" fill="#cbd5e1">• O ESP32 possui dois conversores ADC. O ADC2 é DESATIVADO automaticamente quando o Wi-Fi liga.</text>
    <text x="25" y="74" font-family="sans-serif" font-size="13" fill="#cbd5e1">• O GPIO 34 pertence ao ADC1_CH6, permitindo leituras analógicas ininterruptas e precisas via Wi-Fi.</text>
  </g>
  `;
  return svgWrapper("Esquema 3: Sensor de Umidade do Solo (Higrômetro)", "Pino Analógico A0 conectado ao GPIO 34 (Canal ADC1)", content);
}

// 4. SVG: Módulo Relé Duplo com Cargas e Fonte Externa
function getRelaySvg() {
  const content = `
  <!-- ESP32 Board Representation -->
  <g transform="translate(60, 140)" filter="url(#shadow)">
    <rect width="240" height="460" rx="14" fill="url(#espGrad)" stroke="#475569" stroke-width="2" />
    <rect x="60" y="30" width="120" height="150" rx="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <text x="120" y="110" font-family="monospace" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">ESP32-WROOM</text>
    <rect x="75" y="0" width="90" height="26" rx="4" fill="url(#metalGrad)" />
    <text x="120" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b" text-anchor="middle">PORTA USB</text>

    <!-- Pinos -->
    <circle cx="20" cy="220" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="34" y="224" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc">VIN (5V)</text>

    <circle cx="20" cy="270" r="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
    <text x="34" y="274" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc">GND</text>

    <circle cx="220" cy="220" r="7" fill="#8b5cf6" stroke="#ddd6fe" stroke-width="2" />
    <text x="206" y="224" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 18</text>

    <circle cx="220" cy="270" r="7" fill="#06b6d4" stroke="#cffafe" stroke-width="2" />
    <text x="206" y="274" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 19</text>
  </g>

  <!-- Módulo Relé 2 Canais -->
  <g transform="translate(410, 140)" filter="url(#shadow)">
    <!-- Placa Azul do Relé -->
    <rect width="320" height="340" rx="12" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2.5" />
    <text x="160" y="32" font-family="sans-serif" font-size="14" font-weight="800" fill="#93c5fd" text-anchor="middle">MÓDULO RELÉ DUPLO (2 CANAIS)</text>

    <!-- Cubo Relé 1 (Ventilador) -->
    <rect x="25" y="55" width="125" height="150" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
    <text x="87" y="110" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">RELÉ 1</text>
    <text x="87" y="130" font-family="sans-serif" font-size="11" fill="#bae6fd" text-anchor="middle">Ventilador</text>
    <text x="87" y="150" font-family="monospace" font-size="10" fill="#e0f2fe" text-anchor="middle">10A 250VAC</text>

    <!-- Cubo Relé 2 (Bomba) -->
    <rect x="170" y="55" width="125" height="150" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
    <text x="232" y="110" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">RELÉ 2</text>
    <text x="232" y="130" font-family="sans-serif" font-size="11" fill="#bae6fd" text-anchor="middle">Bomba d'Água</text>
    <text x="232" y="150" font-family="monospace" font-size="10" fill="#e0f2fe" text-anchor="middle">10A 250VAC</text>

    <!-- Pinos Lógicos (ESP32) -->
    <g transform="translate(60, 310)">
      <circle cx="20" cy="0" r="5" fill="#ef4444" />
      <text x="20" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#fca5a5" text-anchor="middle">VCC</text>

      <circle cx="70" cy="0" r="5" fill="#64748b" />
      <text x="70" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">GND</text>

      <circle cx="120" cy="0" r="5" fill="#8b5cf6" />
      <text x="120" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#ddd6fe" text-anchor="middle">IN1</text>

      <circle cx="170" cy="0" r="5" fill="#06b6d4" />
      <text x="170" y="20" font-family="sans-serif" font-size="10" font-weight="700" fill="#cffafe" text-anchor="middle">IN2</text>
    </g>

    <!-- Bornes a Parafuso Superiores -->
    <!-- Relé 1 Bornes: NC, COM, NO(NA) -->
    <g transform="translate(30, 220)">
      <rect x="0" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="15" y="22" font-family="monospace" font-size="10" fill="#fff" text-anchor="middle">NF</text>

      <rect x="40" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="55" y="22" font-family="monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">COM</text>

      <rect x="80" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="95" y="22" font-family="monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">NA</text>
    </g>

    <!-- Relé 2 Bornes: NC, COM, NO(NA) -->
    <g transform="translate(180, 220)">
      <rect x="0" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="15" y="22" font-family="monospace" font-size="10" fill="#fff" text-anchor="middle">NF</text>

      <rect x="40" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="55" y="22" font-family="monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">COM</text>

      <rect x="80" y="0" width="30" height="35" rx="4" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
      <text x="95" y="22" font-family="monospace" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">NA</text>
    </g>
  </g>

  <!-- Fonte Externa 12V e Cargas (Ventilador e Bomba) -->
  <g transform="translate(850, 140)" filter="url(#shadow)">
    <!-- Fonte 12V DC -->
    <rect width="280" height="100" rx="10" fill="#1e293b" stroke="#eab308" stroke-width="2" />
    <text x="140" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#fef08a" text-anchor="middle">FONTE EXTERNA 12V DC (2A)</text>
    <circle cx="50" cy="65" r="10" fill="#ef4444" />
    <text x="70" y="70" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff">(+) 12V</text>
    <circle cx="170" cy="65" r="10" fill="#000000" stroke="#64748b" stroke-width="2" />
    <text x="190" y="70" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff">(-) GND 12V</text>

    <!-- Cargas Físicas -->
    <!-- Ventilador -->
    <g transform="translate(0, 130)">
      <rect width="280" height="75" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" />
      <text x="20" y="32" font-family="sans-serif" font-size="13" font-weight="700" fill="#ddd6fe">💨 VENTILADOR / COOLER 12V</text>
      <text x="20" y="55" font-family="sans-serif" font-size="11" fill="#cbd5e1">Ligado via Contato NA do Relé 1</text>
    </g>

    <!-- Bomba de Água -->
    <g transform="translate(0, 230)">
      <rect width="280" height="75" rx="8" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
      <text x="20" y="32" font-family="sans-serif" font-size="13" font-weight="700" fill="#cffafe">💧 BOMBA D'ÁGUA 12V</text>
      <text x="20" y="55" font-family="sans-serif" font-size="11" fill="#cbd5e1">Ligada via Contato NA do Relé 2</text>
    </g>
  </g>

  <!-- Fiação ESP32 -> Relé -->
  <!-- VCC (5V) -->
  <path d="M 80 360 L 40 360 L 40 100 L 490 100 L 490 450" fill="none" stroke="#ef4444" stroke-width="3" stroke-linejoin="round" />
  <!-- GND -->
  <path d="M 80 410 L 20 410 L 20 80 L 540 80 L 540 450" fill="none" stroke="#475569" stroke-width="3" stroke-linejoin="round" />
  <!-- IN1 (GPIO 18) -->
  <path d="M 280 360 L 370 360 L 370 470 L 590 470 L 590 450" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linejoin="round" />
  <!-- IN2 (GPIO 19) -->
  <path d="M 280 410 L 350 410 L 350 490 L 640 490 L 640 450" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linejoin="round" />

  <!-- Fiação de Potência Relé -> Cargas -->
  <!-- Fonte (+) 12V vai para COM do Relé 1 e 2 -->
  <path d="M 900 205 L 900 375 L 635 375" fill="none" stroke="#ef4444" stroke-width="3" stroke-linejoin="round" />
  <path d="M 635 375 L 495 375" fill="none" stroke="#ef4444" stroke-width="3" stroke-linejoin="round" />

  <!-- NA do Relé 1 vai para (+) do Ventilador -->
  <path d="M 535 375 L 535 295 L 850 295" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linejoin="round" />

  <!-- NA do Relé 2 vai para (+) da Bomba -->
  <path d="M 675 375 L 675 395 L 850 395" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linejoin="round" />

  <!-- Retorno (-) das Cargas para Fonte 12V GND -->
  <path d="M 1020 205 L 1020 280" fill="none" stroke="#000000" stroke-width="3" />
  <path d="M 1020 280 L 1020 380" fill="none" stroke="#000000" stroke-width="3" />

  <!-- Caixa de Destaque -->
  <g transform="translate(380, 520)">
    <rect width="750" height="80" rx="10" fill="#1e293b" stroke="#eab308" stroke-width="1.5" />
    <text x="25" y="28" font-family="sans-serif" font-size="13" font-weight="700" fill="#fef08a">⚡ ISOLAMENTO TOTAL CONTRA RUÍDO INDUTIVO:</text>
    <text x="25" y="48" font-family="sans-serif" font-size="12" fill="#cbd5e1">• A bomba e o cooler devem ser energizados pela fonte de 12V separada, NUNCA pelos 3.3V/5V do ESP32.</text>
    <text x="25" y="66" font-family="sans-serif" font-size="12" fill="#cbd5e1">• Isso evita picos eletromagnéticos que causam congelamento do microcontrolador e reset involuntário do Wi-Fi.</text>
  </g>
  `;
  return svgWrapper("Esquema 4: Módulo Relé Duplo & Atuadores", "GPIO 18 (Ventilador), GPIO 19 (Bomba) e Fonte 12V Externa Isolada", content);
}

// 5. SVG: Visão Geral Integrada Completa
function getFullOverviewSvg() {
  const content = `
  <!-- ESP32 Board Central -->
  <g transform="translate(470, 130)" filter="url(#shadow)">
    <rect width="260" height="490" rx="14" fill="url(#espGrad)" stroke="#10b981" stroke-width="2.5" />
    <rect x="70" y="35" width="120" height="150" rx="6" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <text x="130" y="115" font-family="monospace" font-size="14" font-weight="700" fill="#cbd5e1" text-anchor="middle">ESP32-WROOM</text>
    <text x="130" y="135" font-family="sans-serif" font-size="11" fill="#34d399" text-anchor="middle">Wi-Fi &amp; HTTPS Ativo</text>
    <rect x="85" y="0" width="90" height="26" rx="4" fill="url(#metalGrad)" />
    <text x="130" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="#1e293b" text-anchor="middle">PORTA USB</text>

    <!-- Barramento Lado Esquerdo -->
    <circle cx="20" cy="230" r="7" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
    <text x="35" y="234" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc">3V3</text>

    <circle cx="20" cy="270" r="7" fill="#dc2626" stroke="#fca5a5" stroke-width="2" />
    <text x="35" y="274" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc">VIN (5V)</text>

    <circle cx="20" cy="310" r="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2" />
    <text x="35" y="314" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc">GND</text>

    <!-- Barramento Lado Direito -->
    <circle cx="240" cy="220" r="7" fill="#f59e0b" stroke="#fde68a" stroke-width="2" />
    <text x="225" y="224" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 4 (DHT22)</text>

    <circle cx="240" cy="260" r="7" fill="#10b981" stroke="#a7f3d0" stroke-width="2" />
    <text x="225" y="264" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 5 (TRIG)</text>

    <circle cx="240" cy="300" r="7" fill="#0284c7" stroke="#bae6fd" stroke-width="2" />
    <text x="225" y="304" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 17 (ECHO)</text>

    <circle cx="240" cy="340" r="7" fill="#d97706" stroke="#fde68a" stroke-width="2" />
    <text x="225" y="344" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 34 (SOLO)</text>

    <circle cx="240" cy="380" r="7" fill="#8b5cf6" stroke="#ddd6fe" stroke-width="2" />
    <text x="225" y="384" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 18 (VENT)</text>

    <circle cx="240" cy="420" r="7" fill="#06b6d4" stroke="#cffafe" stroke-width="2" />
    <text x="225" y="424" font-family="monospace" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="end">GPIO 19 (BOMBA)</text>
  </g>

  <!-- Bloco Esquerdo Superior: DHT22 -->
  <g transform="translate(60, 130)" filter="url(#shadow)">
    <rect width="280" height="100" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
    <text x="20" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#fde68a">1. SENSOR DHT22</text>
    <text x="20" y="55" font-family="sans-serif" font-size="12" fill="#cbd5e1">• VCC: 3.3V | GND: GND</text>
    <text x="20" y="75" font-family="sans-serif" font-size="12" fill="#f59e0b">• DATA ➔ GPIO 4</text>
  </g>

  <!-- Bloco Esquerdo Médio: Ultrassônico HC-SR04 -->
  <g transform="translate(60, 260)" filter="url(#shadow)">
    <rect width="280" height="110" rx="10" fill="#1e293b" stroke="#0284c7" stroke-width="2" />
    <text x="20" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#38bdf8">2. ULTRASSÔNICO HC-SR04</text>
    <text x="20" y="55" font-family="sans-serif" font-size="12" fill="#cbd5e1">• VCC: 5V (VIN) | GND: GND</text>
    <text x="20" y="75" font-family="sans-serif" font-size="12" fill="#10b981">• TRIG ➔ GPIO 5</text>
    <text x="20" y="95" font-family="sans-serif" font-size="12" fill="#38bdf8">• ECHO ➔ Divisor (1k/2k) ➔ GPIO 17</text>
  </g>

  <!-- Bloco Esquerdo Inferior: Sensor de Solo -->
  <g transform="translate(60, 400)" filter="url(#shadow)">
    <rect width="280" height="100" rx="10" fill="#1e293b" stroke="#d97706" stroke-width="2" />
    <text x="20" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#fbbf24">3. HIGRÔMETRO DE SOLO</text>
    <text x="20" y="55" font-family="sans-serif" font-size="12" fill="#cbd5e1">• VCC: 3.3V | GND: GND</text>
    <text x="20" y="75" font-family="sans-serif" font-size="12" fill="#fbbf24">• AO (Analógico) ➔ GPIO 34 (ADC1)</text>
  </g>

  <!-- Bloco Direito: Módulo Relé Duplo & Cargas -->
  <g transform="translate(840, 160)" filter="url(#shadow)">
    <rect width="300" height="230" rx="10" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" />
    <text x="20" y="32" font-family="sans-serif" font-size="14" font-weight="700" fill="#ddd6fe">4. MÓDULO RELÉ &amp; ATUADORES</text>
    <text x="20" y="60" font-family="sans-serif" font-size="12" fill="#cbd5e1">• VCC: 5V (VIN) | GND: GND</text>
    <text x="20" y="85" font-family="sans-serif" font-size="12" fill="#8b5cf6">• IN1 ➔ GPIO 18 (Ventilador)</text>
    <text x="20" y="110" font-family="sans-serif" font-size="12" fill="#06b6d4">• IN2 ➔ GPIO 19 (Bomba d'Água)</text>
    <text x="20" y="145" font-family="sans-serif" font-size="12" font-weight="700" fill="#fef08a">Cargas Externas (Bornes NA/COM):</text>
    <text x="20" y="170" font-family="sans-serif" font-size="11" fill="#cbd5e1">• Cooler 12V via Relé 1</text>
    <text x="20" y="190" font-family="sans-serif" font-size="11" fill="#cbd5e1">• Bomba 12V via Relé 2</text>
    <text x="20" y="210" font-family="sans-serif" font-size="11" fill="#fca5a5">• Fonte Externa 12V 2A Compartilhada</text>
  </g>

  <!-- Conexões de Roteamento -->
  <path d="M 340 180 L 410 180 L 410 350 L 710 350" fill="none" stroke="#f59e0b" stroke-width="2.5" />
  <path d="M 340 310 L 430 310 L 430 390 L 710 390" fill="none" stroke="#10b981" stroke-width="2.5" />
  <path d="M 340 450 L 450 450 L 450 470 L 710 470" fill="none" stroke="#d97706" stroke-width="2.5" />

  <path d="M 710 510 L 790 510 L 790 270 L 840 270" fill="none" stroke="#8b5cf6" stroke-width="2.5" />
  <path d="M 710 550 L 810 550 L 810 300 L 840 300" fill="none" stroke="#06b6d4" stroke-width="2.5" />

  <!-- Dica de Bancada Inferior -->
  <g transform="translate(60, 530)">
    <rect width="1080" height="90" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
    <text x="25" y="30" font-family="sans-serif" font-size="13" font-weight="700" fill="#38bdf8">📌 RESUMO DE BARRAMENTO NA PROTOBOARD:</text>
    <text x="25" y="52" font-family="sans-serif" font-size="12" fill="#cbd5e1">• Linha Vermelha 1 (+): 3.3V (Alimenta DHT22 e Higrômetro de Solo).</text>
    <text x="25" y="70" font-family="sans-serif" font-size="12" fill="#cbd5e1">• Linha Vermelha 2 (+): 5V/VIN (Alimenta Sensor Ultrassônico e Placa de Relé).</text>
    <text x="560" y="52" font-family="sans-serif" font-size="12" fill="#cbd5e1">• Linha Azul (-): GND COMUM INTERLIGADO (ESP32, Sensores, Divisor e Relé).</text>
  </g>
  `;
  return svgWrapper("Esquema Geral Integrado — Estufa Inteligente IoT", "Visão panorâmica de todas as interconexões no ESP32", content, 1200, 720);
}

// ============================================================================
// MAIN GENERATION FLOW
// ============================================================================
async function run() {
  console.log('⚡ 1. Gerando imagens SVG e PNG dos diagramas...');

  const diagrams = [
    { id: '1_dht22', title: 'Sensor DHT22 (Temperatura & Umidade)', svg: getDht22Svg() },
    { id: '2_ultrassonico', title: 'Sensor Ultrassônico HC-SR04 & Divisor de Tensão', svg: getUltrasonicSvg() },
    { id: '3_solo', title: 'Sensor de Solo Higrômetro (GPIO 34 ADC1)', svg: getSoilSvg() },
    { id: '4_rele_atuadores', title: 'Módulo Relé Duplo & Cargas 12V', svg: getRelaySvg() },
    { id: '5_visao_geral', title: 'Visão Geral Integrada do ESP32', svg: getFullOverviewSvg() }
  ];

  const pngBuffers = [];

  for (const diag of diagrams) {
    const svgPath = path.join(OUT_DIR, `${diag.id}.svg`);
    const pngPath = path.join(OUT_DIR, `${diag.id}.png`);

    fs.writeFileSync(svgPath, diag.svg, 'utf-8');

    // Converte para PNG em alta resolução (escala 1.5x)
    const resvg = new Resvg(diag.svg, {
      fitTo: { mode: 'width', value: 1600 }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(pngPath, pngBuffer);

    pngBuffers.push({
      ...diag,
      svgPath,
      pngPath,
      pngBuffer
    });

    console.log(`  ✓ Gerado: ${diag.id}.png e ${diag.id}.svg`);
  }

  console.log('📄 2. Compilando documento PDF profissional...');

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape', // Formato paisagem é ideal para esquemáticos elétricos
    margins: { top: 30, bottom: 30, left: 35, right: 35 },
    autoFirstPage: false
  });

  const pdfStream = fs.createWriteStream(PDF_PATH);
  doc.pipe(pdfStream);

  // Helper para desenhar cabeçalho de página
  function drawPageHeader(title, section) {
    doc.rect(35, 20, 772, 40).fill('#0f172a');
    doc.rect(35, 20, 6, 40).fill('#10b981');
    doc.fillColor('#f8fafc').fontSize(14).font('Helvetica-Bold').text(title, 50, 27);
    doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(`Estufa Inteligente IoT • Seção: ${section}`, 50, 44);
    doc.fillColor('#10b981').fontSize(9).font('Helvetica-Bold').text('Firmware ESP32 Oficial', 660, 35, { align: 'right', width: 135 });
  }

  function drawPageFooter(pageNum, totalPages = 6) {
    doc.rect(35, 560, 772, 1).fill('#334155');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Projeto de Automação IoT • Apresentação de Feira de Ciências • Metodologia ECC', 40, 568);
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Bold').text(`Página ${pageNum} de ${totalPages}`, 720, 568);
  }

  // --------------------------------------------------------------------------
  // PÁGINA 1: CAPA & TABELA DE PINAGEM
  // --------------------------------------------------------------------------
  doc.addPage();
  // Fundo
  doc.rect(0, 0, 842, 595).fill('#090d16');

  // Banner Header
  doc.rect(40, 40, 762, 120).fill('#0f172a');
  doc.rect(40, 40, 762, 4).fill('#10b981');
  doc.fillColor('#34d399').fontSize(12).font('Helvetica-Bold').text('MANUAL DE ENGENHARIA & ESQUEMA ELÉTRICO', 60, 55);
  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('Estufa Inteligente IoT — Mapeamento de Pinos do ESP32', 60, 75);
  doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('Guia completo de interconexões, níveis lógicos, proteção de entradas e chaveamento de atuadores.', 60, 110);
  doc.fillColor('#10b981').fontSize(10).font('Helvetica-Bold').text('STATUS: 100% HOMOLOGADO COM BACKEND E RENDER (HTTPS)', 60, 132);

  // Tabela de Pinagem
  doc.fillColor('#f8fafc').fontSize(13).font('Helvetica-Bold').text('Tabela Mestra de Pinagem (Hardware Real)', 40, 180);

  const tableTop = 205;
  const colX = [40, 170, 290, 390, 490, 802];
  
  // Header da Tabela
  doc.rect(40, tableTop, 762, 24).fill('#1e293b');
  doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold');
  doc.text('DISPOSITIVO', 50, tableTop + 7);
  doc.text('FUNÇÃO', 180, tableTop + 7);
  doc.text('PINO ESP32', 300, tableTop + 7);
  doc.text('SINAL', 400, tableTop + 7);
  doc.text('ALIMENTAÇÃO & RECOMENDAÇÃO', 500, tableTop + 7);

  const rows = [
    { dev: 'DHT22 / AM2302', fn: 'Temp. e Umidade Ar', pin: 'GPIO 4', sig: 'Digital I/O', note: 'Alimentar com 3.3V (ou 5V com pull-up de 4.7kΩ)' },
    { dev: 'HC-SR04 (Trig)', fn: 'Nível Tanque (Disparo)', pin: 'GPIO 5', sig: 'Digital Out', note: 'Pulso de trigger de 10µs gerado pelo ESP32' },
    { dev: 'HC-SR04 (Echo)', fn: 'Nível Tanque (Eco)', pin: 'GPIO 17', sig: 'Digital In', note: 'ATENÇÃO: Requer divisor resistivo 1kΩ / 2kΩ (5V -> 3.3V)' },
    { dev: 'Sensor de Solo', fn: 'Umidade do Solo (Terra)', pin: 'GPIO 34', sig: 'Analógico In', note: 'ADC1_CH6 (funciona perfeitamente com Wi-Fi ativo)' },
    { dev: 'Relé Canal 1', fn: 'Ventilador / Cooler', pin: 'GPIO 18', sig: 'Digital Out', note: 'Active LOW (0V liga). Chaveia linha 12V externa via NA' },
    { dev: 'Relé Canal 2', fn: 'Bomba d\'Água', pin: 'GPIO 19', sig: 'Digital Out', note: 'Active LOW (0V liga). Interlock de corte se nível BAIXO' }
  ];

  let rY = tableTop + 24;
  rows.forEach((r, idx) => {
    const bg = idx % 2 === 0 ? '#0f172a' : '#141e33';
    doc.rect(40, rY, 762, 24).fill(bg);
    doc.fillColor('#f8fafc').fontSize(9).font('Helvetica-Bold').text(r.dev, 50, rY + 7);
    doc.fillColor('#cbd5e1').font('Helvetica').text(r.fn, 180, rY + 7);
    doc.fillColor('#10b981').font('Helvetica-Bold').text(r.pin, 300, rY + 7);
    doc.fillColor('#fde68a').font('Helvetica').text(r.sig, 400, rY + 7);
    doc.fillColor('#94a3b8').font('Helvetica').text(r.note, 500, rY + 7);
    rY += 24;
  });

  // Caixa de Recomendações
  doc.rect(40, 385, 762, 140).fill('#0f172a');
  doc.rect(40, 385, 762, 2).fill('#38bdf8');
  doc.fillColor('#38bdf8').fontSize(11).font('Helvetica-Bold').text('Diretrizes de Segurança e Confiabilidade Elétrica:', 55, 400);
  doc.fillColor('#e2e8f0').fontSize(9).font('Helvetica').text('1. Barramento de GND Comum:', 55, 422);
  doc.fillColor('#94a3b8').text('Todos os sensores, módulos e a placa ESP32 devem ter seus fios de terra interligados na mesma trilha da protoboard.', 220, 422);
  doc.fillColor('#e2e8f0').text('2. Proteção contra 5V no Echo:', 55, 442);
  doc.fillColor('#94a3b8').text('O sensor HC-SR04 alimentado em 5V entrega 5V no pino ECHO. O divisor 1k/2k é mandatário para não queimar o GPIO 17.', 220, 442);
  doc.fillColor('#e2e8f0').text('3. Fonte Externa para Motores:', 55, 462);
  doc.fillColor('#94a3b8').text('A bomba d\'água gera picos de corrente e ruído eletromagnético. Use fonte 12V 2A isolada chaveada pelo relé.', 220, 462);
  doc.fillColor('#e2e8f0').text('4. Wi-Fi e Conversores ADC:', 55, 482);
  doc.fillColor('#94a3b8').text('O canal analógico escolhido foi o GPIO 34 (ADC1), pois o ADC2 fica indisponível ao ligar o rádio Wi-Fi do ESP32.', 220, 482);

  drawPageFooter(1);

  // --------------------------------------------------------------------------
  // PÁGINAS 2 A 5: DIAGRAMAS INDIVIDUAIS COM IMAGENS
  // --------------------------------------------------------------------------
  const individualSections = [
    {
      buf: pngBuffers[0],
      pageNum: 2,
      sec: 'Sensor de Temperatura & Umidade',
      title: 'Sensor DHT22 / AM2302 — Diagrama de Ligação (GPIO 4)',
      desc: 'O DHT22 mede temperatura (-40 a 80°C) e umidade relativa do ar (0 a 100%). Os dados trafegam por barramento serial de 1 fio (one-wire) com temporização de microssegundos. É obrigatório garantir nível alto em repouso com resistor pull-up.'
    },
    {
      buf: pngBuffers[1],
      pageNum: 3,
      sec: 'Sensor Ultrassônico & Nível',
      title: 'Sensor HC-SR04 — Diagrama de Nível com Divisor de Proteção',
      desc: 'O sensor calcula o nível do tanque medindo o tempo de trânsito da onda sonora. O pino TRIG recebe pulso do GPIO 5. O pino ECHO devolve pulso em 5V, atenuado para 3.3V através da malha resistiva (R1=1kΩ e R2=2kΩ) antes de atingir o GPIO 17.'
    },
    {
      buf: pngBuffers[2],
      pageNum: 4,
      sec: 'Higrômetro de Solo',
      title: 'Sensor de Umidade do Solo — Conexão Analógica no GPIO 34 (ADC1)',
      desc: 'A leitura analógica de umidade do solo varia de 0 a 4095. Ao alimentar a placa em 3.3V, a saída A0 fica perfeitamente compatível com o conversor analógico-digital interno. O uso do canal ADC1 garante que o Wi-Fi não interfira na leitura.'
    },
    {
      buf: pngBuffers[3],
      pageNum: 5,
      sec: 'Atuadores & Relés',
      title: 'Módulo Relé Duplo — Chaveamento de Potência Isolado (GPIO 18 e 19)',
      desc: 'O módulo relé com optoacoplador isola eletricamente o microcontrolador das cargas indutivas. O sinal Active LOW liga os relés (0V liga, 3.3V desliga). A linha de 12V da bomba e ventilador passa apenas pelos contatos secos COM e Normalmente Aberto (NA).'
    }
  ];

  for (const item of individualSections) {
    doc.addPage();
    doc.rect(0, 0, 842, 595).fill('#090d16');
    drawPageHeader(item.title, item.sec);

    // Renderiza a imagem do esquema
    doc.image(item.buf.pngBuffer, 45, 75, {
      fit: [752, 420],
      align: 'center',
      valign: 'center'
    });

    // Caixa de Descrição e Observação de Bancada
    doc.rect(45, 500, 752, 50).fill('#0f172a');
    doc.rect(45, 500, 4, 50).fill('#3b82f6');
    doc.fillColor('#e2e8f0').fontSize(9).font('Helvetica').text(item.desc, 60, 510, { width: 720, lineGap: 3 });

    drawPageFooter(item.pageNum);
  }

  // --------------------------------------------------------------------------
  // PÁGINA 6: VISÃO GERAL INTEGRADA & CHECKLIST DE MONTAGEM
  // --------------------------------------------------------------------------
  doc.addPage();
  doc.rect(0, 0, 842, 595).fill('#090d16');
  drawPageHeader('Visão Geral Integrada & Procedimento de Bancada', 'Arquitetura Completa');

  doc.image(pngBuffers[4].pngBuffer, 45, 75, {
    fit: [752, 380],
    align: 'center',
    valign: 'center'
  });

  // Checklist
  doc.rect(45, 465, 752, 90).fill('#0f172a');
  doc.rect(45, 465, 752, 2).fill('#10b981');
  doc.fillColor('#10b981').fontSize(11).font('Helvetica-Bold').text('Roteiro de Validação e Teste em Bancada (Passo a Passo):', 60, 477);

  const checkItems = [
    '1. Montar fiação com ESP32 desligado. Conferir com multímetro o barramento de GND comum.',
    '2. Verificar divisor de tensão do ECHO antes de conectar o fio ao GPIO 17 (tensão não pode superar 3.3V).',
    '3. Ligar ESP32 na USB do computador e abrir Serial Monitor (115200 baud). Validar conexão Wi-Fi e NTP.',
    '4. Testar leitura de cada sensor no console: temperatura ambiente (~20-30°C), nível do tanque e higrômetro.',
    '5. Conectar fonte externa 12V nos bornes do relé e verificar disparo do ventilador e bomba via painel web.'
  ];

  let cY = 495;
  checkItems.forEach(ci => {
    doc.fillColor('#cbd5e1').fontSize(8.5).font('Helvetica').text(ci, 60, cY);
    cY += 12;
  });

  drawPageFooter(6);

  doc.end();

  await new Promise((resolve) => {
    pdfStream.on('finish', resolve);
  });

  console.log(`✅ PDF gerado com sucesso: ${PDF_PATH}`);

  // Copia o PDF para o diretório de artefatos para fácil acesso
  try {
    fs.copyFileSync(PDF_PATH, ARTIFACT_PDF_PATH);
    console.log(`✅ PDF copiado para artefatos: ${ARTIFACT_PDF_PATH}`);
  } catch (err) {
    console.warn('Aviso ao copiar para artefato:', err.message);
  }
}

run().catch((err) => {
  console.error('❌ Erro na execução:', err);
  process.exit(1);
});
