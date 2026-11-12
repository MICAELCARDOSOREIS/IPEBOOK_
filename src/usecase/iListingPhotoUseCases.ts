export type ListingPhotoFile = {
  bytes: Uint8Array;
  fileName: string;
};

export interface IListingPhotoUseCases {
  /** Valida a imagem pelo conteúdo e a envia ao Storage na pasta de anúncios da pessoa; devolve a URL pública. */
  uploadListingPhoto(userId: string, file: ListingPhotoFile): Promise<string>;
}
