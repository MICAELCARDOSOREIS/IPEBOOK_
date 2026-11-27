import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { ReceivedRequests } from "@/view/requests/receivedRequests";

afterEach(() => {
  cleanup();
});

jest.mock("@/viewmodel/useReceivedRequestsViewModel", () => ({
  useReceivedRequestsViewModel: jest.fn(),
}));

import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";

const mockedUseReceived = jest.mocked(useReceivedRequestsViewModel);

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

describe("ReceivedRequests View (ISO/IEC 25010 - Adequação Funcional)", () => {
  describe("ReceivedRequests", () => {
    it("exibe mensagem vazia quando não há pedidos recebidos", async () => {
      mockedUseReceived.mockReturnValue([
        { items: [], loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
        { reload: jest.fn(), accept: jest.fn(), reject: jest.fn() },
      ]);

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<ReceivedRequests sessionUserId="user-me" />);
      });

      expect(screen.getByText("Você ainda não recebeu pedidos para os seus anúncios.")).toBeDefined();
    });

    it("exibe botões de Aceitar e Recusar para pedidos pendentes e dispara actions", async () => {
      const accept = jest.fn().mockResolvedValue(true);
      const reject = jest.fn();
      mockedUseReceived.mockReturnValue([
        { items: [mockReceivedItemPending], loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
        { reload: jest.fn(), accept, reject },
      ]);

      const screen = await render(<ReceivedRequests sessionUserId="user-me" />);

      expect(screen.getByText("Sua estante em movimento.")).toBeDefined();
      expect(screen.getByText("Tudo pela conversa")).toBeDefined();
      expect(screen.getByText("Capitães da Areia")).toBeDefined();
      expect(screen.getByText("Pessoa interessada: Pessoa da comunidade")).toBeDefined();
      expect(screen.queryByText(/Ao aceitar, o anúncio fica reservado/)).toBeNull();
      expect(screen.queryByText(/user-interested/)).toBeNull();

      await act(async () => {
        fireEvent.press(screen.getByText("Aceitar"));
      });
      // Aceitar reserva o anúncio e recusa os concorrentes: só depois da confirmação.
      expect(accept).not.toHaveBeenCalled();
      expect(screen.getByText("Aceitar este pedido?")).toBeDefined();
      expect(screen.getByText(/recusados automaticamente/)).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByText("Aceitar pedido"));
      });
      expect(accept).toHaveBeenCalledWith("req-2");

      await act(async () => {
        fireEvent.press(screen.getByText("Recusar"));
      });
      expect(reject).toHaveBeenCalledWith("req-2");
    });

    it("mantém o diálogo de aceite aberto quando a resposta falha", async () => {
      const accept = jest.fn().mockResolvedValue(false);
      mockedUseReceived.mockReturnValue([
        { items: [mockReceivedItemPending], loading: false, error: null, respondingId: null, respondError: null, respondErrorId: null },
        { reload: jest.fn(), accept, reject: jest.fn() },
      ]);

      const screen = await render(<ReceivedRequests sessionUserId="user-me" />);
      await act(async () => {
        fireEvent.press(screen.getByText("Aceitar"));
      });
      await act(async () => {
        fireEvent.press(screen.getByText("Aceitar pedido"));
      });

      expect(accept).toHaveBeenCalledWith("req-2");
      expect(screen.getByText("Aceitar este pedido?")).toBeDefined();
    });

    it("exibe botão de ver detalhes do encontro para pedidos aceitos e alerta de erro de resposta", async () => {
      const onNavigate = jest.fn();
      mockedUseReceived.mockReturnValue([
        {
          items: [mockReceivedItemAccepted],
          loading: false,
          error: null,
          respondingId: null,
          respondError: "Não foi possível aceitar a negociação.",
          respondErrorId: "req-3",
        },
        { reload: jest.fn(), accept: jest.fn(), reject: jest.fn() },
      ]);

      const screen = await render(
        <ReceivedRequests sessionUserId="user-me" onNavigateToNegotiationDetail={onNavigate} />,
      );

      expect(screen.getByText("A Hora da Estrela")).toBeDefined();
      expect(screen.getByText("Venda")).toBeDefined();
      expect(screen.getByText("R$ 25,00")).toBeDefined();
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
        { reload: jest.fn(), accept: jest.fn(), reject: jest.fn() },
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
