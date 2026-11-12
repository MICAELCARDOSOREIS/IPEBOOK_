/** Tipos de imagem aceitos em fotos enviadas pelo app (ADR 0026, ADR 0065). */
export type AcceptedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024;

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

/**
 * Identifica a imagem pelos bytes iniciais (*magic bytes*), não pelo nome nem pelo tipo declarado.
 * Devolve `null` para qualquer outro conteúdo, inclusive texto ou arquivo truncado.
 */
export function detectImageMimeType(bytes: Uint8Array): AcceptedImageMimeType | null {
  if (bytes.length < 12) return null;
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  return null;
}
