/**
 * Estufa Inteligente IoT - Firmware ESP32
 * 
 * Envia as leituras dos sensores para o servidor na nuvem (Render)
 * e recebe imediatamente o comando para acionar os reles do Ventilador e da Bomba d'Agua.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Instalar biblioteca ArduinoJson via Gerenciador de Bibliotecas

// Configurações de Wi-Fi
const char* ssid = "NOME_DO_SEU_WIFI";
const char* password = "SENHA_DO_SEU_WIFI";

// URL do seu servidor no Render (substitua pela sua URL gerada)
const char* serverUrl = "https://SEU-PROJETO.onrender.com/api/telemetry";

// Pinos dos Relés (Atuadores)
const int PIN_RELE_VENTILADOR = 18;
const int PIN_RELE_BOMBA = 19;

// Pinos dos Sensores (Exemplo)
// Pinos analógicos / digitais conforme o seu hardware:
// const int PIN_DHT = 4;
// const int PIN_SOLO = 34;
// const int PIN_NIVEL_AGUA = 35;

void setup() {
  Serial.begin(115200);

  pinMode(PIN_RELE_VENTILADOR, OUTPUT);
  pinMode(PIN_RELE_BOMBA, OUTPUT);

  // Inicializa relés desligados (considere LOW ou HIGH de acordo com seu módulo relé)
  digitalWrite(PIN_RELE_VENTILADOR, LOW);
  digitalWrite(PIN_RELE_BOMBA, LOW);

  // Conecta ao Wi-Fi
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi Conectado com sucesso!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // 1. Leituras dos Sensores (Substitua pelas funções reais dos seus sensores)
    float temp = 28.5;             // Ex: dht.readTemperature();
    float hum = 68.0;              // Ex: dht.readHumidity();
    String solo = "SECO";          // "MUITO_MOLHADO", "UMIDO" ou "SECO"
    String nivelAgua = "CHEIO";    // "CHEIO", "MEDIO" ou "BAIXO"

    // 2. Monta o JSON de envio
    StaticJsonDocument<256> docEnvio;
    docEnvio["temperature"] = temp;
    docEnvio["airHumidity"] = hum;
    docEnvio["soilStatus"] = solo;
    docEnvio["waterLevel"] = nivelAgua;

    String jsonString;
    serializeJson(docEnvio, jsonString);

    Serial.print("Enviando telemetria: ");
    Serial.println(jsonString);

    // 3. Envia POST para a API
    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Resposta do Servidor: " + response);

      // 4. Decodifica a resposta para saber se deve ligar os relés
      StaticJsonDocument<512> docResposta;
      DeserializationError error = deserializeJson(docResposta, response);

      if (!error) {
        bool fanOn = docResposta["actuators"]["fanOn"];
        bool pumpOn = docResposta["actuators"]["waterPumpOn"];

        // Aciona os atuadores conforme decidido pela inteligência do servidor
        digitalWrite(PIN_RELE_VENTILADOR, fanOn ? HIGH : LOW);
        digitalWrite(PIN_RELE_BOMBA, pumpOn ? HIGH : LOW);

        Serial.printf("[ATUADORES] Ventilador: %s | Bomba: %s\n", 
                      fanOn ? "LIGADO" : "DESLIGADO", 
                      pumpOn ? "LIGADA" : "DESLIGADA");
      }
    } else {
      Serial.printf("Erro na requisicao HTTP: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Wi-Fi desconectado. Tentando reconectar...");
    WiFi.reconnect();
  }

  // Intervalo entre leituras (ex: 3 segundos)
  delay(3000);
}
