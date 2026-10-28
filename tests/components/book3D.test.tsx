import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { Book3D } from "@/view/components/Book3D";

const LABEL = "Capa de Capitães da Areia, em 3D. Use as ações para girar o livro.";

async function open(props: Partial<React.ComponentProps<typeof Book3D>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Book3D id="b1" title="Capitães da Areia" author="Jorge Amado" intro={false} {...props} />);
  });
  return screen;
}

function act3d(screen: Awaited<ReturnType<typeof render>>, actionName: string) {
  const node = screen.getByLabelText(LABEL);
  return act(async () => {
    node.props.onAccessibilityAction({ nativeEvent: { actionName } });
    await new Promise((resolve) => setTimeout(resolve, 650));
  });
}

describe("Book3D: livro que gira (projeção ortogonal)", () => {
  it("começa de frente, só com a capa, e anuncia as ações de girar", async () => {
    const screen = await open();
    expect(screen.getByTestId("book3d-face-front")).toBeDefined();
    expect(screen.queryByTestId("book3d-face-left")).toBeNull();
    expect(screen.queryByTestId("book3d-face-back")).toBeNull();
    const node = screen.getByLabelText(LABEL);
    expect(node.props.accessibilityRole).toBe("image");
    expect(node.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual(["increment", "decrement", "activate"]);
    expect(screen.getByLabelText("Capa ilustrativa de Capitães da Areia")).toBeDefined();
  });

  it("girar para a esquerda mostra a lombada com o título; girar de volta mostra a capa", async () => {
    const screen = await open();
    await act3d(screen, "increment");
    expect(screen.getByTestId("book3d-face-left")).toBeDefined();
    expect(screen.getByTestId("book3d-face-front")).toBeDefined();
    expect(screen.getByText("Capitães da Areia")).toBeDefined();
    await act3d(screen, "activate");
    expect(screen.queryByTestId("book3d-face-left")).toBeNull();
  });

  it("girar para a direita mostra o corte das páginas", async () => {
    const screen = await open();
    await act3d(screen, "decrement");
    expect(screen.getByTestId("book3d-face-right")).toBeDefined();
    expect(screen.queryByTestId("book3d-face-left")).toBeNull();
  });

  it("depois de várias voltas chega à contracapa", async () => {
    const screen = await open();
    for (let i = 0; i < 4; i += 1) await act3d(screen, "increment");
    expect(screen.getByTestId("book3d-face-back")).toBeDefined();
    expect(screen.queryByTestId("book3d-face-front")).toBeNull();
  });

  it("a escala aumenta o espaço que o livro ocupa (e não só o desenho), para não cobrir o que vem abaixo", async () => {
    const flat = (style: unknown) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));
    const normal = flat((await open()).getByLabelText(LABEL).props.style);
    const grande = flat((await open({ scale: 1.6 })).getByLabelText(LABEL).props.style);
    expect(grande.width).toBeCloseTo(normal.width * 1.6, 3);
    expect(grande.height).toBeCloseTo((normal.height - 16) * 1.6 + 16, 3);
  });

  it("pode começar girado, sem animação", async () => {
    const screen = await open({ startAngle: 90 });
    expect(screen.getByTestId("book3d-face-left")).toBeDefined();
    expect(screen.queryByTestId("book3d-face-front")).toBeNull();
  });

  it("a lombada mostra título e autor", async () => {
    const screen = await open({ startAngle: 90 });
    expect(screen.getByText("Capitães da Areia")).toBeDefined();
    expect(screen.getByText("Jorge Amado")).toBeDefined();
  });

  it("a contracapa mostra título, autor e a descrição do anúncio", async () => {
    const screen = await open({ startAngle: 180, description: "Meninos de rua na Bahia dos anos 1930." });
    expect(screen.getByTestId("book3d-face-back")).toBeDefined();
    expect(screen.getByText("Capitães da Areia")).toBeDefined();
    expect(screen.getByText("Jorge Amado")).toBeDefined();
    expect(screen.getByText("Meninos de rua na Bahia dos anos 1930.")).toBeDefined();
  });

  it("a contracapa mostra a editora no pé", async () => {
    const screen = await open({ startAngle: 180, description: "Sinopse do livro.", publisher: "Companhia das Letras" });
    expect(screen.getByText("Companhia das Letras")).toBeDefined();
    expect(screen.getByText("Sinopse do livro.")).toBeDefined();
  });

  it("sem autor nem descrição, a contracapa e a lombada mostram só o título", async () => {
    const back = await open({ startAngle: 180, author: undefined });
    expect(back.getByText("Capitães da Areia")).toBeDefined();
    expect(back.queryByText("Jorge Amado")).toBeNull();
    const spine = await open({ startAngle: 90, author: undefined });
    expect(spine.getAllByText("Capitães da Areia").length).toBeGreaterThan(0);
  });

  it("com foto, a frente é a foto do livro", async () => {
    const screen = await open({ photoUrl: "https://exemplo.com/capa.jpg" });
    expect(screen.getByLabelText("Foto da capa de Capitães da Areia")).toBeDefined();
  });

  it("a animação de entrada começa girada e termina de frente", async () => {
    const screen = await open({ intro: true });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 700)); });
    expect(screen.getByTestId("book3d-face-front")).toBeDefined();
    expect(screen.queryByTestId("book3d-face-left")).toBeNull();
  });

  it("quem pede menos movimento recebe o livro parado, e o giro vai direto ao destino", async () => {
    const info = (await import("react-native")).AccessibilityInfo as unknown as { isReduceMotionEnabled?: () => Promise<boolean> };
    const original = info.isReduceMotionEnabled;
    info.isReduceMotionEnabled = () => Promise.resolve(true);
    try {
      const screen = await open({ intro: true });
      expect(screen.queryByTestId("book3d-face-left")).toBeNull();
      const node = screen.getByLabelText(LABEL);
      await act(async () => { node.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }); });
      expect(screen.getByTestId("book3d-face-left")).toBeDefined();
    } finally {
      info.isReduceMotionEnabled = original;
    }
  });
});

