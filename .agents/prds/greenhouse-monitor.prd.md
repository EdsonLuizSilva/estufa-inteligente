# Estufa Inteligente - Monitoramento & Automação IoT (Greenhouse Monitor)

## Problem
Estudantes e jovens de 14 a 16 anos participando de feiras de ciências e mostras de tecnologia precisam demonstrar aplicações práticas de sustentabilidade e Internet das Coisas (IoT). O desafio é construir um sistema confiável que automatize os cuidados com uma planta e evite que a estufa sofra com calor excessivo, falta de rega ou danos na bomba por reservatório vazio durante a demonstração para os avaliadores.

## Evidence
- Projeto/protótipo prático para Feira de Ciências escolar/regional.
- Hipótese de validação técnica e didática para apresentação pública perante banca avaliadora.

## Users
- **Primary**: Estudantes de 14 a 16 anos (apresentadores do projeto de Feira de Ciências) e visitantes/avaliadores que observarão a bancada.
- **Not for**: Sistemas comerciais agrícolas em larga escala, plantações industriais com multi-tenancy corporativo.

## Hypothesis
Acreditamos que uma **aplicação web responsiva e interativa com visualização ao vivo de sensores, controle autônomo de ventilador/bomba e notificação no WhatsApp de nível crítico de água** permitirá aos **estudantes demonstrarem com clareza o ciclo de automação IoT e sustentabilidade na Feira de Ciências**.
Saberemos que estamos certos quando:
1. O painel web refletir mudanças de sensores em menos de 1 segundo.
2. A bomba e o ventilador ligarem/desligarem automaticamente de acordo com os limiares de solo e temperatura.
3. A notificação simulada/real de WhatsApp for disparada com sucesso ao atingir nível baixo de água sem queimar a bomba.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Latência da Telemetria | < 1s | Tempo entre a leitura do sensor e a atualização visual no painel |
| Resposta da Automação | 100% de precisão | Testes automatizados cobrindo todas as combinações de sensores/atuadores |
| Interatividade na Apresentação | 3 telas intuitivas | Navegação fluida entre Cockpit, Histórico e Reservatório |

## Scope
### MVP (Fase Atual)
- **Tela 1 (Cockpit Principal):** Visão ao vivo da estufa (temperatura, umidade do ar, situação do solo: MUITO MOLHADO / ÚMIDO / SECO, e status da bomba e do ventilador).
- **Tela 2 (Dashboard Histórico):** Gráficos de linha de evolução da temperatura e umidade ao longo do tempo.
- **Tela 3 (Tanque Reservatório):** Mostrador visual de nível do reservatório com indicador de perigo e registro de avisos no WhatsApp.
- **Engine de Automação (Regras de Negócio):**
  - Temperatura alta -> Liga ventilador; Temperatura normal -> Desliga ventilador.
  - Solo seco -> Liga bomba de água; Solo úmido ou muito molhado -> Desliga bomba.
  - Nível de água baixo -> Desliga bomba obrigatoriamente (proteção contra queima a seco) e dispara notificação WhatsApp.
- **Simulador de Sensores:** Controles visuais/interativos para permitir aos estudantes alterar temperatura, umidade, solo e reservatório na hora da apresentação e ver a automação acontecendo ao vivo na tela.

### Out of Scope (Deixado para v2)
- Multi-tenancy / login de múltiplos usuários com senhas corporativas.
- Controle de iluminação artificial por lâmpadas grow.
- Transmissão de vídeo ou streaming ao vivo via câmera.

## Delivery Milestones
| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Arquitetura & Engine de Automação (TDD) | Regras de controle (ventilador, bomba, trava de água, disparo WhatsApp) testadas e 100% confiáveis | complete | .agents/plans/milestone-1-core-iot.plan.md |
| 2 | Backend API & Simulador de Telemetria | Rotas para ingestão e broadcast de dados em tempo real com gerador de dados mock | complete | .agents/plans/milestone-1-core-iot.plan.md |
| 3 | Frontend: Tela 1 (Cockpit da Estufa) | Painel visual moderno com badges de atuadores e medidores | pending | — |
| 4 | Frontend: Tela 2 (Histórico) & Tela 3 (Reservatório) | Gráficos analíticos e interface do nível de água com alertas WhatsApp | pending | — |

## Open Questions
- [x] Canal de WhatsApp: utilizar integração direta com Evolution API / Twilio ou webhook mock com modal de mensagem demonstrativo para a feira? (Recomendado: suporte a ambos).
- [ ] Limiar de temperatura para ligar o ventilador: padrão sugerido de 28°C a 30°C configurável.

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Wi-Fi da Feira de Ciências cair | Alta | Crítica | A aplicação deve rodar 100% em modo local (localhost ou offline) com simulador de sensores embutido |
| Bomba tentar ligar sem água | Média | Alta | Interlock de segurança rígido no código (se água BAIXA -> bomba desligada compulsoriamente) |
| Interface complexa demais para demonstrar em 2 minutos | Baixa | Média | Design visual moderno com cores claras (verde/amarelo/vermelho) e ícones animados |

---
*Status: APROVADO — Requisitos consolidados via /plan-prd. Pronto para /plan.*
