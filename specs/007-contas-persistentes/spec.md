# 007 — Contas persistentes e recuperação segura

Status: em implementação. Data: 2026-10-15.

## Objetivo

Permitir que leitores usem a mesma conta e os mesmos anúncios no Android e na Web, sem expor senhas ou depender da memória do processo. Esta é a primeira entrega técnica da beta pública; a abertura ao público depende das demais especificações da beta.

## Escopo

- Autenticação por e-mail e senha no Supabase, sessão persistente e recuperação por link enviado ao e-mail.
- Persistência de anúncios com controle de acesso no banco.
- Usar o projeto Supabase já existente, com tabelas `v2_books` e `v2_book_requests` separadas
  das tabelas legadas. Preservar os dados antigos; nenhuma exclusão é necessária nesta entrega.
- Manter as sete camadas e contratos injetáveis; a chave publicável pode estar no cliente, nunca a chave administrativa.
- Configuração local sem credenciais reais no repositório. O modo de memória permanece apenas para desenvolvimento e testes explícitos.

Ficam para próximas entregas: perfil e contato, Google, fotos, negociação atômica, moderação e publicação.

## Critérios de aceite

1. Uma conta confirmada consegue entrar novamente após reiniciar o aplicativo; sair remove a sessão local.
2. Um anúncio criado por uma conta aparece para outra conta no catálogo; um visitante pode ler, mas não publicar.
3. O proprietário não pode ser falsificado pelo cliente: o banco usa a identidade da sessão para autorizar a gravação.
4. Solicitar recuperação não revela se o e-mail existe nem altera a senha antes da comprovação pelo link; nenhuma senha é exibida na tela.
5. Falhas de rede e configuração geram mensagens seguras. Sem configuração de backend, a beta falha de forma explícita em vez de ativar dados locais silenciosamente.

## Validação

Testes unitários de contratos e estados, teste de acesso negado por RLS com contas distintas, `npm run validate`, `npm run build:web` e conferência real em Android e Web com o projeto Supabase configurado.
