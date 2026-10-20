# Validação da Spec 018: Perfil Público do Anunciante e Fotos

Data: 2026-10-20.
Branch: `feature/73-perfil-publico-anunciante`.

## Resumo da Entrega

Perfil público (somente leitura) de quem anuncia, acessível a partir do detalhe do anúncio, com
nome, avaliação média (ou "Sem avaliações ainda"), contagem de avaliações e negociações
concluídas, sem expor contato direto. Galeria de fotos do anúncio em tela cheia, com navegação,
como modal dentro do próprio detalhe do anúncio — sem ação de abrir galeria quando o anúncio só
tem capa ilustrativa.

## Limitações e decisões registradas

- **Nome do perfil**: o sistema hoje não coleta nome de usuário (`User` só tem `id`/`email`,
  spec 007). Foi criada uma tabela pública `v2_profiles` com nome padrão (`Usuário #XXXX`),
  criado automaticamente (idempotente) na primeira consulta ao perfil. A edição do nome é do
  fluxo 07 · Perfil e conta (issues #55/#56), fora de escopo aqui.
- **Negociações concluídas**: não existe estado "concluída" em `BookRequest` (specs 004/009); a
  contagem usa pedidos com status `accepted` (como dono do anúncio ou como solicitante). A
  spec 009 já registra que a avaliação mútua pós-encontro é entrega futura.
- **Avaliações**: entidade `Rating` e tabela `v2_ratings` criadas (schema e RLS), mas não há
  ainda nenhum fluxo de UI para avaliar após uma negociação — todo perfil mostra "Sem avaliações
  ainda" até esse fluxo existir. Critério de aceite correspondente (estado "sem avaliações")
  está cobrto.
- **Rota de perfil**: o código já continha uma referência a `/usuario/[id]` (comentário citando a
  futura issue #55) usada no detalhe do anúncio; foi redirecionada para `/perfil/[userId]`
  (somente leitura, Spec 018), distinta da futura edição do próprio perfil.

## Verificações Executadas

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| **TypeScript / Tipos** | `npm run typecheck` | **Aprovado**: sem erros de tipo. |
| **Arquitetura** | `npm run check:architecture` | **Aprovado**: 167 arquivos verificados, 0 violações de importação. |
| **SQL & Migrações** | `npm run test:sql` | **Aprovado**: cenários de RLS e integridade validados localmente (PGlite). |
| **Testes Automatizados** | `npm run test:coverage` | **Aprovado**: 506 testes passando em 82 arquivos. |
| **Cobertura de Código** | Vitest coverage | **Aprovado**: Statements 89,38%, Branches 80,10%, Funções 87,33%, Linhas 90,91% (todos acima do limiar de 80%). |
| **Build Web Estático** | `npm run build:web` | **Aprovado**: rotas estáticas geradas em `dist/`, incluindo `/perfil/[userId]`. |

Obs.: as verificações foram executadas em um worktree Git isolado (`feature/73-perfil-publico-anunciante`)
porque o diretório de trabalho principal estava sendo usado simultaneamente por outra sessão
trabalhando na issue #76 (mesmo repositório); nenhum arquivo dessa outra issue foi alterado.

## Arquivos Criados e Modificados

- `specs/018-perfil-publico-do-anunciante-e-fotos/tasks.md`, `validacao.md`
- `src/model/entities/rating.ts`, `publicProfile.ts`
- `src/model/datasources/iRatingDataSource.ts`, `iProfileDataSource.ts`
- `src/infra/datasources/memoryRatingDataSource.ts`, `supabaseRatingDataSource.ts`,
  `memoryProfileDataSource.ts`, `supabaseProfileDataSource.ts`
- `src/usecase/iPublicProfileUseCases.ts`, `publicProfileUseCases.ts`
- `src/viewmodel/usePublicProfileViewModel.ts`
- `src/view/listings/publicProfile.tsx`, `photoGallery.tsx`
- `src/view/listings/bookDetail.tsx` (ação de abrir a galeria)
- `src/app/perfil/[userId].tsx` (rota nova)
- `src/app/livro/[id].tsx` (passou a navegar para `/perfil/[userId]`)
- `src/di/container.ts` (registro de `profiles`, `ratings` e `publicProfileUseCases`)
- `supabase/migrations/202610200001_perfil_publico_e_avaliacoes.sql` (`v2_profiles`, `v2_ratings`, RLS)
- `tests/unit/publicProfileUseCases.test.ts`
- `tests/hooks/usePublicProfileViewModel.test.tsx`
- `tests/components-mocked/publicProfileView.test.tsx`
- `tests/components/photoGallery.test.tsx`
- `tests/components-mocked/bookDetailView.test.tsx` (casos novos de galeria e denúncia)