describe("Book3D: gesto de arrastar", () => {
  it("o toque sem arrastar chama onPress; o arrastar gira e não chama", async () => {
    const created: Array<Record<string, any>> = [];
    const RN = await import("react-native");
    const original = RN.PanResponder.create;
    (RN.PanResponder as { create: unknown }).create = (config: Record<string, any>) => {
      created.push(config);
      return { panHandlers: {} };
    };
    try {
      const onPress = vi.fn();
      const screen = await open({ onPress });
      const gesture = created[created.length - 1];
      gesture.onPanResponderGrant();
      gesture.onPanResponderRelease({}, { dx: 2, dy: 1, vx: 0 });
      expect(onPress).toHaveBeenCalledTimes(1);

      await act(async () => {
        gesture.onPanResponderGrant();
        gesture.onPanResponderMove({}, { dx: 80, dy: 0 });
      });
      expect(screen.getByTestId("book3d-face-left")).toBeDefined();
      await act(async () => { gesture.onPanResponderRelease({}, { dx: 80, dy: 0, vx: 0 }); });
      expect(onPress).toHaveBeenCalledTimes(1);
    } finally {
      (RN.PanResponder as { create: unknown }).create = original;
    }
  });

  it("sem onPress, o toque volta o livro para a capa", async () => {
    const created: Array<Record<string, any>> = [];
    const RN = await import("react-native");
    const original = RN.PanResponder.create;
    (RN.PanResponder as { create: unknown }).create = (config: Record<string, any>) => {
      created.push(config);
      return { panHandlers: {} };
    };
    try {
      const screen = await open();
      const gesture = created[created.length - 1];
      await act(async () => { gesture.onPanResponderGrant(); gesture.onPanResponderMove({}, { dx: 100, dy: 0 }); });
      expect(screen.getByTestId("book3d-face-left")).toBeDefined();
      await act(async () => {
        gesture.onPanResponderGrant();
        gesture.onPanResponderRelease({}, { dx: 0, dy: 0, vx: 0 });
        await new Promise((resolve) => setTimeout(resolve, 650));
      });
      expect(screen.queryByTestId("book3d-face-left")).toBeNull();
      gesture.onPanResponderTerminate();
    } finally {
      (RN.PanResponder as { create: unknown }).create = original;
    }
  });
});
