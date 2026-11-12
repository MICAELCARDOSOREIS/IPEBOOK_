import type { IPhotoStorageDataSource } from "@/model/datasources/iPhotoStorageDataSource";
import { ValidationError } from "@/model/errors";
import { detectImageMimeType, MAX_UPLOAD_IMAGE_BYTES } from "@/model/validators/imageBytesValidator";
import type { IListingPhotoUseCases, ListingPhotoFile } from "@/usecase/iListingPhotoUseCases";

const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

/** Fotos de anúncio pela câmera ou galeria (Spec 092): mesma validação por conteúdo da foto de perfil. */
export class ListingPhotoUseCases implements IListingPhotoUseCases {
  constructor(private readonly photos: IPhotoStorageDataSource) {}

  async uploadListingPhoto(userId: string, file: ListingPhotoFile): Promise<string> {
    const owner = userId.trim();
    if (!owner) throw new ValidationError("Entre na sua conta para enviar fotos.");
    if (file.bytes.byteLength > MAX_UPLOAD_IMAGE_BYTES) {
      throw new ValidationError("A foto deve ter no máximo 5 MB.");
    }
    const contentType = detectImageMimeType(file.bytes);
    if (!contentType) throw new ValidationError("Use uma foto em JPEG, PNG ou WebP.");

    // A pasta `anuncio` fica dentro da pasta da pessoa, que as políticas do bucket já isolam (ADR 0065);
    // o nome é único para não sobrescrever uma foto anterior do mesmo anúncio.
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return this.photos.uploadPhoto({
      userId: owner,
      bookId: "anuncio",
      fileName: `foto-${unique}.${EXTENSIONS[contentType]}`,
      fileBytes: file.bytes,
      contentType,
    });
  }
}
