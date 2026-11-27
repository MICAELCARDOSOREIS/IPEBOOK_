
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { ConversationItem, ConversationsState } from "@/viewmodel/useConversationsViewModel";

jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));
jest.mock("@/viewmodel/useConversationsViewModel", () => ({
  ...jest.requireActual<typeof import("@/viewmodel/useConversationsViewModel")>("@/viewmodel/useConversationsViewModel"),
  useConversationsViewModel: jest.fn(),
}));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: () => ({ isOnline: true }) }));
jest.mock("@/view/conversations/chat", () => ({
  Chat: ({ onDeleteConversation, onOpenBookDetails }: import("@/view/conversations/chat").ChatProps) => {
    const { Pressable, Text } = jest.requireActual<typeof import("react-native")>("react-native");
    return (
      <>
        <Pressable accessibilityRole="button" onPress={onDeleteConversation}><Text>Apagar pelo chat</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onOpenBookDetails}><Text>Detalhes do livro</Text></Pressable>
      </>
    );
  },
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
  jest.mocked(useConversationsViewModel).mockReturnValue([
    { items: [], loading: false, error: null, ...state },
    { reload: jest.fn(), deleteConversation: jest.fn().mockResolvedValue(true), cancelRequest: jest.fn().mockResolvedValue(true) },
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
    const onExplore = jest.fn();
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
    expect(screen.getByText("Pontos de encontro recomendados")).toBeDefined();
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
    expect(screen.queryByTestId("conversation-about")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Detalhes do livro" })); });
    expect(screen.getByTestId("conversation-about")).toBeDefined();
    expect(screen.getByText("Sobre a troca")).toBeDefined();
  });

  it("oferece a exclusão no chat selecionado e informa o efeito da confirmação", async () => {
    setup({
      items: [
        { requestId: "r1", listing: listing("b1", "Dom Casmurro"), otherName: "Ana Paula", otherPhotoUrl: null, preview: "Oi", lastMessageAt: null, kind: "accepted" },
      ],
    });
    const screen = await renderView();
    expect(screen.queryByLabelText("Apagar conversa com Ana Paula")).toBeNull();
    expect(screen.queryByRole("button", { name: "Apagar pelo chat" })).toBeNull();
    await act(async () => { fireEvent.press(screen.getByText("Ana Paula")); });
    expect(screen.queryByRole("button", { name: "Combinar encontro" })).toBeNull();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Apagar pelo chat" })); });
    expect(screen.getByText(/some só para você/)).toBeDefined();
  });

  it("mantém duas colunas durante o carregamento", async () => {
    setup({ loading: true, items: [] });
    const screen = await renderView();

    expect(screen.getByRole("header").props.children).toBe("Conversas");
    expect(
      screen.getByText("Acompanhe propostas de troca, compra e doação direto com leitores de Piripiri."),
    ).toBeDefined();
    expect(screen.getByLabelText("Carregando conversas")).toBeDefined();
    expect(screen.queryByTestId("conversation-about", { includeHiddenElements: true })).toBeNull();
  });

  it("no painel lateral de compra exibe autor, preço e permite abrir o anúncio ou denunciar", async () => {
    const saleItem: ConversationItem = {
      requestId: "r-sale",
      listing: {
        id: "b-sale",
        title: "Capitães da Areia",
        author: "Jorge Amado",
        ownerId: "owner1",
        modality: "sale",
        price: 35,
        status: "available",
      },
      otherName: "Maria",
      otherPhotoUrl: null,
      preview: "Fechado!",
      lastMessageAt: "2026-10-26T06:00:00",
      kind: "accepted",
    };

    setup({ items: [saleItem] });
    const onOpenListing = jest.fn();
    const onReportListing = jest.fn();
    const screen = await renderView({ onOpenListing, onReportListing });

    await act(async () => {
      fireEvent.press(screen.getByText("Maria"));
    });
    expect(screen.queryByText("Sobre a compra")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Detalhes do livro" })); });

    expect(screen.getByText("Sobre a compra")).toBeDefined();
    expect(screen.getByText("Jorge Amado")).toBeDefined();
    expect(screen.getByText("R$ 35,00")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Ver anúncio de Capitães da Areia" }));
    });
    expect(onOpenListing).toHaveBeenCalledWith("b-sale");
    expect(screen.queryByText("Sobre a compra")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Detalhes do livro" })); });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Denunciar anúncio" }));
    });
    expect(onReportListing).toHaveBeenCalledWith("b-sale");
  });
});
