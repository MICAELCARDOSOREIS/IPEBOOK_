# Spec 056 — Bloqueio e Desbloqueio de Usuários (Figma 07.10–07.12)

## Contexto e Objetivo

No ecossistema comunitário de compra, venda, troca e doação de livros físicos em Piripiri, a segurança e a autonomia dos membros são prioritárias. O fluxo de perfil desenhado no Figma (`07.10` a `07.12`) prevê a capacidade de visualizar pessoas bloqueadas e desbloqueá-las quando desejado.

Esta especificação implementa a infraestrutura completa de persistência e a jornada de usuário no aplicativo para:
1. Listar usuários bloqueados pelo membro autenticado (`/perfil/bloqueados`).
2. Desbloquear um usuário com diálogo acessível de confirmação.
3. Garantir a integridade no banco de dados através da tabela `v2_blocked_users` com RLS rígida.
4. Integrar o acesso a partir do menu do hub de perfil (`/perfil`).

## Requisitos Funcionais

- **RF-01**: A tela `/perfil/bloqueados` deve exibir a lista de pessoas bloqueadas pelo usuário logado, exibindo avatar, nome público e data do bloqueio.
- **RF-02**: Caso o usuário não tenha ninguém bloqueado, deve exibir um estado vazio amigável ("Nenhuma pessoa bloqueada").
- **RF-03**: Ao acionar "Desbloquear", deve exibir o diálogo de confirmação (`Dialog.tsx`) prevenindo toques acidentais.
- **RF-04**: Ao confirmar, o bloqueio deve ser removido e a lista atualizada com feedback por Snackbar.
- **RF-05**: Um usuário nunca pode bloquear a si próprio (`check (blocker_id <> blocked_id)`).
- **RF-06**: Cada usuário só pode visualizar e gerenciar seus próprios bloqueios.

## Critérios de Aceite

- **CA-01**: Rota `/perfil/bloqueados` acessível pelo hub de perfil (`/perfil`) para usuários autenticados.
- **CA-02**: Visitantes não autenticados que acessarem a rota são redirecionados para `/entrar`.
- **CA-03**: Diálogo acessível com suporte a leitores de tela e navegação por teclado (`Dialog`).
- **CA-04**: Testes cobrindo caso de uso, viewmodel, telas e regras de RLS no banco PGlite com 100% de sucesso.
- **CA-05**: Conformidade estrita com o MVVM em 7 camadas e acessibilidade WCAG AA.
