export type ImageSource = "camera" | "library";

export type PickedImage = {
  bytes: Uint8Array;
  fileName: string;
};

export interface IImagePickerService {
  /**
   * Abre a câmera ou a galeria com recorte quadrado. Devolve `null` quando a pessoa cancela e lança
   * `ValidationError` com mensagem amigável quando a permissão é negada (ADR 0065).
   */
  pickSquareImage(source: ImageSource): Promise<PickedImage | null>;

  /**
   * Como `pickSquareImage`, com a proporção do recorte escolhida; a capa de livro usa 5:8 (Spec 092).
   */
  pickImage(source: ImageSource, aspect: readonly [number, number]): Promise<PickedImage | null>;
}
