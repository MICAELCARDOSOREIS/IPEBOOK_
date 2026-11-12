# 0099. Verificação de versão no Supabase e modal de atualização na Play Store

- **Status:** Aceito
- **Data:** 2026-11-06
- **Contexto:** Ciclo de vida do aplicativo Android / Distribuição na Google Play Store / Compatibilidade de esquema
- **Especificação:** [128](../../specs/128-aviso-atualizacao-app/spec.md)

## Contexto

O IpêBook já possui a versão `0.1.0` publicada na faixa de teste fechado da Google Play Store (`com.ipebook.app`) e utiliza o `expo-updates` (ADR 0081 / Spec 105) para atualizações remotas de JavaScript que mantenham o mesmo `runtimeVersion`. No entanto, quando há uma nova versão publicada na Play Store (mudança de `version` / `versionCode`, atualização nativa ou evolução de esquema no banco de dados), a pessoa usuária que abre o aplicativo instalado não recebe nenhum aviso dentro do app convidando ou exigindo a atualização pela loja.

Foram avaliadas duas abordagens principais:
1. **API nativa Google Play In-App Updates** (`sp-react-native-in-app-updates` / `expo-in-app-updates`).
2. **Política de versão consultada no Supabase + modal próprio do Design System + redirecionamento via `expo-linking` (`market://details?id=com.ipebook.app` com fallback HTTPS).**

## Decisão

Adotar a **verificação de versão baseada no Supabase com modal próprio do IpêBook e abertura direta da Google Play Store**:

1. **Tabela `public.v2_app_version_policy` no Supabase (`202611060001_politica_versao_app.sql`):**
   - Armazena a política por plataforma (`platform = 'android'`), contendo `latest_version` (versão mais recente publicada na loja), `min_supported_version` (versão mínima exigida para operar com segurança no banco atual), `release_notes` (mensagem curta opcional exibida no diálogo) e `store_url` (URL da página na Play Store).
   - RLS ativada com política `SELECT` pública (`anon` e `authenticated`) e nenhuma permissão de escrita pelo cliente (`INSERT`, `UPDATE` e `DELETE` restritos ao painel administrativo / SQL Editor do Supabase).
   - Registro inicial semeado com `latest_version = '0.1.0'` e `min_supported_version = '0.1.0'`.

2. **Comparação semântica pura no domínio (`src/model/entities/appUpdate.ts`):**
   - Compara a versão instalada (`Constants.expoConfig?.version`) com `minSupportedVersion` e `latestVersion`:
     - Se `currentVersion < minSupportedVersion` → status `"required"` (atualização obrigatória).
     - Se `minSupportedVersion <= currentVersion < latestVersion` → status `"optional"` (atualização opcional recomendada).
     - Caso contrário → status `"up_to_date"`.

3. **Persistência de dispensa por versão (`AsyncStorageAppUpdateDismissDataSource`):**
   - Quando a atualização é `"optional"` e a pessoa escolhe **"Agora não"**, a versão dispensada (`latestVersion`) é gravada em `AsyncStorage` (`ipebook.atualizacaoDispensada`). O aviso não insiste para aquela mesma versão, mas volta a aparecer automaticamente quando uma versão ainda mais nova (ex.: `0.3.0`) for publicada, ou se a atualização se tornar `"required"`.

4. **Abertura da Google Play Store (`ExpoAppStoreLauncherService`):**
   - No Android, tenta abrir diretamente o aplicativo nativo da Play Store via `market://details?id=com.ipebook.app` e, caso o esquema `market://` não esteja disponível no aparelho, recorre à URL HTTPS da Google Play Store (`https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR`).

5. **Experiência na raiz (`AppUpdateGate` em `src/app/_layout.tsx`):**
   - Utiliza o componente `Dialog` do Design System (com barreira modal `accessibilityViewIsModal` e foco preso).
   - Na atualização opcional, exibe **"Atualizar agora"** e **"Agora não"**.
   - Na atualização obrigatória, exibe o aviso bloqueante com ação **"Atualizar na Google Play"** (sem dispensar a exigência).
   - Na Web (`Platform.OS === "web"`), a verificação de loja nativa permanece inativa (`up_to_date`), pois a Web é servida continuamente pelo Cloudflare Pages.

## Alternativas consideradas

- **Google Play In-App Updates API nativa:** descartada como mecanismo principal porque depende de nova biblioteca nativa, não funciona em builds instalados via APK fora da Play Store nem em desenvolvimento local, não permite customizar a mensagem de novidades pelo banco e não oferece controle direto no Supabase para bloquear imediatamente versões incompatíveis com migrações SQL.

## Consequências

- **Positivas:** zero novas dependências nativas no `package.json`; funciona tanto no AAB da Play Store quanto nos APKs de teste; permite ativar aviso opcional ou bloqueio obrigatório instantaneamente pelo Supabase sem publicar código novo; 100% testável em todas as camadas MVVM.
- **Negativas e mitigações:** exige atualizar a linha de `v2_app_version_policy` no Supabase quando uma nova versão for aprovada na Play Store; se a pessoa estiver offline ao abrir o app, a consulta falha silenciosamente e retorna `up_to_date`, nunca bloqueando o uso offline do aplicativo.
