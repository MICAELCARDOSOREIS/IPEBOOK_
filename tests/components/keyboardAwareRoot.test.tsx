import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { Platform, Text } from "react-native";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";

describe("KeyboardAwareRoot (Spec 088)", () => {
  it("no Android empurra o conteúdo com padding, porque o modo tela cheia ignora o resize", async () => {
    const original = Platform.OS;
    Platform.OS = "android";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    expect(screen.getByTestId("keyboard-aware-root").props.behavior).toBe("padding");
    expect(screen.getByText("conteúdo")).toBeDefined();
    Platform.OS = original;
  });

  it("no iOS não age, porque as telas já tratam o teclado", async () => {
    const original = Platform.OS;
    Platform.OS = "ios";
    const screen = await render(
      <KeyboardAwareRoot>
        <Text>conteúdo</Text>
      </KeyboardAwareRoot>,
    );
    expect(screen.getByTestId("keyboard-aware-root").props.behavior).toBeUndefined();
    Platform.OS = original;
  });
});
