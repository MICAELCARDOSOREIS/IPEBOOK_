# Plano de Implementação — Spec 029: Download de Dados Pessoais LGPD

## 1. Etapas Técnicas

1. **Serviço de Download**:
   - Criar contrato `IFileDownloadService` em `src/model/services/iFileDownloadService.ts`.
   - Implementar `FileDownloadService` em `src/infra/services/fileDownloadService.ts`.
   - Registrar em `src/di/container.ts`.

2. **Evolução do ViewModel**:
   - Injetar `userDataExportUseCases` e `fileDownloadService` em `useDeleteAccountViewModel.ts`.
   - Adicionar estados: `exporting: boolean`, `exportSuccess: boolean`.
   - Adicionar ação: `downloadUserData(sessionUserId: string): Promise<boolean>`.

3. **Atualização da View**:
   - Incluir o card de portabilidade LGPD em `src/view/auth/deleteAccount.tsx` com botão acessível para download dos dados.

4. **Testes e Validação**:
   - Testes unitários do serviço e testes de integração em `tests/unit/fileDownloadService.test.ts`.
   - Atualizar `tests/components/deleteAccountView.test.tsx` e `tests/hooks/useDeleteAccountViewModel.test.tsx`.
   - Executar `npm run verify:release`.
