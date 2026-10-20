import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { PublicProfile } from "@/model/entities/publicProfile";
import { PublicProfile as PublicProfileView } from "@/view/listings/publicProfile";

vi.mock("@/viewmodel/usePublicProfileViewModel", () => ({ usePublicProfileViewModel: vi.fn() }));

import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";

const profile = (over: Partial<PublicProfile> = {}): PublicProfile => ({
  userId: "ana",
  name: "Ana Paula",
  joinedAt: "2026-01-10T00:00:00.000Z",
  averageRating: null,
  ratingCount: 0,
  completedNegotiations: 0,
  ...over,
});

function setup(
  profileValue: PublicProfile | null,
  options: { loading?: boolean; error?: string | null } = {},
) {
  const reload = vi.fn().mockResolvedValue(undefined);
  vi.mocked(usePublicProfileViewModel).mockReturnValue([
    { profile: profileValue, loading: options.loading ?? false, error: options.error ?? null },
    { reload },
  ]);
  return reload;
}

async function renderView(props: Partial<React.ComponentProps<typeof PublicProfileView>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<PublicProfileView userId="ana" {...props} />);
  });
  return screen;
}

describe("PublicProfile (spec 018 / issue #73)", () => {
  it("mostra indicador de carregamento", async () => {
    setup(null, { loading: true });
    const screen = await renderView();
    expect(screen.getByLabelText("Carregando perfil")).toBeDefined();
  });

  it("mostra nome e data de entrada na comunidade", async () => {
    setup(profile({ name: "Ana Paula" }));
    const screen = await renderView();
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText(/Na comunidade desde/)).toBeDefined();
  });

  it("mostra estado claro quando não há avaliações ainda", async () => {
    setup(profile({ ratingCount: 0, averageRating: null }));
    const screen = await renderView();
    expect(screen.getByText("Sem avaliações ainda")).toBeDefined();
  });

  it("mostra média e contagem de avaliações quando existem (plural)", async () => {
    setup(profile({ ratingCount: 2, averageRating: 4.5 }));
    const screen = await renderView();
    expect(screen.getByText("4.5")).toBeDefined();
    expect(screen.getByText("Avaliação média (2 avaliações)")).toBeDefined();
  });

  it("usa singular quando há apenas uma avaliação", async () => {
    setup(profile({ ratingCount: 1, averageRating: 5 }));
    const screen = await renderView();
    expect(screen.getByText("Avaliação média (1 avaliação)")).toBeDefined();
  });

  it("mostra a quantidade de negociações concluídas (plural)", async () => {
    setup(profile({ completedNegotiations: 3 }));
    const screen = await renderView();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("Negociações concluídas")).toBeDefined();
  });

  it("usa singular quando há apenas uma negociação concluída", async () => {
    setup(profile({ completedNegotiations: 1 }));
    const screen = await renderView();
    expect(screen.getByText("Negociação concluída")).toBeDefined();
  });

  it("não quebra com data de entrada inválida", async () => {
    setup(profile({ joinedAt: "data-invalida" }));
    const screen = await renderView();
    expect(screen.getByText(/Na comunidade desde/)).toBeDefined();
  });

  it("mostra erro de domínio e permite tentar novamente", async () => {
    const reload = setup(null, { error: "Usuário não encontrado." });
    const screen = await renderView();
    expect(screen.getByRole("alert").props.children).toBe("Usuário não encontrado.");
    await act(async () => { fireEvent.press(screen.getByText("Tentar novamente")); });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("aciona onBack ao tocar no botão voltar da barra superior", async () => {
    setup(profile());
    const onBack = vi.fn();
    const screen = await renderView({ onBack });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
