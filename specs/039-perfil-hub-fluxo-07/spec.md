# Spec 039 — Meu perfil (hub de navegação, Figma fluxo 07)

**Responsável:** Maria Clara (`pessoa:maria-clara`)
**Data:** 21 de outubro de 2026
**Fontes visuais:** `design-system/telas-android-figma.md`, seção "07 · Perfil e conta" (23 telas).

## Problema

`/perfil` (destino "profile" da navegação inferior) abria direto o formulário de edição (nome,
foto, telefone, bairro — Spec 006 US4). O Figma descreve esse formulário como a tela `07.02 ·
Editar perfil`, alcançada a partir de uma tela própria `07.01 · Meu perfil` (avatar, estatísticas e
menu para Avaliações, Notificações, Segurança, Privacidade e dados, Termos, Ajuda e Sair). Essa
tela hub nunca existia: o app não tinha como chegar a Avaliações recebidas, Segurança e
verificação, nem a navegação explícita de Sair da conta.

## Escopo desta entrega

- Nova tela `07.01 · Meu perfil` (`src/view/profile/profileHub.tsx`), em `/perfil`: avatar, nome,
  estatísticas (nota média, quantidade de avaliações, negociações concluídas — já existentes em
  `PublicProfile`) e menu de navegação.
- `07.02 · Editar perfil` passa a viver em `/perfil/editar` (mesmo componente `Profile`, agora com
  barra superior e botão voltar).
- Nova tela `07.03 · Avaliações recebidas` (`/perfil/avaliacoes`): lista as avaliações recebidas
  pela pessoa autenticada, com nome de quem avaliou, nota (1 a 5) e data. Novo caso de uso
  `RatingUseCases.listReceivedRatings`, reaproveitando os datasources de avaliação e perfil já
  existentes (nenhuma migração nova: a política de leitura de `v2_ratings` já é pública).
- Nova tela `07.06 · Segurança e verificação` (`/perfil/seguranca`): envia um link de redefinição
  de senha para o e-mail da própria conta, reaproveitando `requestPasswordReset` (fluxo já usado em
  "Recuperar acesso"). Não implementa troca de senha com "senha atual" dentro do app — o Supabase
  Auth usado pelo projeto não valida senha atual no cliente, e inventar essa validação criaria uma
  falsa sensação de segurança.
- `07.07 · Privacidade e dados`, `07.08 · Dados solicitados` e `07.09 · Excluir conta` **já
  existiam** combinadas em `/excluir-conta` (`DeleteAccount`, Spec de LGPD anterior); o hub passa a
  linká-las pelo menu "Privacidade e dados". Nenhuma mudança nessas telas além do link de origem.
- `07.04 · Notificações`, `07.14 · Termos e privacidade` e `09.01 · Ajuda` já existiam como rotas
  soltas (`/notificacoes`, `/termos`, `/ajuda`); o hub passa a linká-las.
- `07.22 · Sair da conta?`: diálogo de confirmação no hub (reaproveitando o componente `Dialog`)
  antes de encerrar a sessão.

## Fora de escopo (decisões registradas)

- **`07.10`–`07.12` · Pessoas bloqueadas**: exige entidade, migração e política RLS novas (bloqueio
  de usuário é uma relação persistida que hoje não existe no banco). Fica para uma spec e PR
  separados, por ser infraestrutura nova e não apenas composição de telas existentes.
- **`07.05` · Configurações**: o Figma a descreve como um menu que reagrupa Segurança, Privacidade
  e Notificações. Sem conteúdo exclusivo além dessas, criar uma tela extra apenas duplicaria o menu
  de `07.01`; os itens já ficam diretamente no hub.
- **`07.18`–`07.21`** (alterar senha com "senha atual", erros dedicados): cobertos pelo fluxo de
  link por e-mail do item "Segurança e verificação" acima — o Supabase Auth do projeto não suporta
  verificação de senha atual no cliente sem reautenticação, e os estados de erro dessas telas (07.19
  "Senha atual incorreta", 07.21 "Nova senha inválida") pressupõem esse fluxo.
- **`07.23` · Sessão expirada**: já coberto funcionalmente pelos guards existentes (toda tela que
  exige sessão redireciona a `/entrar` quando `authState.user` é nulo); não há tela dedicada nova.

## Critérios de Aceite

1. `/perfil` exibe avatar, nome, estatísticas e o menu completo (Editar perfil, Avaliações
   recebidas, Notificações, Segurança e verificação, Privacidade e dados, Termos e privacidade,
   Ajuda, Sair da conta).
2. Tocar em cada item do menu navega para a rota correspondente.
3. `/perfil/editar` mantém o comportamento já existente de edição (Spec 006, Issue #141), agora com
   barra superior e botão voltar para `/perfil`.
4. `/perfil/avaliacoes` lista as avaliações recebidas pela pessoa autenticada (nome, nota, data) ou
   estado vazio quando não há avaliações; exige sessão.
5. `/perfil/seguranca` envia link de redefinição de senha para o e-mail da conta autenticada.
6. Tocar em "Sair da conta" pede confirmação; confirmando, encerra a sessão e redireciona ao login.
7. `npm run validate` passa.

## Validação

- Testes de caso de uso (`ratingUseCases`), de hook (`useReceivedRatingsViewModel`) e de componente
  (`profileHubView`, `receivedRatingsView`, `securityView`), cobrindo navegação, estados de
  carregamento/erro/vazio, confirmação e cancelamento de saída, e redirecionamento sem sessão.
- `npm run validate`.
