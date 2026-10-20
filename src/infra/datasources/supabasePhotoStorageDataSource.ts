import type { IPhotoStorageDataSource, UploadPhotoPayload } from "@/model/datasources/iPhotoStorageDataSource";
import { DataSourceError, ValidationError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

export const BUCKET_NAME = "book-photos";
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class SupabasePhotoStorageDataSource implements IPhotoStorageDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async uploadPhoto(payload: UploadPhotoPayload): Promise<string> {
    if (!payload.userId || !payload.userId.trim()) {
      throw new ValidationError("Usuário obrigatório para envio de foto.");
    }
    const byteLength = payload.fileBytes.byteLength;
    if (byteLength > MAX_PHOTO_SIZE_BYTES) {
      throw new ValidationError("A imagem deve ter no máximo 5MB.");
    }
    const normalizedMime = payload.contentType.toLowerCase().trim();
    if (!ALLOWED_PHOTO_MIME_TYPES.has(normalizedMime)) {
      throw new ValidationError("Formato de imagem não suportado. Use JPEG, PNG ou WEBP.");
    }

    const bookPrefix = payload.bookId ? `${payload.bookId}/` : "";
    const cleanFileName = payload.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${payload.userId.trim()}/${bookPrefix}${Date.now()}-${cleanFileName}`;

    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .upload(path, payload.fileBytes, {
        contentType: normalizedMime,
        upsert: false,
      });

    if (error) {
      throw new DataSourceError("Não foi possível enviar a foto.");
    }

    const { data } = this.client.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    if (!photoUrl || !photoUrl.trim()) return;
    try {
      const url = new URL(photoUrl);
      const marker = `/${BUCKET_NAME}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
        await this.client.storage.from(BUCKET_NAME).remove([path]);
      }
    } catch {
      // Ignora falhas de parse de URL inválida
    }
  }
}
