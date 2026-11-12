import { Platform, Share } from "react-native";

/**
 * Abre a folha de compartilhamento do sistema com a imagem **e** o texto (Spec 092); `false` quando o aparelho
 * não consegue compartilhar arquivos e o chamador deve cair no texto sozinho.
 */
export type ShareImageFile = (uri: string, message: string, dialogTitle?: string) => Promise<boolean>;

/**
 * - iOS: `Share.share` aceita `message` e `url` de arquivo ao mesmo tempo.
 * - Android: o `Share` do React Native não anexa arquivo, e o `expo-sharing` não leva texto. A saída é a intenção
 *   nativa `ACTION_SEND` com imagem (`EXTRA_STREAM`, via `content://`) e texto (`EXTRA_TEXT`), que o WhatsApp
 *   e outros apps recebem como imagem com legenda. Se falhar, compartilha só a imagem (o link está escrito nela).
 *
 * Os `require` são síncronos dentro da função: o `import()` dinâmico gera um pacote assíncrono que o Expo Go às
 * vezes não encontra ("Requiring unknown module"), como aconteceu com o `expo-file-system`.
 */
export const defaultShareImageFile: ShareImageFile = async (uri, message, dialogTitle = "Compartilhar") => {
  if (Platform.OS === "ios") {
    await Share.share({ message, url: uri });
    return true;
  }

  if (Platform.OS === "android") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FileSystem = require("expo-file-system/legacy") as typeof import("expo-file-system/legacy");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const IntentLauncher = require("expo-intent-launcher") as typeof import("expo-intent-launcher");
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.SEND", {
        type: "image/png",
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        extra: {
          "android.intent.extra.STREAM": contentUri,
          "android.intent.extra.TEXT": message,
          "android.intent.extra.TITLE": dialogTitle,
        },
      });
      return true;
    } catch {
      // segue para o compartilhamento só da imagem
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sharing = require("expo-sharing") as typeof import("expo-sharing");
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle });
  return true;
};
