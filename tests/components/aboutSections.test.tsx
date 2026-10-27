import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import { AboutSections } from "@/view/onboarding/aboutSections";

describe("AboutSections — página que apresenta o app (Spec 092)", () => {
  it("explica como funciona, a segurança e leva a Criar conta e Entrar", async () => {
    const onStart = vi.fn();
    const onSignIn = vi.fn();
    const screen = await render(<AboutSections onStart={onStart} onSignIn={onSignIn} />);
    expect(screen.getByText("Como funciona")).toBeDefined();
    expect(screen.getByText("Anuncie ou procure")).toBeDefined();
    expect(screen.getByText("Combine pelo chat")).toBeDefined();
    expect(screen.getByText("Encontre-se com segurança")).toBeDefined();
    expect(screen.getByText("Feito para a comunidade de Piripiri.")).toBeDefined();
    expect(screen.getByText("Sem taxas: o IpêBook não cobra pelas negociações")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Criar conta grátis")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Já tenho conta, entrar")); });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  it("rodapé: Ajuda e Termos só aparecem com destino, e o e-mail abre o app de e-mail", async () => {
    const without = await render(<AboutSections onStart={() => {}} onSignIn={() => {}} />);
    expect(without.queryByLabelText("Ajuda e perguntas frequentes")).toBeNull();
    expect(without.queryByLabelText("Termos e privacidade")).toBeNull();

    const onHelp = vi.fn();
    const onTerms = vi.fn();
    const open = vi.spyOn(Linking, "openURL").mockResolvedValue(true as never);
    const full = await render(<AboutSections onStart={() => {}} onSignIn={() => {}} onHelp={onHelp} onTerms={onTerms} />);
    await act(async () => { fireEvent.press(full.getByLabelText("Ajuda e perguntas frequentes")); });
    await act(async () => { fireEvent.press(full.getByLabelText("Termos e privacidade")); });
    await act(async () => { fireEvent.press(full.getByLabelText("Falar com a equipe: ipebook738@gmail.com")); });
    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onTerms).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith("mailto:ipebook738@gmail.com");
  });
});
