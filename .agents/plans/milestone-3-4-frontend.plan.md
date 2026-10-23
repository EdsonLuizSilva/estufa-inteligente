# Plano de Implementação: Milestones 3 & 4 - Frontend da Estufa Inteligente

**Source PRD**: `.agents/prds/greenhouse-monitor.prd.md`  
**Milestone Selecionado**: Milestone 3 (Tela 1: Cockpit ao Vivo) & Milestone 4 (Tela 2: Histórico e Tela 3: Reservatório + Simulador)  
**Complexidade**: Medium  

---

## 1. Resumo Executivo
Criar a aplicação Web Frontend responsiva e moderna usando React 18, Vite, Tailwind CSS, Lucide Icons e Recharts. A interface atenderá perfeitamente aos requisitos do projeto de Feira de Ciências: visualização clara das 3 telas pedidas, indicadores visuais com animações de estado (ventilador girando, bomba com fluxo de água, medidor de umidade do solo e nível dinâmico do tanque de água), além de um painel de controle interativo para os estudantes simularem qualquer cenário de sensor em tempo real durante a apresentação.

---

## 2. Telas & Componentes a Implementar

### Tela 1: Cockpit Principal da Estufa
- Cartões com medidores visuais:
  - Temperatura do ar (°C) com badge de alerta se $\ge 28^\circ\text{C}$.
  - Umidade do ar (%).
  - Situação do solo: mostrador visual tri-estado com cores semânticas (`MUITO_MOLHADO` = azul, `UMIDO` = verde, `SECO` = âmbar/vermelho).
  - Status dos Atuadores:
    - **Ventilador:** Ícone animado (girando quando ligado, cinza quando desligado) + motivo da decisão.
    - **Bomba de Água:** Ícone animado (gotas d'água ativas quando ligada, cinza quando desligada) + trava de segurança evidente.

### Tela 2: Dashboard Histórico
- Gráficos de séries temporais de linha com **Recharts**:
  - Curva de evolução da Temperatura ao longo do tempo com linha de limiar ($28^\circ\text{C}$).
  - Curva de evolução da Umidade do ar ao longo do tempo.
  - Cartões de resumo com médias e picos registrados.

### Tela 3: Monitor do Reservatório de Água & WhatsApp
- Tanque de água visual estilizado com nível dinâmico de líquido (0 a 100%).
- Indicadores de status (`CHEIO`, `MEDIO`, `BAIXO`).
- Alerta visual piscante de "RISCO DE QUEIMA A SECO" se o nível for `BAIXO`.
- Histórico visual de notificações simuladas de WhatsApp (com layout de balão de mensagem verde do WhatsApp).

### Barra de Simulação Interativa (Para a Feira de Ciências)
- Sliders e seletores para mudar instantaneamente a temperatura, umidade, solo e nível de água, permitindo demonstrar para os juízes a estufa reagindo em tempo real.

---

## 3. Estrutura de Arquivos a Criar
| Arquivo | Ação | Objetivo |
| :--- | :--- | :--- |
| `frontend/package.json` | CREATE | Dependências (React, Vite, Lucide-React, Recharts, Tailwind CSS) |
| `frontend/vite.config.ts` | CREATE | Configuração do Vite com proxy para a API do backend na porta 3001 |
| `frontend/src/App.tsx` | CREATE | Navegação entre as 3 telas + barra de simulação interativa |
| `frontend/src/components/CockpitScreen.tsx` | CREATE | Tela 1: Visão em tempo real da estufa e atuadores |
| `frontend/src/components/HistoryScreen.tsx` | CREATE | Tela 2: Gráficos de linha históricos e métricas |
| `frontend/src/components/ReservoirScreen.tsx` | CREATE | Tela 3: Visualizador do tanque de água e alertas de WhatsApp |
| `frontend/src/components/SensorSimulator.tsx` | CREATE | Painel de controle para os alunos simularem sensores na bancada |

---

## 4. Verificação de Qualidade (ECC Quality Gate)
- `npm run build` do frontend sem erros de tipagem.
- Responsividade testada para tablets, celulares e notebooks da feira.
- Fallback automático caso o backend esteja iniciando (polling resiliente a cada 1.5s).

---
*Status: APROVADO PELO USUÁRIO. Execução iniciada.*
