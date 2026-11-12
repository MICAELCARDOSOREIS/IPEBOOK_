# Plano de Implementação — Spec 128 (Aviso de atualização na Play Store)

> **Para agentes:** Executar tarefa por tarefa com TDD e validação contínua (`npm run validate`).

**Goal:** Exibir um diálogo dentro do aplicativo Android quando houver versão nova publicada na Google Play Store (opcional ou obrigatória) e abrir diretamente a página do IpêBook no Google Play para atualizar.

**Architecture:** Camadas MVVM completas desacopladas por contratos em `src/model/` e compostas exclusivamente em `src/di/container.ts` (ADR 0098 e ADR 0099). A política de versão vem da tabela pública de leitura `v2_app_version_policy` no Supabase, a dispensa de versão opcional fica em `AsyncStorage` e o redirecionamento usa `expo-linking` (`market://` com fallback HTTPS).

**Tech Stack:** TypeScript 6, React Native / Expo 58 (`expo-constants`, `expo-linking`, `@react-native-async-storage/async-storage`), Supabase (PostgreSQL + RLS), Vitest e PGlite.

**Spec:** `specs/128-aviso-atualizacao-app/spec.md`

## Global Constraints

- Nenhuma dependência nativa nova no `package.json`.
- Nenhum arquivo em `src/viewmodel/` pode importar `@/di/container` (ADR 0098).
- Todo modal deve usar `Dialog` do Design System com `accessibilityViewIsModal` (Spec 125).
- Na Web (`Platform.OS === "web"`), não exibir modal de atualização da Play Store.

## Review Focus

1. **Falha de rede ou offline na abertura:** `AppUpdateUseCases.checkUpdate` deve capturar qualquer erro do datasource e devolver `status: "up_to_date"`, nunca quebrando a abertura do app.
2. **Versão instalada maior que a cadastrada no banco (ex.: build de desenvolvimento `0.2.0` vs banco `0.1.0`):** `compareSemver("0.2.0", "0.1.0") > 0` deve resultar em `"up_to_date"`.
3. **Dispensa de versão anterior (`0.2.0`) quando sai versão nova (`0.3.0`):** a dispensa guarda a string da versão dispensada (`"0.2.0"`), então ao publicar `"0.3.0"` o aviso volta a aparecer.
4. **Atualização obrigatória após dispensa prévia:** mesmo que a pessoa tenha dispensado `"0.2.0"` quando era opcional, se `minSupportedVersion` subir para `"0.2.0"`, o status passa a `"required"` e ignora a dispensa.
5. **Aparelho sem app da Play Store (emulador ou AOSP):** falha em `Linking.openURL("market://...")` faz fallback automático para `https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR`.
