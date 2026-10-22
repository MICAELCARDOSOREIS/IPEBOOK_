# Spec 052 — Combinar encontro com local, dia e horário

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 22 de outubro de 2026
**Issue:** #188
**Telas no Figma:** `06.04 · Combinar encontro` (`27:809`), `06.05 · Encontro combinado` (`27:921`),
`06.11 · Cancelar encontro?` (`370:6517`), `06.12 · Encontro cancelado` (`370:6559`),
`06.13 · Reagendar encontro` (`370:6601`), `06.14 · Encontro reagendado` (`370:6643`).
**Depende de:** Spec 004 (negociação), Spec 037 (pontos de encontro), Spec 043 (fonte única
`PIRIPIRI_MEETING_POINTS`).

## Problema

Depois do aceite, `/negociacao/[id]` só lista os pontos seguros de Piripiri. Quem anunciou e quem
pediu precisam combinar dia, horário e local fora do app, e nada fica registrado. O Figma prevê o
convite (`06.04`), a confirmação pela outra pessoa (`06.05`: "Ana Paula confirmou"), o
reagendamento e o cancelamento. O pedido só conhece `pending | accepted | rejected`, então não há
onde guardar o encontro.

## Usuários afetados

As duas pessoas de uma negociação aceita: quem anunciou (dono do livro) e quem pediu.

## Escopo

1. **Modelo:** entidade `Meeting` (uma por pedido aceito) com ponto, data e hora, quem propôs e
   situação `proposed | confirmed | cancelled`.
2. **Combinar (`06.04`):** escolher um dos pontos de `PIRIPIRI_MEETING_POINTS`, um dos próximos sete
   dias e um horário entre as faixas sugeridas; "Enviar convite".
3. **Confirmar (`06.05`):** a outra pessoa vê o convite em `/negociacao/[id]` e confirma.
4. **Reagendar (`06.13`/`06.14`):** qualquer participante sugere novo local, dia e horário; o encontro
   volta a aguardar confirmação da outra pessoa.
5. **Cancelar (`06.11`/`06.12`):** diálogo de confirmação; o encontro fica cancelado e um novo convite
   pode ser enviado.
6. **Avisos:** notificação para a outra pessoa em convite, confirmação, reagendamento e cancelamento.

## Fora do escopo

- Conversas (`06.01`, `06.02`, `06.10`, `06.16`) e a ação "Abrir conversa" de `06.05`.
- "Adicionar à agenda" e o mapa ilustrado de `06.05` (os links "Como chegar" da Spec 037 continuam).
- Concluir negociação (`06.07`/`06.08`), não comparecimento (`06.15`) e avaliação (`06.21`/`06.22`).
- Horário livre: os horários são faixas fixas (ver RN-03), como os chips do Figma.

## Regras de negócio

- **RN-01 (Participantes):** só quem anunciou ou quem pediu, num pedido `accepted`, lê ou altera o
  encontro. Pedido pendente ou recusado não tem encontro.
- **RN-02 (Local):** o local é um dos `PIRIPIRI_MEETING_POINTS`; outro valor é recusado.
- **RN-03 (Dia e horário):** o dia está entre amanhã e sete dias à frente; o horário é uma das faixas
  `9h`, `10h`, `15h`, `17h` (o Figma mostra 10h, 15h e 17h; 9h atende o horário útil do Campus IFPI).
  Encontro no passado é recusado também no banco.
- **RN-04 (Um encontro ativo):** cada pedido tem no máximo um encontro `proposed` ou `confirmed`.
- **RN-05 (Confirmação):** quem propôs não confirma o próprio convite; só a outra pessoa.
- **RN-06 (Reagendar):** muda local, dia e horário, registra quem sugeriu e volta a `proposed`.
- **RN-07 (Cancelar):** só de `proposed` ou `confirmed`; depois disso o pedido aceita novo convite.
- **RN-08 (Avisos):** cada mudança gera notificação para a outra pessoa, com link para
  `/negociacao/[id]`.
- **RN-09 (Acessibilidade):** escolhas como grupos de opção única (`radiogroup`/`radio`), alvos de
  toque de 48 pt e rótulos descritivos ("Dia sábado, 03/10", "Horário 10h").

## Critérios de aceite

1. Num pedido aceito, quem anunciou envia convite com ponto, dia e horário; a outra pessoa recebe
   notificação e vê "Aguardando sua confirmação".
2. A outra pessoa confirma; as duas veem "Encontro combinado" com dia, horário e local (`06.05`).
3. Quem propôs não vê a ação de confirmar o próprio convite e o caso de uso recusa a tentativa.
4. Data no passado, além de sete dias, horário fora das faixas ou local fora da lista são recusados
   no caso de uso e no banco.
5. Reagendar volta para "Aguardando confirmação"; cancelar mostra "Encontro cancelado" e oferece
   "Combinar novo encontro".
6. Pessoas fora do pedido não leem nem alteram o encontro (RLS testada no PGlite).
7. `npm run validate` passa, com testes de entidade, casos de uso, datasource em memória, ViewModel,
   telas e SQL.

## Como será testado

| Critério | Verificação |
| --- | --- |
| 1, 2, 5 | Testes de `MeetingUseCases` com datasources em memória; testes das telas com ViewModel simulado |
| 3 | Teste de caso de uso (erro de domínio) e da tela (ação ausente para quem propôs) |
| 4 | Testes do validador de encontro com relógio fixo; `check` no SQL testado no PGlite |
| 6 | `npm run test:sql` com dois usuários e um terceiro sem vínculo |
| 7 | `npm run validate`; conferência visual no app compilado contra `06.04`, `06.05`, `06.11`, `06.13` |

## Riscos

- **Fuso horário:** a data é escolhida no horário local de Piripiri (UTC−3, sem horário de verão) e
  gravada como `timestamptz`; os testes fixam o relógio.
- **Concorrência:** duas pessoas reagendando ao mesmo tempo; o índice único de RN-04 e a atualização
  condicionada à situação atual evitam dois encontros ativos.
- **Migração remota:** a migração precisa ser aplicada no Supabase antes da publicação; reverter o
  código não remove a tabela (ver plano).
