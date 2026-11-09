# Especificação 129 — Verificação automática de atualizações via Google Play In-App Updates

**Estado:** Especificada em 2026-11-09
**ADR:** [0100](../../docs/adr/0100-google-play-in-app-updates.md)

## Objetivo e escopo

Permitir que o aplicativo detecte novas versões disponíveis na Google Play Store de forma 100% direta e automática, sem necessidade de atualizar manualmente a tabela de política no Supabase a cada nova release publicada.

Ao abrir o aplicativo em dispositivo Android, o app consulta o serviço de atualização nativo da loja:
1. Se a Google Play indicar que há uma nova versão disponível na loja, o app oferece o fluxo de atualização diretamente na interface nativa da Play Store ou via modal com redirecionamento direto.
2. Mantém compatibilidade integral com o mecanismo de contingência e fallback caso o dispositivo esteja offline, sem Google Play Services ou em ambiente Web.
3. Não quebra a arquitetura MVVM nem as regras de injeção de dependência do projeto.

## Regras de negócio

- **RN-01 (Detecção automática de loja):** O serviço de consulta de versão (`IAppStoreUpdateService` / `IAppVersionPolicyDataSource`) deve consultar o status de atualização disponível na Google Play.
- **RN-02 (Fallback transparente):** Caso a verificação direta na loja não esteja disponível (dispositivo sem Play Services, emulador, rede instável, ou Web), o app recorre à política remota do Supabase (`v2_app_version_policy`) ou encerra silenciosamente como `up_to_date` sem interromper a navegação da pessoa usuária.
- **RN-03 (Paridade de plataformas):** No ambiente Web (`Platform.OS === 'web'`), nenhuma verificação de loja nativa é executada, mantendo o status `up_to_date`.
- **RN-04 (Desacoplamento e testabilidade):** O serviço de In-App Update deve ser encapsulado sob contrato de interface (`IInAppUpdateService`), permitindo implementação em memória para os 301+ testes automatizados sem dependência do ambiente nativo da Google Play.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Contrato de interface e entidade para provedor de atualização direta da loja implementados no modelo de domínio. | `src/model/services/iInAppUpdateService.ts` |
| CA2 | Provedores em memória e nativo implementados com tratamento seguro de erros para dispositivos sem Play Store ou offline. | `src/infra/services/memoryInAppUpdateService.ts` e `tests/unit/inAppUpdateService.test.ts` |
| CA3 | Integração com `AppUpdateUseCases` priorizando a consulta direta da Google Play e fallback para a política remota / armazenamento local. | `tests/unit/appUpdateUseCases.test.ts` |
| CA4 | Suíte de testes automatizados, verificação de arquitetura, tipos e documentação 100% aprovados. | `npm run validate` e `npm run check:docs` |
