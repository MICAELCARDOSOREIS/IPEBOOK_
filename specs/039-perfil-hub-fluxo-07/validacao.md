# Validação — Spec 039

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/unit/ratingUseCases.test.ts`: exige sessão; lista avaliações recebidas com nome de quem
  avaliou e mais recentes primeiro; retorna nome nulo quando o perfil de quem avaliou não existe.
- `tests/hooks/useReceivedRatingsViewModel.test.tsx`: carregamento, erro de domínio e `reload`.
- `tests/components/profileHubView.test.tsx`: nome e estatísticas exibidos; cada item do menu
  aciona a navegação correspondente; confirmação de "Sair da conta" (confirmar executa `signOut` e
  `onSignedOut`; cancelar não desconecta); redireciona ao login sem sessão.
- `tests/components/receivedRatingsView.test.tsx`: carregando, vazio, lista com nota/nome/data,
  erro com nova tentativa, redirecionamento sem sessão.
- `tests/components/securityView.test.tsx`: envia link de redefinição para o e-mail da conta;
  botão voltar.
- Testes pré-existentes de `profile.tsx` (`profileView.test.tsx`) e de integração
  (`sc006BuscaEPerfilIntegration.test.ts`) continuam passando sem alteração de asserções — a nova
  prop opcional `onBack` preserva o comportamento anterior quando ausente.

## Comandos executados

- `npx vitest run tests/`: **803 testes em 119 arquivos, todos aprovados.**
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0.

## Decisões de corte registradas (ver `spec.md`)

- Pessoas bloqueadas (`07.10`–`07.12`) fica para spec e PR separados (infraestrutura nova).
- "Configurações" (`07.05`) não vira tela própria — os itens já estão no hub.
- Troca de senha reaproveita o link por e-mail (`07.18`–`07.21` não implementam verificação de
  senha atual, que o Supabase Auth do projeto não valida no cliente).
- "Sessão expirada" (`07.23`) já é coberta pelos guards de redirecionamento existentes.

## Limitações

- Fluxo real no dispositivo (toque em cada item do menu, recebimento do e-mail de redefinição,
  confirmação visual do diálogo de saída) não verificado via ADB/CDP nesta entrega; apenas o
  contrato de navegação e chamadas aos casos de uso foi validado por teste automatizado.
