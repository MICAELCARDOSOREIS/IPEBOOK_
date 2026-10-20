# Plano: Spec 030 — Alinhamento das telas do Micael

## Ordem de execução

1. **Design System**: `OutlinedButton`, `TextButton` e `Checkbox` (`botao.md` já documenta as
   variantes; a caixa de seleção ganha documento próprio).
2. **Modelo e infraestrutura**:
   - `User.name`; `IAuthDataSource.signUp(email, password, name)`; validação de nome em
     `authValidator`; adaptadores de memória e Supabase (`user_metadata.full_name`).
   - `Book.condition` e `Book.description`; validação em `bookValidator` (descrição ≤ 280,
     conservação dentro da lista); adaptadores de memória e Supabase; migração
     `202610200005_conservacao_descricao_anuncio.sql`.
3. **Telas de acesso**: `signIn`, `signUp`, `forgotPassword`, `resetPassword`.
4. **Telas de publicação**: `createListing` (3 etapas + sucesso), `editListing`,
   `manageListing` (rota nova) e ajuste de `myListings` para levar ao gerenciamento.
5. **Favoritos**: abas e linha completa.
6. **Marca/PWA**: `theme_color` e ícone.
7. **Testes e validação**: atualizar os testes existentes, acrescentar os novos e rodar
   `npm run validate`, `npm run test:sql` e `npm run build:web`.

## Decisões

- **Conservação como lista fechada** (`new`, `good`, `marked`, `worn`): o Figma usa chips de
  escolha única; texto livre impediria filtro futuro e repetiria o problema do bairro.
- **Bairro por chips da lista oficial** em vez de texto livre: `PIRIPIRI_NEIGHBORHOODS` já existia
  e só era usada em teste de semente (ver ADR 0016).
- **Sucesso como estado da própria rota `/anunciar`**, não rota nova: evita rota órfã acessível
  por link direto sem anúncio publicado.
- **Gerenciar anúncio como rota nova** `/gerenciar-anuncio/[id]`: o Figma `04.08` é uma tela por
  anúncio, e a lista `/meus-anuncios` continua sendo o índice.
- **Nome no cadastro grava em `user_metadata`** e alimenta `IProfileDataSource.ensure`, sem
  migração nova: a tabela `v2_profiles` já existe com a coluna `name`.
