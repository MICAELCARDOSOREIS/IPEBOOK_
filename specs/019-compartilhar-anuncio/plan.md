# Plano de Implementação: Compartilhar Anúncio (Spec 019)

## Observação de dependência

A API `Share` do React Native (core, já disponível via `react-native` — ver `package.json`) cobre
o menu nativo no Android. Na Web, `Share.share` do React Native Web cai para `navigator.share`
quando existe, ou precisa de fallback manual para `navigator.clipboard.writeText` quando não
existe (a maioria dos navegadores desktop). Não é necessário adicionar nenhuma dependência nova.

## Arquitetura em 7 Camadas (MVVM)

1. **Model:** nenhuma entidade nova — usa o `Book` já existente (`id` para montar o link).
2. **Infra:** nenhum datasource novo.
3. **DI:** nenhum registro novo.
4. **UseCase:**
   - `src/usecase/shareUseCases.ts` com `buildListingShareUrl(bookId)` (monta a URL pública do
     anúncio a partir de uma base configurável, ex. `EXPO_PUBLIC_WEB_BASE_URL`).
5. **ViewModel:**
   - `src/viewmodel/useShareListingViewModel.ts`: decide entre `Share.share` (Android) e
     clipboard (Web), expõe `share()` e `justCopied` (para o feedback "Link copiado").
6. **View:**
   - Botão "Compartilhar" (ícone `share`, já mapeado em `AppIcon.tsx`) no detalhe do livro.
   - Feedback visual "Link copiado" via `Snackbar` (ver `design-system/04-componentes/snackbar.md`).
7. **App (Expo Router):**
   - Nenhuma rota nova — a ação vive dentro de `src/app/livro/[id].tsx`. Confirmar que essa rota
     já aceita ser aberta via deep link direto (sem passar pela Home) — se não aceitar, é um
     ajuste de roteamento dentro desta spec, não uma spec separada.
8. **Testes e Validação:**
   - Teste do usecase (montagem de URL), do viewmodel (ramos Android vs. Web) e do botão na view.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
