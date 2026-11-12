export type BookFace = "front" | "back" | "left" | "right";

export type ProjectedFace = Readonly<{
  face: BookFace;
  /** Centro da face projetada, em dp, a partir do centro do livro (positivo = direita). */
  center: number;
  /** Largura da face projetada, em dp. */
  width: number;
  /** Escurecimento de 0 (de frente para a luz) a ~0,5 (de lado), para dar volume. */
  shade: number;
}>;

/** Normaliza qualquer ângulo para o intervalo (-180, 180]. */
export function normalizeAngle(degrees: number): number {
  const wrapped = ((degrees % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

/**
 * Faces visíveis de um livro (caixa de `width` x `depth`) girado `angle` graus em torno do eixo vertical, em
 * projeção ortogonal: cada face vira um retângulo só comprimido na horizontal. Com 0° vê-se a capa; com 90° a
 * lombada (esquerda); com 180° a contracapa; com 270° o corte das páginas (direita).
 */
export function projectBookFaces(angle: number, width: number, depth: number): ProjectedFace[] {
  const rad = (normalizeAngle(angle) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const faces: ProjectedFace[] = [];
  if (cos > 0) faces.push({ face: "front", center: (depth / 2) * sin, width: width * cos, shade: 0.5 * (1 - cos) });
  if (cos < 0) faces.push({ face: "back", center: -(depth / 2) * sin, width: width * -cos, shade: 0.5 * (1 + cos) });
  if (sin > 0) faces.push({ face: "left", center: -(width / 2) * cos, width: depth * sin, shade: 0.28 * (1 - sin) + 0.08 });
  if (sin < 0) faces.push({ face: "right", center: (width / 2) * cos, width: depth * -sin, shade: 0.28 * (1 + sin) + 0.08 });
  return faces.filter((face) => face.width >= 0.5);
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Opacidade do conteúdo de uma face, de 0 a 1, conforme a fração da largura que ela mostra (`ratio`). Quase de
 * lado, a capa e a contracapa espremidas só mostram pedaços de letra e de arte, e o texto da lombada fica
 * ilegível; então o conteúdo some aos poucos e fica uma faixa lisa da cor do livro.
 */
export function faceContentOpacity(face: BookFace, ratio: number): number {
  if (face === "front" || face === "back") return clamp01((ratio - 0.15) / 0.15);
  if (face === "left") return clamp01((ratio - 0.3) / 0.3);
  return 1;
}

/**
 * Calcula a espessura base do livro em dp a partir da quantidade de páginas (quando informada).
 * Sem `pageCount`, mantém o padrão de 28 dp; com `pageCount`, varia entre 18 dp (~80 pág.) e 38 dp (~600+ pág.).
 */
export function bookDepthFromPages(pageCount?: number, defaultDepth = 28): number {
  if (!pageCount || pageCount <= 0) return defaultDepth;
  const clampedPages = Math.min(600, Math.max(80, pageCount));
  return Math.round(18 + ((clampedPages - 80) / (600 - 80)) * 20);
}

/**
 * Retorna o ângulo de repouso mais próximo (perspectiva da capa, 90° lombada, 180° contracapa, -90° corte das páginas)
 * para alinhar o livro após o giro manual quando ele para num ângulo intermediário difícil de ler.
 */
export function snapBookAngle(angle: number, frontRestAngle = -16): number {
  const norm = normalizeAngle(angle);
  if (Math.abs(norm) <= 45) return frontRestAngle;
  if (norm > 45 && norm <= 135) return 90;
  if (norm < -45 && norm >= -135) return -90;
  return 180;
}

