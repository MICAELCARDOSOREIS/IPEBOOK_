export interface ImageFileValidationInput {
  name: string;
  size: number;
  type: string;
}

export interface ImageFileValidationResult {
  valid: boolean;
  error?: string;
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (limite do bucket book-photos)

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_IMAGE_EXTENSIONS = Object.freeze([
  "jpg",
  "jpeg",
  "png",
  "webp",
]);

/**
 * Valida se um arquivo de imagem atende aos critérios de segurança, formato e tamanho do bucket.
 */
export function validateImageFile(file: ImageFileValidationInput): ImageFileValidationResult {
  if (!file || !file.name || typeof file.size !== "number") {
    return { valid: false, error: "Arquivo de imagem inválido ou incompleto." };
  }

  if (file.size <= 0) {
    return { valid: false, error: "O arquivo de imagem está vazio." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "O tamanho da imagem excede o limite máximo permitido de 5 MB.",
    };
  }

  const normalizedType = file.type?.toLowerCase().trim();
  const extension = file.name.split(".").pop()?.toLowerCase().trim() ?? "";

  const isValidMime = ALLOWED_IMAGE_MIME_TYPES.includes(normalizedType);
  const isValidExt = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!isValidMime && !isValidExt) {
    return {
      valid: false,
      error: "Formato de imagem não suportado. Utilize apenas JPEG, PNG ou WebP.",
    };
  }

  return { valid: true };
}

/**
 * Sanitiza o nome do arquivo para upload, prevenindo path traversal e caracteres perigosos.
 */
export function sanitizeImageFilename(originalName: string, prefix = "capa"): string {
  const extension = (originalName.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.includes(extension) ? extension : "jpg";
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return `${prefix}_${uniqueId}.${safeExt}`;
}
