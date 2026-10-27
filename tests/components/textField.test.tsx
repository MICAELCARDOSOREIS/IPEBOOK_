import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "@/view/components/TextField";


describe("TextField — senha e preenchimento automático (Spec 092)", () => {
  it("campo de senha tem olho para mostrar e ocultar", async () => {
    const screen = await render(<TextField label="Senha" value="segredo123" onChangeText={() => {}} secureTextEntry />);
    expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(true);
    await act(async () => { fireEvent.press(screen.getByLabelText("Mostrar senha")); });
    expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText("Ocultar senha")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Ocultar senha")); });
    expect(screen.getByLabelText("Senha").props.secureTextEntry).toBe(true);
  });

  it("campo comum não tem olho e repassa autoComplete e a ação do teclado", async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <TextField label="E-mail" value="" onChangeText={() => {}} autoComplete="email" returnKeyType="done" onSubmitEditing={onSubmit} />,
    );
    expect(screen.queryByLabelText("Mostrar senha")).toBeNull();
    const input = screen.getByLabelText("E-mail");
    expect(input.props.autoComplete).toBe("email");
    expect(input.props.returnKeyType).toBe("done");
    fireEvent(input, "submitEditing");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
