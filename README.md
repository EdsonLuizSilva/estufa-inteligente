# Estufa Inteligente IoT - Sistema de Monitoramento & Automação

Projeto de automação IoT sustentável desenvolvido para apresentação em **Feira de Ciências** (estudantes de 14 a 16 anos).
Construído com base na metodologia de engenharia de software **ECC** (*Everything Claude Code* / *Agent Harness System*).

---

## 🌟 Funcionalidades Principais

1. **Tela 1: Cockpit em Tempo Real da Estufa**
   - Medição ao vivo de Temperatura (°C), Umidade do ar (%) e Umidade do Solo (Muito Molhado / Úmido / Seco).
   - Indicadores visuais animados de acionamento do **Ventilador** e da **Bomba de Água**.
   - Justificativa automática e transparente do motivo pelo qual cada atuador ligou ou desligou.

2. **Tela 2: Dashboard de Séries Históricas**
   - Gráficos de linha dinâmicos de Temperatura e Umidade com limiares visuais.
   - Cálculo automático de médias e picos registrados para análise científica.

3. **Tela 3: Nível do Reservatório & Central WhatsApp**
   - Mostrador visual graduado do tanque d'água com cálculo dinâmico de volume.
   - **Interlock Crítico:** Desligamento forçado da bomba de irrigação se a água estiver em nível `BAIXO` para evitar queimar o motor a seco.
   - Disparo automático de notificação no WhatsApp com registro visual na tela.

4. **Simulador Interativo de Bancada (Feira de Ciências)**
   - Sliders de temperatura e botões de estado do solo e reservatório embutidos diretamente no topo da tela para permitir que os alunos e a banca avaliadora demonstrem o sistema funcionando mesmo sem sensores físicos conectados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Node.js, Express, TypeScript, Zod (validação estrita de contratos de telemetria).
- **Testes & Qualidade:** Vitest (TDD com 100% de aprovação nas regras de segurança e interlock).

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Backend
Abra um terminal e execute:
```bash
npm run dev
# ou npm run start
```
O servidor da API iniciará em: `http://localhost:3001`

### 2. Iniciar o Frontend
Em outro terminal, acesse a pasta `frontend` e execute:
```bash
cd frontend
npm run dev
```
A aplicação abrirá no seu navegador em: `http://localhost:3000`
