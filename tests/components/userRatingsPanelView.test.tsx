import React from "react";
import { render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { ReceivedRatingsState } from "@/viewmodel/useReceivedRatingsViewModel";

vi.mock("@/viewmodel/useReceivedRatingsViewModel", () => ({
  useReceivedRatingsViewModel: vi.fn(),
}));

import { UserRatingsPanel } from "@/view/listings/userRatingsPanel";
import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";

const mocked = vi.mocked(useReceivedRatingsViewModel);

function mockState(state: Partial<ReceivedRatingsState>) {
  mocked.mockReturnValue([
    { ratings: [], loading: false, error: null, ...state },
    { reload: vi.fn() },
  ]);
}

describe("UserRatingsPanel (Figma 03.04 / ADR 0038)", () => {
  it("não renderiza nada em carregando, erro ou sem avaliações", async () => {
    for (const state of [
      { loading: true },
      { error: "falhou" },
      { ratings: [] },
    ] as Partial<ReceivedRatingsState>[]) {
      mockState(state);
      const screen = await render(<UserRatingsPanel userId="ana" />);
      expect(screen.queryByTestId("user-ratings-panel")).toBeNull();
    }
  });

  it("lista até seis avaliações com nome, estrelada e alternativa comunitária", async () => {
    mockState({
      ratings: [
        { id: "r1", raterId: "bob", raterName: "Bob", score: 4.4, createdAt: "2026-01-01T00:00:00Z" },
        { id: "r2", raterId: "carol", raterName: null, score: 5, createdAt: "2026-01-02T00:00:00Z" },
      ],
    });
    const screen = await render(<UserRatingsPanel userId="ana" />);

    expect(screen.getByTestId("user-ratings-panel")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Pessoa da comunidade")).toBeDefined();
    // 4,4 arredonda para 4 cheias + 1 vazia; 5 preenche todas.
    expect(screen.getByLabelText("4.4 de 5 estrelas")).toBeTruthy();
    expect(screen.getByText("★★★★☆")).toBeDefined();
    expect(screen.getByText("★★★★★")).toBeDefined();
  });

  it("corta a lista em seis linhas (painel compacto do perfil)", async () => {
    mockState({
      ratings: Array.from({ length: 8 }, (_, i) => ({
        id: `r${i}`,
        raterId: `p${i}`,
        raterName: `Pessoa ${i}`,
        score: 4,
        createdAt: "2026-01-01T00:00:00Z",
      })),
    });
    const screen = await render(<UserRatingsPanel userId="ana" />);
    expect(screen.getByText("Pessoa 5")).toBeDefined();
    expect(screen.queryByText("Pessoa 6")).toBeNull();
  });
});
