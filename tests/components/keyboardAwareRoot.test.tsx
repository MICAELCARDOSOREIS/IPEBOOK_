import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { Platform, StyleSheet, Text } from "react-native";
import { __emitKeyboardEvent } from "../mocks/react-native";
import { medirInsetoTeclado } from "@/view/useKeyboardInset";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";

/** Lê o valor atual do `paddingBottom` animado aplicado pela raiz. */
function paddingRaiz(screen: Awaited<ReturnType<typeof render>>) {
  const estilo = StyleSheet.flatten(screen.getByTestId("keyboard-aware-root").props.style);
  return estilo.paddingBottom?.__getValue?.() ?? 0;
}

describe("medirInsetoTeclado (Spec 088)", () => {
  it("no Android usa a altura reportada, que é o que cobre a tela em borda a borda", () => {
    const original = Platform.OS;
    Platform.OS = "android";
    expect(medirInsetoTeclado({ endCoordinates: { height: 320, screenY: 0 } } as any, 800)).toBe(320);
    expect(medirInsetoTeclado(undefined, 800)).toBe(0);
    Platform.OS = original;
  });

  it("no iOS limita o inseto à parte do teclado que fica abaixo da janela (rotação e tela dividida)", () => {
    const original = Platform.OS;
    Platform.OS = "ios";
    // Teclado de 300 a partir de y=500 em janela de 800: 300 visíveis.
    expect(medirInsetoTeclado({ endCoordinates: { height: 300, screenY: 500 } } as any, 800)).toBe(300);
    // Quadro parcialmente fora da janela (ex.: teclado flutuante ou rodando): desconta só a parte de baixo.
    expect(medirInsetoTeclado({ endCoordinates: { height: 300, screenY: 650 } } as any, 800)).toBe(150);
    // Janela já reduzida (ex.: iPad divisivo): nada além do quadro deve entrar.
    expect(medirInsetoTeclado({ endCoordinates: { height: 300, screenY: 400 } } as any, 500)).toBe(100);
    Platform.OS = original;
  });
});

describe("KeyboardAwareRoot (Spec 088)", () => {
  it("no Android desliza o conteúdo pela altura reportada pelo teclado e volta a zero ao esconder", async () => {
    const original = Platform.OS;
    Platform.OS = "android";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    expect(paddingRaiz(screen)).toBe(0);

    __emitKeyboardEvent("keyboardDidShow", 320);
    expect(paddingRaiz(screen)).toBe(320);

    __emitKeyboardEvent("keyboardDidHide", undefined);
    expect(paddingRaiz(screen)).toBe(0);
    expect(screen.getByText("conteúdo")).toBeDefined();
    Platform.OS = original;
  });

  it("no iOS empurra pela parte do teclado que fica sob a janela", async () => {
    const original = Platform.OS;
    Platform.OS = "ios";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    // Janela mock de 800 dp: teclado de 300 dp na base (y=500) empurra 300 dp.
    __emitKeyboardEvent("keyboardWillShow", 300, 500);
    expect(paddingRaiz(screen)).toBe(300);
    Platform.OS = original;
  });

  it("na web não age, porque o navegador já encolhe a área útil", async () => {
    const original = Platform.OS;
    Platform.OS = "web";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    __emitKeyboardEvent("keyboardDidShow", 320);
    expect(paddingRaiz(screen)).toBe(0);
    Platform.OS = original;
  });
});
