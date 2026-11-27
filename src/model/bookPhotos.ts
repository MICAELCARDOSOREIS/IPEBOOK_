export type BookPhotoSide = "cover" | "spine" | "back";

export type BookSidePhotos = {
  spinePhotoUrl?: string;
  backPhotoUrl?: string;
  extras: readonly string[];
};

const SPINE_PATTERN = /(?:^|[/._-])(?:lombada|spine)(?:[/._-]|$)/i;
const BACK_PATTERN = /(?:^|[/._-])(?:verso|back)(?:[/._-]|$)/i;

/** Identifica se a URL de uma foto extra foi marcada como lombada ou verso pelo nome do arquivo. */
export function detectBookPhotoSide(url: string): "spine" | "back" | null {
  const cleaned = url.trim();
  if (!cleaned) return null;
  let pathToInspect = cleaned;
  try {
    const parsed = new URL(cleaned);
    pathToInspect = `${parsed.pathname}${parsed.hash}`;
  } catch {
    pathToInspect = cleaned;
  }
  if (SPINE_PATTERN.test(pathToInspect)) return "spine";
  if (BACK_PATTERN.test(pathToInspect)) return "back";
  return null;
}

/**
 * Mapeia `book.photos` para lombada (`spinePhotoUrl`), verso (`backPhotoUrl`) e eventuais fotos extras.
 * Respeita marcações explícitas (`foto-lombada-*` / `foto-verso-*`) e mantém retrocompatibilidade com
 * livros legados sem marcação (`photos[0]` = lombada, `photos[1]` = verso).
 */
export function extractBookSidePhotos(photos?: readonly string[] | null): BookSidePhotos {
  if (!photos || photos.length === 0) {
    return { extras: [] };
  }
  const validUrls = photos.map((url) => url.trim()).filter((url) => url.length > 0);
  let spinePhotoUrl: string | undefined;
  let backPhotoUrl: string | undefined;
  const untagged: string[] = [];
  const extras: string[] = [];

  for (const url of validUrls) {
    const side = detectBookPhotoSide(url);
    if (side === "spine" && !spinePhotoUrl) {
      spinePhotoUrl = url;
    } else if (side === "back" && !backPhotoUrl) {
      backPhotoUrl = url;
    } else if (side === null) {
      untagged.push(url);
    } else {
      extras.push(url);
    }
  }

  for (const url of untagged) {
    if (!spinePhotoUrl) {
      spinePhotoUrl = url;
    } else if (!backPhotoUrl) {
      backPhotoUrl = url;
    } else {
      extras.push(url);
    }
  }

  return {
    ...(spinePhotoUrl ? { spinePhotoUrl } : {}),
    ...(backPhotoUrl ? { backPhotoUrl } : {}),
    extras,
  };
}

/** Converte `book.photos` persistidas para o vetor posicional da UI (`[lombada, verso, ...]`). */
export function toSlotPhotos(photos?: readonly string[] | null): readonly string[] {
  const { spinePhotoUrl, backPhotoUrl, extras } = extractBookSidePhotos(photos);
  const slots: string[] = [];
  if (spinePhotoUrl) slots[0] = spinePhotoUrl;
  if (backPhotoUrl) {
    if (slots[0] === undefined) slots[0] = "";
    slots[1] = backPhotoUrl;
  }
  for (const extra of extras) {
    if (slots[0] === undefined) slots[0] = "";
    if (slots[1] === undefined) slots[1] = "";
    slots.push(extra);
  }
  return slots;
}

/** Remove espaços vazios dos slots posicionais antes de validar ou persistir no banco (`^https://`). */
export function compactPhotosForPersistence(photos: readonly string[]): readonly string[] {
  return photos.map((url) => url.trim()).filter((url) => url.length > 0);
}
