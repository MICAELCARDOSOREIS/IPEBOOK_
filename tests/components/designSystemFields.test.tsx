import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { TextField } from "@/view/components/TextField";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";

describe("TextField (design-system/04-componentes/campo-de-texto.md)", () => {
  it("rótulo fica sempre visível junto do valor", async () => {
    const { getByLabelText, getByText } = await render(
      <TextField label="E-mail" value="pessoa@exemplo.com" onChangeText={() => {}} />,
    );
    expect(getByLabelText("E-mail")).toBeDefined();
    expect(getByText("E-mail")).toBeDefined();
  });

  it("exibe mensagem de erro ligada ao campo quando há erro", async () => {
    const { getByRole, getByText } = await render(
      <TextField label="E-mail" value="" onChangeText={() => {}} error="E-mail é obrigatório." />,
    );
    expect(getByRole("alert")).toBeDefined();
    expect(getByText("E-mail é obrigatório.")).toBeDefined();
  });

  it("associa a mensagem de erro ao campo para leitores de tela (Web e nativo)", async () => {
    const { getByLabelText, getByRole } = await render(
      <TextField label="E-mail" value="" onChangeText={() => {}} error="E-mail é obrigatório." />,
    );
    const input = getByLabelText("E-mail");
    const errorText = getByRole("alert");
    expect(input.props["aria-describedby"]).toBeDefined();
    expect(input.props["aria-describedby"]).toBe(errorText.props.nativeID);
    expect(input.props.accessibilityHint).toBe("E-mail é obrigatório.");
  });

  it("não anuncia mensagem de erro quando o campo está válido", async () => {
    const { getByLabelText } = await render(
      <TextField label="E-mail" value="pessoa@exemplo.com" onChangeText={() => {}} />,
    );
    const input = getByLabelText("E-mail");
    expect(input.props["aria-describedby"]).toBeUndefined();
    expect(input.props.accessibilityHint).toBeUndefined();
  });

  it("some a associação quando o erro é corrigido", async () => {
    const { getByLabelText, rerender } = await render(
      <TextField label="E-mail" value="" onChangeText={() => {}} error="E-mail é obrigatório." />,
    );
    expect(getByLabelText("E-mail").props["aria-describedby"]).toBeDefined();
    await rerender(<TextField label="E-mail" value="pessoa@exemplo.com" onChangeText={() => {}} />);
    expect(getByLabelText("E-mail").props["aria-describedby"]).toBeUndefined();
  });

  it("chama onChangeText ao digitar", async () => {
    const onChangeText = vi.fn();
    const { getByLabelText } = await render(
      <TextField label="Senha" value="" onChangeText={onChangeText} secureTextEntry />,
    );
    fireEvent.changeText(getByLabelText("Senha"), "12345678");
    expect(onChangeText).toHaveBeenCalledWith("12345678");
  });
});

describe("FilledButton (design-system/04-componentes/botao.md)", () => {
  it("mostra o rótulo e aciona onPress", async () => {
    const onPress = vi.fn();
    const { getByText } = await render(<FilledButton label="Entrar" onPress={onPress} />);
    fireEvent.press(getByText("Entrar"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("mostra indicador de carregamento em vez do rótulo quando loading", async () => {
    const { queryByText, getByLabelText } = await render(
      <FilledButton label="Entrar" onPress={() => {}} loading loadingLabel="Entrando" />,
    );
    expect(queryByText("Entrar")).toBeNull();
    expect(getByLabelText("Entrando")).toBeDefined();
  });

  it("anuncia estado desabilitado para leitores de tela", async () => {
    const { getByRole } = await render(
      <FilledButton label="Entrar" onPress={() => {}} disabled />,
    );
    expect(getByRole("button").props.accessibilityState).toEqual({ disabled: true });
  });
});

describe("Logotipo (design-system/04-componentes/logotipo.md)", () => {
  it("renderiza o nome da marca como header acessível", async () => {
    const { getByRole } = await render(<Logotipo />);
    const header = getByRole("header");
    expect(header.props.children).toBe("IpêBook");
  });

  it("usa a cor inverse sobre fundos escuros/capas", async () => {
    const { getByRole } = await render(<Logotipo inverse />);
    expect(getByRole("header")).toBeDefined();
  });
});
