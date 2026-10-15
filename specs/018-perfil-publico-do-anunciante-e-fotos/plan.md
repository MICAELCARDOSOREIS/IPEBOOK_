# Plano de Implementação: Perfil Público do Anunciante e Fotos (Spec 018)

## Observação de dependência

Não existe hoje nenhuma entidade de avaliação (`rating`) no código (`src/model/entities/`).
A tela de perfil público depende de "avaliação média" e "negociações concluídas" — se a
spec 009 (detalhes da negociação) ainda não grava uma avaliação ao concluir, criar aqui o
mínimo necessário (ver Model abaixo) em vez de assumir que já existe.

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - `src/model/entities/rating.ts`: `Rating { id, raterId, ratedUserId, requestId, score (1-5),
     createdAt }`, se ainda não existir nenhuma forma de avaliação ligada à spec 009.
   - `src/model/entities/user.ts`: conferir se já tem campos suficientes para o perfil público
     (nome, data de entrada); estender só se faltar.
   - `src/model/datasources/iRatingDataSource.ts`.
2. **Infra:**
   - `src/infra/datasources/memoryRatingDataSource.ts` / `supabaseRatingDataSource.ts`.
3. **DI:**
   - Registrar `ratings` em `createDataSources()` e expor `ratingUseCases` em
     `src/di/container.ts`.
4. **UseCase:**
   - `src/usecase/ratingUseCases.ts` (`getPublicProfile(userId)` agregando nome, média, contagem
     de avaliações e negociações concluídas — reaproveitando `bookRequestUseCases` para contar
     concluídas).
5. **ViewModel:**
   - `src/viewmodel/usePublicProfileViewModel.ts`.
   - `src/viewmodel/usePhotoGalleryViewModel.ts` (ou estado local simples, sem necessidade de
     datasource — é só navegação entre as fotos já carregadas do anúncio).
6. **View:**
   - `src/view/listings/publicProfile.tsx` + `publicProfileScreen.tsx`.
   - `src/view/listings/photoGallery.tsx` (modal/tela cheia).
   - Link no detalhe do livro (`src/view/listings/` usado por `src/app/livro/[id].tsx`) para
     nome do anunciante e fotos.
7. **App (Expo Router):**
   - `src/app/perfil/[userId].tsx` (perfil público — rota dinâmica, distinta de uma futura rota
     de perfil próprio do fluxo 07).
   - `src/app/livro/[id]/fotos.tsx` ou modal dentro da própria rota de detalhe.
8. **Testes e Validação:**
   - Testes de usecase (agregação de avaliação e contagem), viewmodel e view.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
