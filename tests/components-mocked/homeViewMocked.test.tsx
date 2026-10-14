import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import Home from "@/view/home";

// Mock explícito da ViewModel para isolamento determinístico da View
// Motivo: Simular cenários de rede instável, erro e carregamento contínuo
// sem dependência do ciclo de vida assíncrono real de efeitos ou timers.
vi.mock("@/viewmodel/useHomeViewModel", () => {
  return {
    useHomeViewModel: vi.fn(),
  };
});

import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);

describe("testes de componente com mock: Home (ISO/IEC 25010 - Usabilidade e Confiabilidade)", () => {
  it("renderiza indicador de carregamento e acessibilidade quando loading é true", async () => {
    const mockState: HomeState = {
      books: [],
      loading: true,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getByText("Carregando livros…")).toBeDefined();
    expect(screen.getByLabelText("Carregando livros")).toBeDefined();
    expect(screen.queryByText("Ainda não há livros por aqui.")).toBeNull();
  });

  it("renderiza alerta de erro e botão de nova tentativa quando error está presente", async () => {
    const mockState: HomeState = {
      books: [],
      loading: false,
      error: "Falha de conexão com o catálogo remoto.",
    };
    const reloadMock = vi.fn().mockResolvedValue(undefined);
    const mockActions: HomeActions = { reload: reloadMock };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Falha de conexão com o catálogo remoto.")).toBeDefined();

    const button = screen.getByText("Tentar novamente");
    expect(button).toBeDefined();

    await act(async () => {
      fireEvent.press(button);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza catálogo de livros populado com títulos e autores", async () => {
    const mockState: HomeState = {
      books: [
        { id: "1", title: "O Alquimista", author: "Paulo Coelho", ownerId: "u1", modality: "trade" as const, status: "available" as const },
        { id: "2", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u2", modality: "donation" as const, status: "available" as const },
      ],
      loading: false,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getByText("O Alquimista")).toBeDefined();
    expect(screen.getByText("Paulo Coelho")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.queryByText("Carregando livros…")).toBeNull();
    expect(screen.queryByText("Ainda não há livros por aqui.")).toBeNull();
  });
});
