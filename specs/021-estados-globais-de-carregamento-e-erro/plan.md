# Plano de Implementação: Estados Globais de Carregamento e Erro (Spec 021)

## Arquitetura em 7 Camadas (MVVM)

1. **Model:** nenhuma entidade nova.
2. **Infra:** nenhum datasource novo — mas conferir se `DataSourceError` (`src/model/errors.ts`,
   já usado em `src/di/container.ts`) é suficiente para distinguir "sem conexão" de "erro do
   servidor", ou se precisa de um subtipo novo.
3. **DI:** nenhum registro novo.
4. **UseCase:** nenhuma regra de negócio nova.
5. **ViewModel:**
   - Nenhum ViewModel novo dedicado — o padrão é um hook utilitário
     `src/viewmodel/useAsyncState.ts` (ou nome equivalente) que os ViewModels existentes passam
     a usar para `loading`/`error`, em vez de cada um reimplementar o próprio estado.
6. **View:**
   - `src/view/components/LoadingState.tsx`, `OfflineState.tsx`, `ErrorState.tsx` — componentes
     reutilizáveis em `src/view/components/`, seguindo o mesmo padrão de `BookCover.tsx` etc.
     (tokens, acessibilidade, sem lógica de domínio).
   - Documentar os três no `design-system/04-componentes/` (anatomia, estados, acessibilidade),
     já que hoje não existe doc nenhuma pra eles.
7. **App (Expo Router):** nenhuma rota nova — os componentes entram dentro das telas existentes.
8. **Testes e Validação:**
   - Testes dos 3 componentes de estado e do hook utilitário.
   - Levantar, no início da implementação, quais telas existentes não tratam esses estados hoje,
     e listar como tarefas específicas (T0XX) antes de aplicar.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
