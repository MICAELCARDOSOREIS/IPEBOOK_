import { describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react-native";
import { Platform, StyleSheet, Text } from "react-native";
import { __emitKeyboardEvent } from "../mocks/react-native";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";

function estiloRaiz(screen: Awaited<ReturnType<typeof render>>) {
  return StyleSheet.flatten(screen.getByTestId("keyboard-aware-root").props.style);
}

describe("KeyboardAwareRoot (Spec 088)", () => {
  it("no Android soma a altura reportada pelo teclado como padding de baixo", async () => {
    const original = Platform.OS;
    Platform.OS = "android";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    // Antes do teclado: sem padding extra, porque a janela já ocupa a tela toda.
    expect(estiloRaiz(screen).paddingBottom).toBeUndefined();

    // O evento nativo reporta a altura real; não depende da conta de sobreposição do KeyboardAvoidingView.
    await act(async () => {
      __emitKeyboardEvent("keyboardDidShow", 320);
    });
    expect(estiloRaiz(screen).paddingBottom).toBe(320);

    await act(async () => {
      __emitKeyboardEvent("keyboardDidHide", undefined);
    });
    expect(estiloRaiz(screen).paddingBottom).toBeUndefined();
    expect(screen.getByText("conteúdo")).toBeDefined();
    Platform.OS = original;
  });

  it("no iOS empurra o conteúdo pela parte do teclado que fica sob a janela", async () => {
    const original = Platform.OS;
    Platform.OS = "ios";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    // Janela mock de 800 dp: teclado de 300 dp na base da tela empurra 300 dp.
    await act(async () => {
      __emitKeyboardEvent("keyboardDidShow", 300, 500);
    });
    expect(estiloRaiz(screen).paddingBottom).toBe(300);
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
    await act(async () => {
      __emitKeyboardEvent("keyboardDidShow", 320);
    });
    expect(estiloRaiz(screen).paddingBottom).toBeUndefined();
    Platform.OS = original;
  });
});
