# Validação — Spec 052 (Combinar encontro)

Data: 2026-10-22. Branch: `feature/relaxed-thompson-60m08j`.

## Automatizada

- `npm run validate`: tipos, arquitetura (267 arquivos, sem violações), SQL/PGlite e
  **1032 testes em 145 arquivos (sobre o `develop` com tema escuro, service worker e a renumeração das specs do #191)**, cobertura de linhas de 94,09%.
- `npm run test:sql`: 11 cenários de acesso indevido negados para `v2_meetings` (terceiro convidando,
  convite em nome de outra pessoa, local fora da lista, data no passado e além de sete dias, segundo
  encontro ativo, quem convidou confirmando, confirmação alterando local, reagendamento em nome de
  outra pessoa, encontro cancelado voltando a valer, cliente inserindo notificação), além de
  visibilidade só para participantes e avisos gerados pelo gatilho para a outra pessoa.
- Testes novos: `meetingValidator`, `meetingUseCases` (memória), `supabaseMeetingDataSource`,
  `meetingPointsSql` (lista de pontos e títulos de aviso iguais entre TypeScript e SQL),
  `meetingViewModels` e `meetingViews`.

| Critério de aceite | Evidência |
| --- | --- |
| 1. Convite e aviso à outra pessoa | `meetingUseCases.test.ts`, `test:sql`, fluxo real abaixo |
| 2. Confirmação e "Encontro combinado" | `meetingUseCases.test.ts`, `meetingViews.test.tsx`, fluxo real |
| 3. Quem propôs não confirma | caso de uso, gatilho SQL e tela (ação ausente) |
| 4. Data, horário e local inválidos | `meetingValidator.test.ts`, `check` e gatilho no `test:sql` |
| 5. Reagendar e cancelar | `meetingUseCases.test.ts`, `meetingViews.test.tsx`, fluxo real |
| 6. RLS | `test:sql` com terceiro usuário |
| 7. `npm run validate` | passou |

## Fluxo real

Build `expo export --platform web`, servidor estático local e Chromium sem interface via CDP (sem
Playwright), com dois usuários em memória: Micael publica, Ana Paula pede, Micael aceita, abre a
negociação, combina Praça da Bandeira no sábado às 15h, volta e vê "Aguardando confirmação"; Ana
recebe "Convite para encontro" nas notificações, confirma ("Encontro combinado"), reagenda para 17h
(volta a aguardar a confirmação de Micael) e cancela pelo diálogo "Cancelar este encontro?", que
deixa "Combinar novo encontro".

## Limitações

- Migração ainda não aplicada no Supabase remoto (T012).
- Sem conferência em aparelho Android (ADB).
- O horário é validado no fuso do aparelho; o banco valida só a janela de datas e o local.
