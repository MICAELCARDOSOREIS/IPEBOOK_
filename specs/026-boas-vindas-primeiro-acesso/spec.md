# Especificação: Boas-vindas e primeiro acesso (Spec 026)

Issue: #98. Telas de referência no Figma: `01.01 · Boas-vindas` (Android, nó 324:38).
Decisão de armazenamento: [ADR 0022](../../docs/adr/0022-primeiro-acesso-no-dispositivo.md).
Decisão de rota inicial: [AD-18](../../docs/arquitetura/architecture-ipebook/architecture-ipebook.md).

## 1. Contexto e problema

O aplicativo abre direto no catálogo. Quem chega pela primeira vez não encontra nenhuma explicação
do que é o IpêBook, para quem ele serve ou que a beta é exclusiva de Piripiri, PI.

## 2. O que a tela comunica

- Proposta: "Uma boa história merece continuar." e "Livros de quem mora perto de você."
- Região da beta: selo "PIRIPIRI · PIAUÍ" (mesmo texto do selo da beta na Home).
- Modalidades disponíveis: Venda, Troca e Doação (informativo, não são botões).
- Ações:
  - **Começar** → `/criar-conta`
  - **Já tenho conta** → `/entrar`
  - **Explorar livros sem entrar** → `/` (catálogo)

## 3. Regras de negócio

- **RN-01 (Aparição única)**: as boas-vindas aparecem somente na primeira abertura do app neste
  dispositivo. Depois de qualquer uma das três ações, a marca de "já vista" é gravada e a tela não
  reaparece nas próximas aberturas.
- **RN-02 (Não bloqueia o visitante)**: "Explorar livros sem entrar" leva ao catálogo sem conta,
  como antes (AD-9).
- **RN-03 (Falha de armazenamento)**: se o dispositivo não conseguir ler a marca, as boas-vindas
  aparecem (o visitante ainda pode explorar). Se não conseguir gravá-la, a tela reaparece na
  próxima abertura; nenhum erro é exibido.
- **RN-04 (Rota inicial)**: a decisão de mostrar as boas-vindas fica somente em
  `InitialRouteGate` (AD-18). Só redireciona quando o app abre em `/`; links diretos para outras
  rotas não são interrompidos.
- **RN-05 (Fora de escopo)**: a escolha de bairro (Figma `01.17 · Seu bairro`) não faz parte desta
  entrega. A #83 definiu a localidade do anúncio (ADR 0016), não um bairro do usuário, e isso exige
  decisão própria de privacidade.
- **RN-06 (Conta existente)**: a regra não depende de sessão. Quem já tem conta, mas abre o app
  pela primeira vez neste dispositivo, vê as boas-vindas uma vez.

## 4. Critérios de aceite

| # | Critério | Validação |
|---|----------|-----------|
| CA-1 | Primeiro acesso mostra as boas-vindas | `tests/unit/onboardingUseCases.test.ts` ("mostra as boas-vindas no primeiro acesso...") |
| CA-2 | Acesso seguinte não mostra as boas-vindas | mesmo teste (após `markWelcomeSeen`) |
| CA-3 | Falha ao ler a marca não bloqueia o app | `onboardingUseCases.test.ts` ("quando a leitura do armazenamento falha") |
| CA-4 | Falha ao gravar a marca não lança erro | `onboardingUseCases.test.ts` ("não lança erro quando a gravação falha") |
| CA-5 | Tela exibe proposta, região da beta e modalidades | `tests/components/welcomeView.test.tsx` ("apresenta a proposta...") |
| CA-6 | Cada ação encaminha ao destino correto | `tests/components/welcomeView.test.tsx` ("encaminha cada ação...") |
| CA-7 | Ordem de leitura, papéis e rótulos acessíveis; alvos de toque de 48 dp | revisão de código + `welcomeView.test.tsx` (papéis e rótulos) |
| CA-8 | Nenhuma violação de camadas | `npm run check:architecture` |
| CA-9 | Suíte completa sem regressões | `npm test` (446 testes passando) |
| CA-10 | Validação de fluxo real (dispositivo ou web) | **pendente**: ver seção 6 |

## 5. Assunções

- A marca é gravada com `AsyncStorage` (mesmo recurso já usado em `src/infra/supabaseClient.ts`).
- O selo "PIRIPIRI · PIAUÍ" e as modalidades são informativos; por isso não são botões.
- O ilustrativo `ilustracao-classicos.png` foi exportado do Figma (nó 327:86) e guardado em
  `src/view/onboarding/`. Os links temporários do Figma expiram em 7 dias, então o arquivo local é a
  fonte.

## 6. Pendências

- Validação do fluxo real no dispositivo Android e na web (CA-10).
- Bairro do usuário (`01.17`): nova issue, depois de decisão de privacidade.
- Estados de acesso e retorno de links de confirmação (#97): a precedência com a tela de boas-vindas
  segue AD-18 e será tratada quando #97 for implementada.
- Tipagem das rotas (`.expo/types/router.d.ts`) está desatualizada no ambiente local; `npm run
  typecheck` aponta erros em rotas já existentes, inclusive `/bem-vindo`, até que as rotas sejam
  regeneradas com `npx expo start`.
