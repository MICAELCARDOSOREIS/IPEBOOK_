import { describe, expect, it } from "vitest";
import { faceContentOpacity, normalizeAngle, projectBookFaces } from "@/view/book3dGeometry";

const W = 136;
const D = 28;
const near = (value: number, expected: number) => expect(value).toBeCloseTo(expected, 4);

describe("geometria do livro 3D (projeção ortogonal)", () => {
  it("normaliza ângulos para (-180, 180]", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(190)).toBe(-170);
    expect(normalizeAngle(-190)).toBe(170);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(-180)).toBe(180);
  });

  it("de frente (0°) só se vê a capa, inteira e sem sombra", () => {
    const faces = projectBookFaces(0, W, D);
    expect(faces.map((f) => f.face)).toEqual(["front"]);
    near(faces[0].width, W);
    near(faces[0].center, 0);
    near(faces[0].shade, 0);
  });

  it("girando para a esquerda (45°) aparecem a capa e a lombada, lado a lado", () => {
    const [front, left] = projectBookFaces(45, W, D);
    expect([front.face, left.face]).toEqual(["front", "left"]);
    near(front.width, W * Math.SQRT1_2);
    near(left.width, D * Math.SQRT1_2);
    // A lombada termina onde a capa começa: as bordas se encostam.
    near(left.center + left.width / 2, front.center - front.width / 2);
  });

  it("a 90° só a lombada fica visível, com a largura da espessura", () => {
    const faces = projectBookFaces(90, W, D);
    expect(faces.map((f) => f.face)).toEqual(["left"]);
    near(faces[0].width, D);
    near(faces[0].center, 0);
  });

  it("a 180° só a contracapa; a 270° só o corte das páginas", () => {
    expect(projectBookFaces(180, W, D).map((f) => f.face)).toEqual(["back"]);
    near(projectBookFaces(180, W, D)[0].width, W);
    const right = projectBookFaces(270, W, D);
    expect(right.map((f) => f.face)).toEqual(["right"]);
    near(right[0].width, D);
  });

  it("girando para o outro lado (-45°) a capa e o corte das páginas se encostam", () => {
    const [front, right] = projectBookFaces(-45, W, D);
    expect([front.face, right.face]).toEqual(["front", "right"]);
    near(right.center - right.width / 2, front.center + front.width / 2);
  });

  it("o contorno total do livro nunca passa da largura mais a espessura", () => {
    for (let angle = -180; angle <= 180; angle += 5) {
      const faces = projectBookFaces(angle, W, D);
      const left = Math.min(...faces.map((f) => f.center - f.width / 2));
      const right = Math.max(...faces.map((f) => f.center + f.width / 2));
      expect(right - left).toBeLessThanOrEqual(Math.hypot(W, D) + 0.01);
      expect(faces.length).toBeGreaterThan(0);
    }
  });

  it("escurece mais as faces de lado do que as de frente", () => {
    const frente = projectBookFaces(0, W, D)[0].shade;
    const inclinada = projectBookFaces(60, W, D).find((f) => f.face === "front")!.shade;
    expect(inclinada).toBeGreaterThan(frente);
    expect(projectBookFaces(60, W, D).every((f) => f.shade >= 0 && f.shade <= 0.5)).toBe(true);
  });
});

describe("conteúdo das faces quase de lado", () => {
  it("capa e contracapa somem aos poucos perto de 90° e ficam inteiras de frente", () => {
    for (const face of ["front", "back"] as const) {
      expect(faceContentOpacity(face, 1)).toBe(1);
      expect(faceContentOpacity(face, 0.3)).toBe(1);
      expect(faceContentOpacity(face, 0.15)).toBe(0);
      expect(faceContentOpacity(face, 0.1)).toBe(0);
      const meio = faceContentOpacity(face, 0.225);
      expect(meio).toBeGreaterThan(0);
      expect(meio).toBeLessThan(1);
    }
  });

  it("o título da lombada some quando ela está quase de frente e fica legível de lado", () => {
    expect(faceContentOpacity("left", 1)).toBe(1);
    expect(faceContentOpacity("left", 0.6)).toBe(1);
    expect(faceContentOpacity("left", 0.3)).toBe(0);
    expect(faceContentOpacity("left", 0.05)).toBe(0);
  });

  it("o corte das páginas é sempre mostrado", () => {
    expect(faceContentOpacity("right", 0.01)).toBe(1);
  });

  it("a cada ângulo, o livro sempre mostra alguma face com conteúdo ou uma faixa lisa, sem faces cortadas", () => {
    for (let angle = 0; angle < 360; angle += 3) {
      const faces = projectBookFaces(angle, 136, 28);
      expect(faces.length).toBeGreaterThan(0);
    }
  });
});
