# Especificação 095 — Concluir a negociação por QR code

Status: implementada e verificada localmente; migração ainda não aplicada no Supabase remoto. ADR: [0070](../../docs/adr/0070-conclusao-por-qr-code.md).

## Objetivo
Depois que o encontro está confirmado, a pessoa que entrega o livro mostra um QR code e a outra o lê. A leitura conclui a negociação para as duas e leva à avaliação. Isso prova que as duas estiveram juntas e substitui o cartão "Concluir negociação", retirado da tela "Acompanhar encontro".

## Escopo
- Tela "Entrega do livro" (`/negociacao/[id]/entrega`) que muda conforme o papel:
  - **Anunciante** (quem entrega): gera e mostra o QR code e um código de 8 caracteres.
  - **Leitor** (quem recebe): lê o QR com a câmera ou digita o código.
- Cartão "Entrega do livro" em "Acompanhar encontro", com a ação do papel e, depois de concluída, o estado "Entrega concluída" e o atalho para avaliar.
- Fora do escopo: pagamento, push (ADR futuro), entrega sem encontro confirmado.

## Regras de negócio
- **RN-01** Só há entrega com encontro `confirmed` na negociação.
- **RN-02** Só o anunciante gera o código; só o leitor o confirma.
- **RN-03** O código é de uso único e expira em 15 minutos; gerar de novo invalida o anterior.
- **RN-04** Cinco tentativas erradas bloqueiam o código atual (é preciso gerar outro).
- **RN-05** A entrega concluída não se repete nem se desfaz.
- **RN-06** Ao concluir, a outra pessoa recebe um aviso e a etapa "Concluída" fica marcada para as duas.
- **RN-07** A validação é do servidor (função no banco); o app só repassa.
- **RN-08** Ao concluir, o livro passa de `reserved` para `delivered` ("Entregue"): sai do catálogo, não aceita novo pedido, edição, pausa nem remoção. Migração `202610280002_livro_entregue.sql` (gatilho em `v2_deliveries` + preenchimento das entregas já concluídas).

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Gerar código sem encontro confirmado é recusado | teste unitário do caso de uso |
| CA2 | Só o anunciante gera, só o leitor confirma | teste unitário |
| CA3 | Código expirado, errado, usado ou bloqueado é recusado | teste unitário e SQL |
| CA4 | Concluída marca a negociação para as duas pessoas e avisa a outra | teste unitário e SQL |
| CA5 | O QR codifica e decodifica `ipebook:entrega:<pedido>:<código>` | teste unitário |
| CA6 | A tela mostra QR ao anunciante e leitura ao leitor | teste de componente |
| CA7 | Etapa 3 e cartão refletem "Entrega concluída" | teste de componente |

## Como foi verificado
- Casos de uso, domínio, ViewModel e telas: `tests/unit/delivery*.test.ts`, `tests/hooks/useDeliveryViewModel.test.tsx`, `tests/components-mocked/deliveryView.test.tsx`, `tests/components/qrCode.test.tsx` e `tests/components/requestDetailView.test.tsx`.
- Migração, papéis, RLS, expiração, bloqueio e uso único: cenários em `scripts/verificar-migracoes.mjs` (`npm run test:sql`, PGlite).
- Fluxo real com câmera: depende de aplicar a migração `202610280001_entrega_por_qr_code.sql` no Supabase e de dois aparelhos.

## Suposições
- A conclusão não depende do horário do encontro (basta estar confirmado); a presença física é a prova.
- A avaliação continua opcional e usa o modal existente.
