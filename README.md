# 🌱 EcoTech IoT — Estufa Inteligente & Automação Sustentável

<div align="center">

![EcoTech IoT Banner](https://img.shields.io/badge/EcoTech_IoT-Estufa_Inteligente-059669?style=for-the-badge&logo=leaf&logoColor=white)

**Automação microclimática inteligente, monitoramento em tempo real, interlocks de segurança e alertas via WhatsApp para cultivo protegido.**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![Vitest](https://img.shields.io/badge/Vitest-100%25_Passing-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Explorar Telas](#-cockpit-e-telas-da-aplicação) •
[Novas Funcionalidades](#-novas-funcionalidades-e-destaques) •
[Esquema de Hardware](#-hardware--esquema-de-ligação) •
[Guia Rápido](#-como-executar-o-projeto) •
[Firmware ESP32](#-firmware-esp32-v2) •
[Deploy no Render](#-publicação-na-nuvem-rendercom)

</div>

---

## 📖 Visão Geral do Projeto

O **EcoTech IoT** é um ecossistema completo de automação e sensoriamento microclimático desenvolvido com rigorosa engenharia de software e hardware acessível. Projetado para demonstrações científicas, bancas avaliadoras, feiras de ciências e aplicações agroecológicas reais, o sistema monitora temperatura ambiente, umidade do ar, umidade do solo e volume do reservatório d'água, tomando decisões autônomas de ventilação e irrigação com proteção ativa dos componentes.

Todo o domínio da aplicação segue arquitetura modular desacoplada com **validação estrita de contratos via Zod**, **Test-Driven Development (TDD)** e metodologia **ECC** (*Everything Claude Code* / *Agent Harness System*).

---

## 🚀 Novas Funcionalidades e Destaques

### 🎨 1. Identidade Visual "EcoTech IoT" & Tema Adaptativo (Dark / Light)
- **Branding Premium:** Novo logotipo oficial com grafismo bio-tecnológico combinando folhas vegetais, nós de circuito e microchips.
- **Dark Mode Nativo:** Alternância suave entre temas Claro e Escuro com persistência local e paleta moderna em tons de esmeralda, ciano e ardósia.
- **Glassmorphism & Animações:** Cards com efeito de vidro fosco, sombras dinâmicas e transições suaves em 60 FPS.

### ⚡ 2. Cockpit de Operação com Intervenção Manual (Override)
- **Sensores em Tempo Real:** Leitura instantânea de temperatura (°C), umidade relativa (%) e estado do solo (*Muito Molhado*, *Úmido*, *Seco*).
- **Atuadores com Feedback Visual Ativo:** Pás do ventilador girando dinamicamente e gotas d'água animadas ao irrigar.
- **Controle Manual Instantâneo:** Seletores independentes `Automático` vs `Desligar Forçado` para o ventilador e a bomba de irrigação.
- **Transparência Algorítmica:** Painel explicativo que detalha em português claro a exata regra que motivou o acionamento ou repouso de cada atuador.

### 📊 3. Dashboard Analítico de Séries Históricas
- **Gráficos Reativos com Recharts:** Linhas de tendência temporal para temperatura e umidade com limiares visuais de conforto térmico.
- **Cálculo Científico:** Registro contínuo de picos máximos, mínimos e médias móveis ideais para apresentações acadêmicas e relatórios.

### 💧 4. Visualizador do Reservatório & Interlock Crítico
- **Tanque d'Água 3D/SVG Dinâmico:** Animação de nível com ondas fluidas e cálculo dinâmico de litros restantes e consumidos (base 200 Litros).
- **Interlock de Proteção da Bomba:** Se o reservatório atingir o nível `BAIXO`, o sistema bloqueia preventivamente o motor da irrigação, mesmo que a terra esteja seca, impedindo que a bomba queime trabalhando a seco.

### 📲 5. Central de Alertas WhatsApp com Integração CallMeBot
- **Notificações em Tempo Real:** Disparo imediato de mensagens de emergência no WhatsApp do operador quando a água atinge nível crítico ou falhas ocorrem.
- **Configurador Integrado na UI:** Painel para salvar telefone e API Key diretamente pelo navegador, com persistência segura no backend.
- **Tratamento Inteligente do 9º Dígito Brasileiro:** Algoritmo que detecta e converte automaticamente números celulares do Brasil com ou sem o dígito 9 (+55 XX 9XXXX-XXXX vs +55 XX XXXX-XXXX) para evitar falhas de entrega.
- **Botão de Envio de Teste:** Validação em 1 clique da conexão com o WhatsApp sem precisar esvaziar o tanque físico.
- **Diagnóstico Amigável:** Identifica contas pausadas no CallMeBot e orienta o envio do comando `"resume"`.

### 🎛️ 6. Simulador Interativo de Bancada
- **Demonstração Sem Falhas:** Barra superior recolhível com sliders e botões de controle para simular qualquer condição climática ao vivo.
- Permite demonstrar o acionamento da bomba, ventilador, gráficos e alarmes em locais sem conexão com os sensores físicos ou durante a avaliação da banca.

### ⚙️ 7. Firmware ESP32 V2 (Alta Velocidade Local)
- **Novo Firmware V2 (`esp32/greenhouse_esp32_v2`):** Desenvolvido especificamente para redes Wi-Fi locais privadas via HTTP leve, oferecendo tempos de resposta ultrarrápidos (ciclos de 3 segundos) sem depender de conexões externas.
- **Firmware V1 mantido:** Pronto para conexão com nuvens HTTPS (como Render.com).

### 📐 8. Documentação Técnica & Esquema Elétrico Ilustrado
- **Guia em PDF de Alta Resolução:** Disponível em [`esp32/esquema/Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf`](esp32/esquema/Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf).
- **Diagramas Vetoriais (SVG/PNG):** Ilustrações detalhadas de cada circuito (DHT22, Ultrassônico, Higrômetro e Relés).

---

## 🏗️ Arquitetura do Sistema

```
                  ┌────────────────────────┐
                  │      SENSORES IOT      │
                  │  DHT22 | Solo | HC-SR04│
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │    ESP32 CONTROLLER    │
                  │ (Firmware V2 / C++ INO)│
                  └───────────┬────────────┘
                              │  HTTP POST /api/telemetry (JSON)
                              ▼
┌───────────────────────────────────────────────────────────────┐
│               BACKEND NODE.JS + EXPRESS (API)                 │
│                                                               │
│   ┌─────────────────────┐       ┌─────────────────────────┐   │
│   │ Validação Zod       │ ----> │ Automation Engine (TDD) │   │
│   │ Telemetria & Estado │       │ Interlocks & Overrides  │   │
│   └─────────────────────┘       └────────────┬────────────┘   │
│                                              │                │
│                                              ▼                │
│   ┌─────────────────────┐       ┌─────────────────────────┐   │
│   │ Histórico em Memória│       │ WhatsApp Notifier       │   │
│   │ e Configurações     │       │ CallMeBot API Bridge    │   │
│   └─────────────────────┘       └────────────┬────────────┘   │
└───────────────────────────────┬──────────────┼────────────────┘
                                │              │
              SSE / REST Polling│              │ HTTPS Disparo
                                ▼              ▼
               ┌──────────────────────┐  ┌──────────────┐
               │    PAINEL WEB SPA    │  │   WHATSAPP   │
               │ (React 18 + Tailwind)│  │ DO OPERADOR  │
               └──────────────────────┘  └──────────────┘
```

---

## 🔌 Hardware & Esquema de Ligação

| Componente | Tipo | Pino ESP32 | Descrição da Função |
| :--- | :--- | :--- | :--- |
| **DHT22** | Sensor Digital | `GPIO 4` | Medição de Temperatura (°C) e Umidade do Ar (%) |
| **HC-SR04 / JSN-SR04T** | Sensor Ultrassônico | `Trig: GPIO 5` / `Echo: GPIO 17` | Mede a distância até o nível da água do reservatório |
| **Higrômetro de Solo** | Sensor Analógico | `GPIO 34 (ADC1)` | Mede condutividade do substrato (compatível com Wi-Fi ativo) |
| **Relé 1 (Ventilador)** | Saída Digital | `GPIO 18` | Liga o cooler de exaustão caso a temperatura exceda 28°C |
| **Relé 2 (Bomba d'Água)** | Saída Digital | `GPIO 19` | Aciona a irrigação se o solo estiver seco **E** água segura |

> 📄 **Esquema Completo:** Consulte os diagramas visuais e a tabela detalhada de resistores e alimentação no arquivo [`esp32/esquema/Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf`](esp32/esquema/Esquema_Ligacao_ESP32_Estufa_Inteligente.pdf).

---

## 🖥️ Cockpit e Telas da Aplicação

### 1. Cockpit da Estufa
Apresenta o estado instantâneo do microclima, velocímetros visuais, status do solo e chaves de controle manual dos atuadores com justificativa transparente da automação.

### 2. Dashboard Histórico
Gera gráficos contínuos com séries históricas dos últimos 100 pontos coletados, médias móveis, picos térmicos e limiares de segurança para acompanhamento do ciclo de crescimento das plantas.

### 3. Nível do Reservatório & WhatsApp
Mostrador volumétrico do tanque (0 a 200L), indicadores do sensor ultrassônico, status do interlock de bombeamento e central de configuração e testes do CallMeBot para envio de alertas no WhatsApp.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Git instalado.

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/greenhouse-monitor.git
cd greenhouse-monitor
```

### 2. Instalar Dependências
```bash
# Instala as dependências do backend
npm install

# Instala as dependências do frontend
cd frontend
npm install
cd ..
```

### 3. Iniciar em Modo de Desenvolvimento

**Terminal 1 — Backend (API Express):**
```bash
npm run dev
```
> O servidor iniciará em: `http://localhost:3001`

**Terminal 2 — Frontend (Vite + React):**
```bash
cd frontend
npm run dev
```
> Acesse o painel pelo navegador em: `http://localhost:3000`

---

## 📡 Firmware ESP32 (V2 Local ou V1 Nuvem)

### Usando o Firmware V2 (Recomendado para Feira de Ciências e Demonstrações Locais)
1. Abra a pasta `esp32/greenhouse_esp32_v2/` na **Arduino IDE**.
2. Abra o arquivo `greenhouse_esp32_v2.ino`.
3. Instale as bibliotecas necessárias na Arduino IDE:
   - `DHT sensor library` (Adafruit)
   - `ArduinoJson` (Benoît Blanchon)
4. Ajuste suas credenciais de Wi-Fi e o IP do seu computador na rede local:
   ```cpp
   const char* ssid = "SEU_WIFI";
   const char* password = "SUA_SENHA";
   const char* serverUrl = "http://192.168.0.XXX:3001/api/telemetry";
   ```
5. Conecte o ESP32 via cabo USB, selecione a placa `ESP32 Dev Module` e clique em **Carregar (Upload)**.
6. Abra o **Monitor Serial** em `115200 baud` para acompanhar os envios a cada 3 segundos.

---

## 🌐 Publicação na Nuvem (Render.com)

O repositório já está configurado para deploy automático em serviço unificado e gratuito:

1. Envie seu código para um repositório no **GitHub**.
2. No painel do [Render.com](https://render.com), clique em **New +** ➔ **Web Service**.
3. Selecione seu repositório e configure:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. O Render compilará o frontend React e executará a API Node.js no mesmo domínio com suporte a HTTPS gratuito.

---

## 🧪 Testes Automatizados & Confiabilidade

O motor de decisão do EcoTech IoT foi construído seguindo rigorosamente a metodologia TDD (Test-Driven Development). Todas as regras de negócio e interlocks de emergência possuem testes unitários automatizados com Vitest:

```bash
# Executar a bateria de testes unitários
npm test
```

Principais interlocks cobertos por testes:
- Bloqueio imediato da bomba se `waterLevel === 'BAIXO'`.
- Ativação imediata do ventilador se a temperatura ultrapassar 28°C.
- Acionamento da irrigação quando o solo estiver `SECO` e houver água segura.
- Prevalência das ordens manuais de parada (`FORCE_OFF`) sobre o modo automático.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, Zod, HTTPS CallMeBot Client.
- **Hardware & IoT:** Microcontrolador ESP32 dual-core, DHT22, HC-SR04, Higrômetro capacitivo/analógico, Relés eletromecânicos de canal duplo.
- **Engenharia de Qualidade:** Vitest, TDD, ESLint, Git Workflow.
- **Cloud & Deploy:** Render.com, GitHub Actions.

---

## 👥 Contribuição & Licença

Contribuições, sugestões de melhorias e novas ideias para a horta/estufa são muito bem-vindas! Sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais informações.

<div align="center">
  <sub>Desenvolvido com 💚 e tecnologia sustentável para o futuro da agricultura inteligente.</sub>
</div>
