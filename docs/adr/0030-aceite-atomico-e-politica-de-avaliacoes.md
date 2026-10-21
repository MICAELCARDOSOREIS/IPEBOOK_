# 0030 — Aceite atômico e autorização de avaliações no banco

**Data:** 2026-10-20  
**Status:** Aceito  
**Especificação:** [Correções da revisão integral](../../specs/033-correcoes-revisao-integral/spec.md)

## Contexto

Aceitar um pedido exigia três operações de cliente: aceitar, rejeitar concorrentes e reservar o livro. Uma falha intermediária podia deixar estados divergentes. A política de avaliações conferia somente a identidade de quem enviava a nota, sem conferir sua relação com o pedido.

## Decisão

Executar o aceite por uma função PostgreSQL com verificação do proprietário e bloqueio da linha do livro. A transação da função atualiza pedido, concorrentes e livro ou não persiste nenhuma atualização. Restringir a criação de avaliações, via RLS, aos dois participantes de um pedido aceito, com a outra pessoa como destinatária da nota. Manter o fluxo em memória para os testes e o modo local.

## Alternativas e consequências

Manter a sequência no cliente exigiria compensações sujeitas a novas falhas e corridas entre dispositivos. A função no banco acrescenta uma API SQL que precisa de testes de autorização e de migração. A branch não altera o banco remoto; seu histórico deve ser conferido antes da aplicação.
