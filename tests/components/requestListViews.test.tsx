import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SentRequests } from "@/view/requests/sentRequests";
import { ReceivedRequests } from "@/view/requests/receivedRequests";

afterEach(() => {
  cleanup();
});

vi.mock("@/viewmodel/useSentRequestsViewModel", () => ({
  useSentRequestsViewModel: vi.fn(),
}));

vi.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({
  useReceivedRequestsViewModel: vi.fn(),
}));

import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";

const mockedUseSent = vi.mocked(useSentRequestsViewModel);
const mockedUseReceived = vi.mocked(useReceivedRequestsViewModel);

const mockSentItem = {
  request: {
    id: "req-1",
    listingId: "book-1",
    requesterId: "user-buyer",
    status: "accepted" as const,
    createdAt: new Date().toISOString(),
  },
  listing: {
    id: "book-1",
    title: "O Alquimista",
    author: "Paulo Coelho",
    ownerId: "user-seller",
    modality: "trade" as const,
    status: "reserved" as const,
  },
};

const mockReceivedItemPending = {
  request: {
    id: "req-2",
    listingId: "book-2",
    requesterId: "user-interested",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  },
  listing: {
    id: "book-2",
    title: "Capitães da Areia",
    author: "Jorge Amado",
    ownerId: "user-me",
    modality: "donation" as const,
    status: "available" as const,
  },
};

const mockReceivedItemAccepted = {
  request: {
    id: "req-3",
    listingId: "book-3",
    requesterId: "user-another",
    status: "accepted" as const,
    createdAt: new Date().toISOString(),
  },
  listing: {
    id: "book-3",
    title: "A Hora da Estrela",
    author: "Clarice Lispector",
    ownerId: "user-me",
    modality: "sale" as const,
    price: 25,
    status: "reserved" as const,
  },
};

describe("SentRequests e ReceivedRequests Views (ISO/IEC 25010 - Adequação Funcional)", () => {
  describe("SentRequests", () => {
    it("exibe mensagem vazia quando não há pedidos enviados", async () => {
      mockedUseSent.mockReturnValue([
        { items: [], loading: false, error: null },
        { reload: vi.fn() },
      ]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<SentRequests sessionUserId="user-buyer" />);
      });

      expect(screen.getByText("Você ainda não solicitou nenhuma negociação.")).toBeDefined();
    });

    it("exibe botão de ver detalhes do encontro quando pedido foi aceito", async () => {
      mockedUseSent.mockReturnValue([
        { items: [mockSentItem], loading: false, error: null },
        { reload: vi.fn() },
      ]);
      const onNavigate = vi.fn();

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(
          <SentRequests sessionUserId="user-buyer" onNavigateToNegotiationDetail={onNavigate} />,
        );
      });

      expect(screen.getByText("O Alquimista")).toBeDefined();
      const button = screen.getByText("Ver detalhes do encontro");
      fireEvent.press(button);
      expect(onNavigate).toHaveBeenCalledWith("req-1");
    });

    it("permite tentar novamente em caso de erro", async () => {
      const reload = vi.fn();
      mockedUseSent.mockReturnValue([
        { items: [], loading: false, error: "Falha de rede ao carregar" },
        { reload },
      ]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<SentRequests sessionUserId="user-buyer" />);
      });

      expect(screen.getByText("Falha de rede ao carregar")).toBeDefined();
      const retryButton = screen.getByText("Tentar novamente");
      fireEvent.press(retryButton);
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  describe("ReceivedRequests", () => {
    it("exibe mensagem vazia quando não há pedidos recebidos", async () => {
      mockedUseReceived.mockReturnValue([
        { items: [], loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
        { reload: vi.fn(), accept: vi.fn(), reject: vi.fn() },
      ]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ReceivedRequests sessionUserId="user-me" />);
      });

      expect(screen.getByText("Você ainda não recebeu pedidos para os seus anúncios.")).toBeDefined();
    });

    it("exibe botões de Aceitar e Recusar para pedidos pendentes e dispara actions", async () => {
      const accept = vi.fn();
      const reject = vi.fn();
      mockedUseReceived.mockReturnValue([
        { items: [mockReceivedItemPending], loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
        { reload: vi.fn(), accept, reject },
      ]);

      const screen = await render(<ReceivedRequests sessionUserId="user-me" />);

      expect(screen.getByText("Sua estante em movimento.")).toBeDefined();
      expect(screen.getByText("Tudo pela conversa")).toBeDefined();
      expect(screen.getByText("Capitães da Areia")).toBeDefined();
      expect(screen.getByText("Pessoa interessada: user-interested")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByText("Aceitar"));
      });
      expect(accept).toHaveBeenCalledWith("req-2");

      await act(async () => {
        fireEvent.press(screen.getByText("Recusar"));
      });
      expect(reject).toHaveBeenCalledWith("req-2");
    });

    it("exibe botão de ver detalhes do encontro para pedidos aceitos e alerta de erro de resposta", async () => {
      const onNavigate = vi.fn();
      mockedUseReceived.mockReturnValue([
        {
          items: [mockReceivedItemAccepted],
          loading: false,
          error: null,
          respondingId: null,
          respondError: "Não foi possível aceitar a negociação.",
          respondErrorId: "req-3",
        },
        { reload: vi.fn(), accept: vi.fn(), reject: vi.fn() },
      ]);

      const screen = await render(
        <ReceivedRequests sessionUserId="user-me" onNavigateToNegotiationDetail={onNavigate} />,
      );

      expect(screen.getByText("A Hora da Estrela")).toBeDefined();
      expect(screen.getByText("Venda")).toBeDefined();
      expect(screen.getByText("R$ 25.00")).toBeDefined();
      expect(screen.getByText("Não foi possível aceitar a negociação.")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByText("Ver detalhes do encontro"));
      });
      expect(onNavigate).toHaveBeenCalledWith("req-3");
    });

    it("filtra pedidos por status (Todos, Pendentes, Aceitos, Histórico) e permite voltar para todos (Issue #162)", async () => {
      mockedUseReceived.mockReturnValue([
        {
          items: [mockReceivedItemPending, mockReceivedItemAccepted],
          loading: false,
          error: null,
          respondingId: null,
          respondError: null,
          respondErrorId: null,
        },
        { reload: vi.fn(), accept: vi.fn(), reject: vi.fn() },
      ]);

      const screen = await render(<ReceivedRequests sessionUserId="user-me" />);

      expect(screen.getByText("Todos (2)")).toBeDefined();
      expect(screen.getByText("Pendentes (1)")).toBeDefined();
      expect(screen.getByText("Aceitos (1)")).toBeDefined();
      expect(screen.getByText("Histórico (0)")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Filtrar pedidos por Pendentes"));
      });
      expect(screen.getByText("Capitães da Areia")).toBeDefined();
      expect(screen.queryByText("A Hora da Estrela")).toBeNull();

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Filtrar pedidos por Histórico"));
      });
      expect(screen.getByText("Nenhum pedido encontrado neste filtro.")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Ver todos os pedidos"));
      });
      expect(screen.getByText("Capitães da Areia")).toBeDefined();
      expect(screen.getByText("A Hora da Estrela")).toBeDefined();
    });
  });
});
