# Especificação 128 — Aviso de atualização do app e redirecionamento para a Google Play Store

**Estado:** Especificada e implementada em 2026-11-06
**ADR:** [0099](../../docs/adr/0099-verificacao-de-versao-e-atualizacao-na-loja.md)

## Objetivo e escopo

Com a versão `0.1.0` publicada no teste fechado da Google Play Store (`com.ipebook.app`), o aplicativo precisa avisar as pessoas usuárias dentro do próprio app quando uma nova versão estiver disponível na loja e levá-las diretamente para a página do IpêBook na Google Play para atualizar. Além do aviso opcional (que pode ser adiado com "Agora não"), o mecanismo deve suportar atualização obrigatória (`min_supported_version`) para proteger a comunidade caso uma evolução do banco de dados torne versões muito antigas incompatíveis.

Fora do escopo: adicionar bibliotecas nativas de terceiros para In-App Updates, alterar o fluxo de atualizações silenciosas de JavaScript via `expo-updates` (Spec 105 / ADR 0081) ou exibir aviso de Play Store na versão Web.

## Regras de negócio

- **RN-01 (Política remota no Supabase):** A tabela `public.v2_app_version_policy` guarda, por plataforma (`android`), a versão mais recente disponível (`latest_version`), a versão mínima exigida (`min_supported_version`), um resumo opcional das novidades (`release_notes` até 280 caracteres) e a URL da loja (`store_url`). Qualquer pessoa (`anon` ou `authenticated`) pode ler a política (`SELECT`), mas clientes nunca podem inserir, atualizar ou excluir registros.
- **RN-02 (Comparação semântica de versão):** Ao abrir o app nativo, a versão instalada (`Constants.expoConfig?.version`, ex.: `0.1.0`) é comparada com a política:
  - Se `installedVersion < minSupportedVersion`: o estado é `"required"` (atualização obrigatória).
  - Se `minSupportedVersion <= installedVersion < latestVersion`: o estado é `"optional"` (atualização disponível).
  - Se `installedVersion >= latestVersion` (ou em caso de falha de rede / Web): o estado é `"up_to_date"` (nenhum modal é exibido).
- **RN-03 (Dispensa por versão nas atualizações opcionais):** Quando o estado é `"optional"`, se a pessoa tocar em **"Agora não"**, o app grava `latestVersion` no armazenamento local (`ipebook.atualizacaoDispensada`) e fecha o diálogo. O diálogo não volta a aparecer para aquela mesma `latestVersion`, mas aparece normalmente quando uma versão superior for publicada ou se `minSupportedVersion` subir tornando a atualização `"required"`.
- **RN-04 (Atualização obrigatória não dispensável):** Quando o estado é `"required"`, o diálogo informa que a atualização é necessária para continuar usando o IpêBook e oferece o botão **"Atualizar na Google Play"** sem opção de dispensar a atualização.
- **RN-05 (Abertura direta na Google Play Store):** Ao confirmar a atualização, o app tenta abrir o protocolo nativo `market://details?id=com.ipebook.app` para levar direto à tela de atualização na Play Store; se o aparelho não suportar `market://`, abre o link HTTPS da Play Store (`https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR` ou `storeUrl` configurado).

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Migração `202611060001_politica_versao_app.sql` cria `v2_app_version_policy` com semente `0.1.0`, permite leitura por `anon`/`authenticated` e bloqueia escrita por clientes. | `npm run test:sql` (`scripts/verificar-migracoes.mjs`) |
| CA2 | Comparador semântico `compareSemver` e avaliador `evaluateAppUpdateStatus` classificam corretamente `up_to_date`, `optional` e `required`, tratando strings inválidas com segurança. | `tests/unit/appUpdateUseCases.test.ts` |
| CA3 | `AppUpdateUseCases` suprime o aviso `"optional"` quando a mesma `latestVersion` já foi dispensada no aparelho, mas exibe quando sai versão maior ou quando o status é `"required"`, e nunca trava em falha de rede. | `tests/unit/appUpdateUseCases.test.ts` |
| CA4 | `ExpoAppStoreLauncherService` abre `market://details?id=com.ipebook.app` no Android e cai para a URL HTTPS da Google Play quando `market://` falha. | `tests/unit/expoAppStoreLauncherService.test.ts` |
| CA5 | `useAppUpdateViewModel` carrega o estado na abertura, aciona a abertura da loja em `openStore()` e registra a dispensa em `dismiss()` apenas para atualização opcional. | `tests/hooks/useAppUpdateViewModel.test.tsx` |
| CA6 | `AppUpdateGate` renderiza o diálogo acessível (`Dialog`) com notas de versão quando presentes, botões "Atualizar agora" / "Agora não" no modo opcional e bloqueio no modo obrigatório, integrado em `src/app/_layout.tsx` sem violar ADR 0098. | `tests/components/appUpdateGate.test.tsx`, `npm run check:architecture` e `npm run validate` |
