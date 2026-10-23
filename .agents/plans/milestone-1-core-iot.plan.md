# Plano de Implementação: Milestone 1 & 2 - Core IoT & Automações da Estufa

**Source PRD**: `.agents/prds/greenhouse-monitor.prd.md`  
**Milestone Selecionado**: Milestone 1 (Engine de Automação & Interlocks com TDD) & Milestone 2 (Scaffold e API Backend)  
**Complexidade**: Medium  

---

## 1. Resumo Executivo
Implementar a espinha dorsal da aplicação de monitoramento de estufa com arquitetura limpa em Node.js/TypeScript. Construir primeiro a `AutomationEngine` via TDD estrito com 100% de cobertura, cobrindo os interlocks de segurança (acionamento do ventilador, bomba de água e proteção contra queima a seco do reservatório com disparo simulado de WhatsApp). Em seguida, expor os endpoints REST e SSE/WebSocket para alimentar o frontend nas 3 telas.

---

## 2. Padrões de Código e Diretrizes (ECC Rules)
| Categoria | Padrão Adotado | Justificativa |
| :--- | :--- | :--- |
| **Arquitetura** | Clean Architecture / Domínio Desacoplado | As regras de negócio da estufa não devem depender de bibliotecas externas de HTTP ou UI. |
| **Tipagem** | TypeScript Estrito (`strict: true`) | Eliminar valores `any` e tipar explicitamente estados de sensores (`SoilStatus`, `WaterLevel`). |
| **Tratamento de Erros** | Resiliência & Fail-Safe | Se a leitura do reservatório falhar ou estiver vazia, o padrão de segurança é **desligar a bomba imediatamente**. |
| **Testes** | Vitest / TDD | Testes rápidos, sem dependência de rede, com mocks para o serviço de mensageria WhatsApp. |

---

## 3. Arquivos a Criar
| Arquivo | Ação | Objetivo |
| :--- | :--- | :--- |
| `package.json` | CREATE | Configuração do projeto, dependências (Express, TypeScript, Vitest, Zod, Cors) |
| `tsconfig.json` | CREATE | Configuração TypeScript estrita com compilação moderna ES2022 |
| `src/domain/types.ts` | CREATE | Tipos centrais: `SensorReadings`, `ActuatorState`, `SoilStatus`, `WaterLevel` |
| `src/domain/automation-engine.ts` | CREATE | Núcleo de lógica pura da estufa (regras do ventilador, bomba e trava do reservatório) |
| `src/domain/automation-engine.test.ts` | CREATE | Bateria de testes TDD com todos os cenários e casos de borda |
| `src/services/whatsapp-notifier.ts` | CREATE | Interface de notificação WhatsApp com mock para feira e log visual |
| `src/server.ts` | CREATE | Servidor Express expondo `/api/telemetry`, `/api/state`, e simulador de sensores |

---

## 4. Fases de Execução Passo a Passo

### Fase 1: Setup do Repositório & Dependências
- Criar `package.json` e `tsconfig.json`.
- Instalar `typescript`, `vitest`, `express`, `cors`, `zod` e `@types/*`.

### Fase 2: TDD da Engine de Automação (Milestone 1)
- **Cenário 1 (Ventilador):**
  - Temp $\ge$ 28.0°C $\rightarrow$ Ventilador LIGADO.
  - Temp $<$ 28.0°C $\rightarrow$ Ventilador DESLIGADO.
- **Cenário 2 (Bomba de Água & Solo):**
  - Solo `SECO` e Água `SUFICIENTE` (Médio ou Cheio) $\rightarrow$ Bomba LIGADA.
  - Solo `UMIDO` ou `MUITO_MOLHADO` $\rightarrow$ Bomba DESLIGADA.
- **Cenário 3 (Interlock Crítico do Reservatório):**
  - Água `BAIXA`: Bomba OBRIGATORIAMENTE DESLIGADA (mesmo se solo estiver seco).
  - Água `BAIXA`: Disparo de alerta crítico no WhatsApp.
- Executar e verificar se a suíte de testes passa 100%.

### Fase 3: Camada de API & Ingestão de Sensores (Milestone 2)
- Criar endpoint `POST /api/telemetry` para receber dados de sensores reais ou simulados.
- Criar endpoint `GET /api/state` para retornar leitura atual dos sensores e estados dos atuadores.
- Criar endpoint `GET /api/history` para retornar série histórica em memória para a Tela 2.
- Adicionar gerador de dados mock para facilitar a demonstração na Feira de Ciências mesmo sem placa ESP32.

---

## 5. Avaliação de Riscos
| Risco | Severidade | Mitigação no Plano |
| :--- | :--- | :--- |
| Alertas repetidos no WhatsApp | Média | Implementar *cooldown* / debounce no disparo para não enviar 100 mensagens por segundo |
| Queda de conexão na Feira | Alta | Backend manterá simulação local integrada e suporte a execução 100% offline |

---
*Status: AGUARDANDO CONFIRMAÇÃO DO USUÁRIO.*
