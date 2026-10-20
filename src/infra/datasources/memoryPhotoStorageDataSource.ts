import type { IPhotoStorageDataSource, UploadPhotoPayload } from "@/model/datasources/iPhotoStorageDataSource";
import { ValidationError } from "@/model/errors";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "./supabasePhotoStorageDataSource";

export class MemoryPhotoStorageDataSource implements IPhotoStorageDataSource {
  private readonly uploaded = new Map<string, Uint8Array | ArrayBuffer>();

  async uploadPhoto(payload: UploadPhotoPayload): Promise<string> {
    if (!payload.userId || !payload.userId.trim()) {
      throw new ValidationError("Usuário obrigatório para envio de foto.");
    }
    if (payload.fileBytes.byteLength > MAX_PHOTO_SIZE_BYTES) {
      throw new ValidationError("A imagem deve ter no máximo 5MB.");
    }
    const normalizedMime = payload.contentType.toLowerCase().trim();
    if (!ALLOWED_PHOTO_MIME_TYPES.has(normalizedMime)) {
      throw new ValidationError("Formato de imagem não suportado. Use JPEG, PNG ou WEBP.");
    }

    const fakeUrl = `https://mock.storage.local/book-photos/${payload.userId}/${Date.now()}-${payload.fileName}`;
    this.uploaded.set(fakeUrl, payload.fileBytes);
    return fakeUrl;
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    this.uploaded.delete(photoUrl);
  }

  has(photoUrl: string): boolean {
    return this.uploaded.has(photoUrl);
  }
}
