import type { IPhotoStorageDataSource } from "@/model/datasources/iPhotoStorageDataSource";
import { ValidationError } from "@/model/errors";
import { detectImageMimeType, MAX_UPLOAD_IMAGE_BYTES } from "@/model/validators/imageBytesValidator";
import type { IProfilePhotoUseCases, ProfilePhotoFile } from "@/usecase/iProfilePhotoUseCases";

const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export class ProfilePhotoUseCases implements IProfilePhotoUseCases {
  constructor(private readonly photos: IPhotoStorageDataSource) {}

  async uploadProfilePhoto(userId: string, file: ProfilePhotoFile): Promise<string> {
    const owner = userId.trim();
    if (!owner) throw new ValidationError("Entre na sua conta para trocar a foto.");
    if (file.bytes.byteLength > MAX_UPLOAD_IMAGE_BYTES) {
      throw new ValidationError("A foto deve ter no máximo 5 MB.");
    }
    const contentType = detectImageMimeType(file.bytes);
    if (!contentType) throw new ValidationError("Use uma foto em JPEG, PNG ou WebP.");

    // A pasta `perfil` fica dentro da pasta do usuário, que as políticas do bucket já isolam (ADR 0065).
    return this.photos.uploadPhoto({
      userId: owner,
      bookId: "perfil",
      fileName: `avatar.${EXTENSIONS[contentType]}`,
      fileBytes: file.bytes,
      contentType,
    });
  }
}
