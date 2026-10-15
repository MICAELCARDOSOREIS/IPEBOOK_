# Tarefas: Denúncia de Anúncio (Spec 011)

- [x] T001 Criar entidade `ReportListing` em `src/model/entities/report.ts` e interface `IReportDataSource` em `src/model/datasources/iReportDataSource.ts`.
- [x] T002 Implementar `MemoryReportDataSource` em `src/infra/datasources/memoryReportDataSource.ts` e `SupabaseReportDataSource` em `src/infra/datasources/supabaseReportDataSource.ts`.
- [x] T003 Implementar caso de uso `ReportUseCases` em `src/usecase/reportUseCases.ts` e injetar em `src/di/container.ts`.
- [x] T004 Implementar ViewModel `useReportListingViewModel` em `src/viewmodel/useReportListingViewModel.ts`.
- [x] T005 Implementar View `ReportListing` em `src/view/listings/reportListing.tsx`.
- [x] T006 Adicionar botão "Denunciar anúncio" em `src/view/listings/bookDetail.tsx`.
- [x] T007 Criar rota `src/app/denunciar/[id].tsx` e integrar no fluxo de navegação.
- [x] T008 Criar testes unitários e de componente cobrindo caso de uso, ViewModel e View.
- [x] T009 Executar validação de arquitetura, tipos, testes e build (`npm run validate` e `npm run build:web`).
