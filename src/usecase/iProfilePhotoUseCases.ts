export type ProfilePhotoFile = {
  bytes: Uint8Array;
  fileName: string;
};

export interface IProfilePhotoUseCases {
  /** Valida a imagem pelo conteúdo e a envia ao Storage; devolve a URL pública (ADR 0065). */
  uploadProfilePhoto(userId: string, file: ProfilePhotoFile): Promise<string>;
}
