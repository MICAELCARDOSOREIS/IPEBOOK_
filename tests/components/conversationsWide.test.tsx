import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { ConversationItem, ConversationsState } from "@/viewmodel/useConversationsViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));
vi.mock("@/viewmodel/useConversationsViewModel", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/viewmodel/useConversationsViewModel")>()),
  useConversationsViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
vi.mock("@/view/conversations/chat", () => ({
  Chat: () => <>{/* Chat mock */}</>,
}));

import { Conversations } from "@/view/conversations/conversations";
import { useConversationsViewModel } from "@/viewmodel/useConversationsViewModel";

const listing = (id: string, title: string): Book => ({
  id,
  title,
  author: "Autor Teste",
  ownerId: "owner1",
  modality: "trade",
  status: "available",
});

function setup(state: Partial<ConversationsState>) {
  vi.mocked(useConversationsViewModel).mockReturnValue([
    { items: [], loading: false, error: null, ...state },
    { reload: vi.fn(), deleteConversation: vi.fn().mockResolvedValue(true) },
  ]);
}

async function renderView(props: Partial<Parameters<typeof Conversations>[0]> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Conversations sessionUserId="user-me" {...props} />);
  });
  return screen;
}

describe("Conversas na Web Larga (Spec 093 · Figma 06.01 / 06.09)", () => {
  it("exibe cabeçalho editorial, card acolhedor e 3 cartões de destaque no estado vazio", async () => {
    setup({ items: [] });
    const onExplore = vi.fn();
    const screen = await renderView({ onExplore });

    // Cabeçalho editorial da tela
    expect(screen.getByRole("header").props.children).toBe("Conversas");
    expect(
      screen.getByText("Acompanhe propostas de troca, compra e doação direto com leitores de Piripiri."),
    ).toBeDefined();

    // Card centralizado com ação
    expect(screen.getByText("Nenhuma conversa ainda")).toBeDefined();
    expect(screen.getByText("Encontre um livro e converse com a pessoa para combinar os detalhes.")).toBeDefined();

    // 3 destaques de segurança e circulação na comunidade de Piripiri
    expect(screen.getByText("Negociação direta")).toBeDefined();
    expect(screen.getByText("Pontos de encontro seguros")).toBeDefined();
    expect(screen.getByText("Avaliações mútuas")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByText("Encontrar um livro"));
    });
    expect(onExplore).toHaveBeenCalledTimes(1);
  });

  it("renderiza o painel integrado de conversas quando há itens e abre o chat", async () => {
    const items: ConversationItem[] = [
      {
        requestId: "r1",
        listing: listing("b1", "Dom Casmurro"),
        otherName: "Ana Paula",
        otherPhotoUrl: null,
        preview: "Pode ser sábado na praça?",
        lastMessageAt: "2026-10-26T06:00:00",
        kind: "accepted",
      },
      {
        requestId: "r2",
        listing: listing("b2", "O Cortiço"),
        otherName: "Carlos",
        otherPhotoUrl: null,
        preview: "Proposta recebida",
        lastMessageAt: null,
        kind: "pendingReceived",
      },
    ];

    setup({ items });
    const screen = await renderView();

    expect(screen.getByText("2 conversas")).toBeDefined();
    expect(screen.getByText("Escolha uma conversa")).toBeDefined();

    // Ao clicar na conversa aceita, seleciona e abre o chat e os detalhes
    await act(async () => {
      fireEvent.press(screen.getByText("Ana Paula"));
    });

    expect(screen.getByTestId("conversation-pane")).toBeDefined();
    expect(screen.getByTestId("conversation-about")).toBeDefined();
    expect(screen.getByText("Sobre a troca")).toBeDefined();
  });
});

