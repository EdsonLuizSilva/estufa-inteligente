/**
 * ============================================================================
 * Estufa Inteligente IoT - Firmware ESP32 V2 (Modo Local / Rede Wi-Fi Privada)
 * ============================================================================
 * 
 * Versão adaptada para comunicação HTTP direta com o servidor local (Node.js/Express)
 * rodando no seu computador (porta 3001).
 * 
 * Principais diferenças da V1 (Nuvem/Render):
 * 1. Utiliza HTTP simples com `WiFiClient` (sem sobrecarga de SSL/TLS da nuvem).
 * 2. Aponta para o IP local da máquina na rede Wi-Fi (ex: 192.168.0.163:3001).
 * 3. Respostas instantâneas com timeout reduzido (sem latência de sleep do Render).
 * 4. Dispensa sincronização obrigatória de NTP para certificados de segurança.
 * 
 * Hardware Integrado:
 * 1. Sensor DHT22: Temperatura (°C) e Umidade do Ar (%) -> GPIO 4
 * 2. Sensor Ultrassônico (HC-SR04 / JSN-SR04T): Nível do Tanque -> Trig 5, Echo 17
 * 3. Sensor de Umidade do Solo: Higrômetro Analógico -> GPIO 34 (ADC1)
 * 4. Módulo Relé Duplo:
 *    - Ventilador / Cooler -> GPIO 18
 *    - Bomba d'Água de Irrigação -> GPIO 19
 * 
 * Suporte a Controle Manual (Override):
 * Quando o operador clica no painel web local para desligar manualmente o ventilador
 * ou a bomba, o backend retorna a decisão em tempo real e o ESP32 aciona os relés.
 * 
 * Bibliotecas Necessárias (Instalar no Gerenciador da Arduino IDE):
 * - "DHT sensor library" da Adafruit
 * - "ArduinoJson" de Benoît Blanchon (versão 6 ou 7)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ============================================================================
// 1. CONFIGURAÇÕES DE REDE E SERVIDOR LOCAL
// ============================================================================
const char* ssid = "Angela";
const char* password = "edson086";

// ATENÇÃO: Substitua pelo IP local atual do computador onde o servidor Node.js está rodando.
// No Windows, execute 'ipconfig' no terminal para conferir seu "Endereço IPv4".
// Não use 'localhost' aqui porque no ESP32 ele apontaria para o próprio microcontrolador.
const char* serverUrl = "http://192.168.0.163:3001/api/telemetry";

// Intervalo de envio para o servidor local (em milissegundos)
// Em rede local, 3 a 5 segundos proporciona resposta ágil no painel web.
const unsigned long INTERVALO_ENVIO = 3000; // 3 segundos
unsigned long ultimoEnvio = 0;

// ============================================================================
// 2. DEFINIÇÃO DOS PINOS
// ============================================================================
// Sensor DHT22 (Temperatura e Umidade do Ar)
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Sensor Ultrassônico (Nível do Reservatório d'Água)
#define PIN_TRIG 5
#define PIN_ECHO 17

// Sensor de Umidade do Solo (ADC1 - seguro para usar com Wi-Fi ativo)
#define PIN_SOLO 34

// Módulos Relé
#define PIN_RELE_VENTILADOR 18
#define PIN_RELE_BOMBA 19

// Lógica dos Relés: a maioria dos módulos de relé liga em LOW (Active LOW)
// Se o seu módulo ligar com HIGH, altere para 'false'
const bool RELE_ATIVO_LOW = true;

// ============================================================================
// 3. CALIBRAÇÃO DOS SENSORES FÍSICOS
// ============================================================================
// Calibração do Sensor Ultrassônico (em centímetros)
// Ajuste conforme a altura real do seu reservatório:
const float DISTANCIA_TANQUE_CHEIO = 5.0;  // Distância do sensor até a água quando CHEIO
const float DISTANCIA_TANQUE_VAZIO = 20.0; // Distância do sensor até o fundo quando VAZIO

// Calibração do Sensor de Solo (leitura analógica de 0 a 4095)
// No ar seco lê ~4095; na água limpa lê ~3000; na terra úmida/molhada cai para < 2500
const int LIMIAR_SOLO_SECO = 3000;   // Acima de 3000 = SECO
const int LIMIAR_SOLO_UMIDO = 1800;  // Entre 1800 e 3000 = UMIDO | Abaixo de 1800 = MUITO_MOLHADO

// ============================================================================
// 4. FUNÇÕES AUXILIARES DE CONTROLE E SENSORES
// ============================================================================

// Controla os relés respeitando a lógica Active LOW ou HIGH
void acionarRele(int pino, bool ligar) {
  if (RELE_ATIVO_LOW) {
    digitalWrite(pino, ligar ? LOW : HIGH);
  } else {
    digitalWrite(pino, ligar ? HIGH : LOW);
  }
}

// Mede a distância em centímetros usando o sensor ultrassônico
float medirDistanciaUltrassonico() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duracao = pulseIn(PIN_ECHO, HIGH, 30000); // Timeout de 30ms (~5 metros)
  if (duracao == 0) {
    return -1.0; // Leitura inválida / sem eco
  }

  // Velocidade do som: 0.0343 cm/us (ida e volta dividido por 2)
  return (duracao * 0.0343) / 2.0;
}

// Converte a distância do ultrassônico em porcentagem e enum do backend
void processarNivelAgua(String &waterLevel, int &waterPercentage) {
  float distancia = medirDistanciaUltrassonico();

  if (distancia < 0) {
    Serial.println("[AVISO] Ultrassônico sem eco. Mantendo nível padrão de segurança.");
    waterLevel = "MEDIO";
    waterPercentage = 50;
    return;
  }

  // Quanto menor a distância até a água, mais cheio está o tanque
  float pct = (DISTANCIA_TANQUE_VAZIO - distancia) / (DISTANCIA_TANQUE_VAZIO - DISTANCIA_TANQUE_CHEIO) * 100.0;
  waterPercentage = (int)constrain(pct, 0, 100);

  // Classificação conforme o contrato do Backend
  if (waterPercentage < 25) {
    waterLevel = "BAIXO";   // Disparará alarme e interlock de segurança da bomba
  } else if (waterPercentage < 70) {
    waterLevel = "MEDIO";
  } else {
    waterLevel = "CHEIO";
  }

  Serial.printf("[ULTRASSÔNICO] Dist: %.1f cm | Nível: %d%% (%s)\n", 
                distancia, waterPercentage, waterLevel.c_str());
}

// Converte o valor analógico do solo no enum esperado pelo backend
String processarUmidadeSolo() {
  int valorRaw = analogRead(PIN_SOLO);

  String status;
  if (valorRaw > LIMIAR_SOLO_SECO) {
    status = "SECO";
  } else if (valorRaw > LIMIAR_SOLO_UMIDO) {
    status = "UMIDO";
  } else {
    status = "MUITO_MOLHADO";
  }

  Serial.printf("[SOLO] Raw: %d -> Status: %s\n", valorRaw, status.c_str());
  return status;
}

// ============================================================================
// 5. SETUP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==================================================");
  Serial.println("  Estufa Inteligente IoT - Firmware ESP32 V2      ");
  Serial.println("  Modo de Operação: Servidor Local (HTTP Direto) ");
  Serial.println("==================================================");

  // Configuração dos Pinos dos Relés
  pinMode(PIN_RELE_VENTILADOR, OUTPUT);
  pinMode(PIN_RELE_BOMBA, OUTPUT);
  acionarRele(PIN_RELE_VENTILADOR, false);
  acionarRele(PIN_RELE_BOMBA, false);

  // Configuração dos Sensores
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  dht.begin();

  // Conexão Wi-Fi
  Serial.printf("Conectando à rede Wi-Fi '%s'...", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 30) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Conectado com sucesso!");
    Serial.print("[Wi-Fi] IP atribuído ao ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.print("[Servidor Local Destino] ");
    Serial.println(serverUrl);
  } else {
    Serial.println("\n[Wi-Fi] Falha ao conectar. O ESP32 continuará tentando no loop.");
  }
}

// ============================================================================
// 6. LOOP PRINCIPAL
// ============================================================================
void loop() {
  unsigned long agora = millis();

  // Executa o ciclo de leitura e transmissão no intervalo definido
  if (agora - ultimoEnvio >= INTERVALO_ENVIO) {
    ultimoEnvio = agora;

    // Se o Wi-Fi caiu, tenta reconectar
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[Wi-Fi] Desconectado. Tentando reconectar...");
      WiFi.reconnect();
      return;
    }

    // 1. Leituras dos Sensores Físicos
    static float ultimaTemp = 25.0;
    static float ultimaUmid = 60.0;

    float temperatura = dht.readTemperature();
    float umidadeAr = dht.readHumidity();

    if (isnan(temperatura) || isnan(umidadeAr)) {
      Serial.println("[AVISO] Leitura momentânea do DHT22 instável (NaN). Reutilizando último valor válido.");
      temperatura = ultimaTemp;
      umidadeAr = ultimaUmid;
    } else {
      ultimaTemp = temperatura;
      ultimaUmid = umidadeAr;
    }

    String soloStatus = processarUmidadeSolo();
    String waterLevel;
    int waterPercentage;
    processarNivelAgua(waterLevel, waterPercentage);

    Serial.printf("[DHT22] Temperatura: %.1f°C | Umidade Ar: %.1f%%\n", temperatura, umidadeAr);

    // 2. Monta o JSON de envio para o Backend Local
    StaticJsonDocument<256> docEnvio;
    docEnvio["temperature"] = temperatura;
    docEnvio["airHumidity"] = umidadeAr;
    docEnvio["soilStatus"] = soloStatus;
    docEnvio["waterLevel"] = waterLevel;
    docEnvio["waterPercentage"] = waterPercentage;

    String payloadJson;
    serializeJson(docEnvio, payloadJson);

    // 3. Cliente HTTP Simples para Rede Local (Sem overhead SSL)
    WiFiClient client;
    HTTPClient http;
    
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(4000); // 4 segundos de timeout é mais que suficiente na rede local

    Serial.println("[LOCAL] Enviando telemetria para o servidor local...");
    int httpResponseCode = http.POST(payloadJson);

    if (httpResponseCode == 200) {
      String resposta = http.getString();
      Serial.println("[LOCAL] Telemetria entregue e processada com sucesso!");

      // 4. Decodifica a resposta com a decisão da AutomationEngine (incluindo Manual Override)
      StaticJsonDocument<512> docResposta;
      DeserializationError err = deserializeJson(docResposta, resposta);

      if (!err && docResposta.containsKey("actuators")) {
        bool fanOn = docResposta["actuators"]["fanOn"];
        bool waterPumpOn = docResposta["actuators"]["waterPumpOn"];

        // Aciona fisicamente os relés com base na decisão do backend
        acionarRele(PIN_RELE_VENTILADOR, fanOn);
        acionarRele(PIN_RELE_BOMBA, waterPumpOn);

        // Exibe status e modo de operação (AUTO ou FORCE_OFF)
        String fanMode = docResposta["actuators"]["mode"]["fan"] | "AUTO";
        String pumpMode = docResposta["actuators"]["mode"]["waterPump"] | "AUTO";

        Serial.printf("[RELÉS] Ventilador: %s (%s) | Bomba: %s (%s)\n",
                      fanOn ? "LIGADO" : "DESLIGADO",
                      fanMode.c_str(),
                      waterPumpOn ? "LIGADA" : "DESLIGADA",
                      pumpMode.c_str());
      }
    } else {
      Serial.printf("[ERRO LOCAL] Falha na requisição. Código: %d (%s)\n", 
                    httpResponseCode, http.errorToString(httpResponseCode).c_str());
      if (httpResponseCode == -1) {
        Serial.println("[DICA] Conexão recusada/timeout. Verifique se o servidor está rodando no PC e se o Firewall liberou a porta 3001.");
      }
    }

    http.end();
    client.stop(); // Garante liberação imediata do socket TCP no ESP32
    Serial.println("--------------------------------------------------");
  }
}
