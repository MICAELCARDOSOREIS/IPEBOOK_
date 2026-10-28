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
