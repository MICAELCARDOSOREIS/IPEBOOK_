# Plano de Implementação: Denúncia de Anúncio (Spec 011)

## Arquitetura MVVM Sofisticada em 7 Camadas

1. **Camada Model (Domínio):**
   - `src/model/entities/report.ts`: Definição de `ReportReason`, `ReportListing` e tipo de entrada.
   - `src/model/datasources/iReportDataSource.ts`: Interface de repositório.
2. **Camada Infraestrutura:**
   - `src/infra/datasources/memoryReportDataSource.ts`: Repositório em memória com array interno.
   - `src/infra/datasources/supabaseReportDataSource.ts`: Repositório Supabase (tabela `reports` / `v2_reports`).
3. **Camada Caso de Uso:**
   - `src/usecase/reportUseCases.ts`: Regras de negócio e validação de sessão e dados de denúncia.
4. **Camada Injeção de Dependências:**
   - `src/di/container.ts`: Registro de `reportDataSource` e `reportUseCases`.
5. **Camada ViewModel:**
   - `src/viewmodel/useReportListingViewModel.ts`: Estado reativo e ações para submissão.
6. **Camada View:**
   - `src/view/listings/reportListing.tsx`: Tela com seleção de motivos, campo de observação e tela de sucesso.
   - `src/view/listings/bookDetail.tsx`: Inclusão de botão de navegação "Denunciar anúncio".
7. **Camada App (Rotas):**
   - `src/app/denunciar/[id].tsx`: Rota dinâmica do Expo Router.
8. **Testes:**
   - Teste unitário do caso de uso em `tests/usecase/reportUseCases.test.ts`.
   - Teste do ViewModel em `tests/viewmodel/reportListingViewModel.test.ts`.
   - Teste de componente da View em `tests/components/reportListingView.test.tsx`.
