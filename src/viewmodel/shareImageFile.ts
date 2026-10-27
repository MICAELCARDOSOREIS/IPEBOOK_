/** Abre a folha de compartilhamento do sistema com a imagem; `false` quando o aparelho não oferece (Spec 092). */
export type ShareImageFile = (uri: string, dialogTitle?: string) => Promise<boolean>;

/**
 * `require` síncrono dentro da função: o `import()` dinâmico gera um pacote assíncrono que o Expo Go às
 * vezes não encontra ("Requiring unknown module"), como aconteceu com o `expo-file-system`.
 */
export const defaultShareImageFile: ShareImageFile = async (uri, dialogTitle = "Compartilhar") => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sharing = require("expo-sharing") as typeof import("expo-sharing");
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle });
  return true;
};
