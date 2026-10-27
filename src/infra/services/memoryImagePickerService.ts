import type { IImagePickerService, ImageSource, PickedImage } from "@/model/services/iImagePickerService";

/** Seletor em memória para testes e modo sem backend: devolve a imagem configurada ou `null` (cancelado). */
export class MemoryImagePickerService implements IImagePickerService {
  constructor(private next: PickedImage | null = null) {}

  setNext(image: PickedImage | null): void {
    this.next = image;
  }

  async pickSquareImage(_source: ImageSource): Promise<PickedImage | null> {
    return this.next;
  }
}
