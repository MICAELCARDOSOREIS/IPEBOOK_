import { describe, expect, it } from "vitest";
import { render, act } from "@testing-library/react-native";
// @ts-expect-error Exportado pelo mock de react-native
import { Keyboard, Text, __emitKeyboardEvent } from "react-native";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";

function TestComponent() {
  const visible = useKeyboardVisible();
  return <Text testID="status">{visible ? "visible" : "hidden"}</Text>;
}

describe("useKeyboardVisible", () => {
  it("inicia com teclado invisível (false)", async () => {
    const screen = await render(<TestComponent />);
    expect(screen.getByTestId("status").props.children).toBe("hidden");
  });

  it("atualiza para true quando o evento de exibição do teclado dispara e volta para false ao esconder", async () => {
    const screen = await render(<TestComponent />);
    expect(screen.getByTestId("status").props.children).toBe("hidden");

    await act(async () => {
      __emitKeyboardEvent("keyboardDidShow", 320);
    });
    expect(screen.getByTestId("status").props.children).toBe("visible");

    await act(async () => {
      __emitKeyboardEvent("keyboardDidHide", undefined);
    });
    expect(screen.getByTestId("status").props.children).toBe("hidden");
  });
});
