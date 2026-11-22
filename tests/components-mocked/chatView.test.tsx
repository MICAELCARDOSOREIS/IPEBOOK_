import { act, fireEvent, render } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import type { Book } from "@/model/entities/book";
import type { NegotiationChatState } from "@/viewmodel/useNegotiationChatViewModel";
import type { NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import { addMeetingToCalendar } from "@/view/calendarIntegration";
import { Chat } from "@/view/conversations/chat";

jest.mock("@/viewmodel/useRequestDetailViewModel", () => ({ useRequestDetailViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNegotiationChatViewModel", () => ({ useNegotiationChatViewModel: jest.fn() }));
const mockMeetingActions = { reload: jest.fn(), confirm: jest.fn() };
let mockMeetingState: { meeting: any; loading: boolean } = { meeting: null, loading: false };
jest.mock("@/viewmodel/useMeetingViewModel", () => ({
  useMeetingViewModel: jest.fn(() => [mockMeetingState, mockMeetingActions]),
}));
jest.mock("@/view/calendarIntegration", () => ({
  addMeetingToCalendar: jest.fn().mockResolvedValue(true),
}));
jest.mock("expo-linking", () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
}));
// Entrega por QR (Spec 095): começa sem conclusão.
let mockDeliveryCompleted: Record<string, unknown> | null = null;
jest.mock("@/viewmodel/useDeliveryViewModel", () => ({
  useDeliveryStatus: () => ({ loading: false, role: "receiver", completed: mockDeliveryCompleted }),
}));

import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";

const book: Book = { id: "b1", title: "Dom Casmurro", author: "Machado", ownerId: "ana", modality: "trade", status: "reserved" };

function setup(
  chat: Partial<NegotiationChatState> = {},
  detailOverride: Partial<NegotiationDetail> = {},
  detailActionsOverride: { reload?: any; respond?: any } = {},
) {
  const detailActions = { reload: jest.fn(), respond: jest.fn().mockResolvedValue(true), ...detailActionsOverride };
  jest.mocked(useRequestDetailViewModel).mockReturnValue([
    {
      detail: {
        request: { id: "r1", listingId: "b1", requesterId: "me", status: "accepted" },
        book,
        isOwner: false,
        counterpartId: "ana",
        counterpartName: "Ana Paula",
        counterpartPhotoUrl: "https://cdn/ana.jpg",
        safeMeetingPoints: [],
        ...detailOverride,
      },
      loading: false,
      error: null,
    },
    detailActions,
  ]);
  const actions = { setInputText: jest.fn(), sendMessage: jest.fn().mockResolvedValue(true), retryLastMessage: jest.fn(), reload: jest.fn() };
  jest.mocked(useNegotiationChatViewModel).mockReturnValue([
    { messages: [], inputText: "", isLoading: false, isSending: false, error: null, sendError: null, ...chat },
    actions,
  ]);
  return { actions, detailActions };
}

async function renderChat(props: Partial<Parameters<typeof Chat>[0]> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Chat requestId="r1" sessionUserId="me" {...props} />);
  });
  return screen;
}

describe("Chat em tela cheia (Spec 082)", () => {
  it("mostra o horário expirado e permite sugerir outro sem oferecer confirmação", async () => {
    mockMeetingState = {
      meeting: {
        id: "m1", requestId: "r1", pointName: "Praça da Bandeira",
        scheduledAt: "2000-01-01T14:00:00.000Z", status: "proposed", proposedBy: "ana",
      },
      loading: false,
    };
    setup();
    const onScheduleMeeting = jest.fn();
    try {
      const screen = await renderChat({ embedded: true, onScheduleMeeting });
      expect(screen.getByText("Horário expirado")).toBeDefined();
      expect(screen.queryByRole("button", { name: "Confirmar encontro" })).toBeNull();
      fireEvent.press(screen.getByRole("button", { name: "Sugerir novo horário" }));
      expect(onScheduleMeeting).toHaveBeenCalledWith("r1");
    } finally {
      mockMeetingState = { meeting: null, loading: false };
    }
  });

  it("reúne as ações da conversa no menu do cabeçalho", async () => {
    setup();
    const onDeleteConversation = jest.fn();
    const screen = await renderChat({ embedded: true, onDeleteConversation });
    expect(screen.queryByText("Apagar conversa")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Opções da conversa" })); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Apagar conversa" })); });
    expect(onDeleteConversation).toHaveBeenCalledTimes(1);
  });

  it("tocar no livro no cabeçalho abre o acompanhamento da negociação", async () => {
    setup();
    const onOpenNegotiation = jest.fn();
    const screen = await renderChat({ onOpenNegotiation });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Abrir negociação de Dom Casmurro" }));
    });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("mostra a pessoa, o livro e Combinar abre a negociação (CA2)", async () => {
    setup();
    const onOpenNegotiation = jest.fn();
    const screen = await renderChat({ onOpenNegotiation });
    expect(screen.getByRole("header").props.children).toBe("Ana Paula");
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Troca")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Combinar")); });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("separa balões meus e da outra pessoa com horário e envia pelo botão (CA3)", async () => {
    const { actions } = setup({
      inputText: "Combinado",
      messages: [
        { id: "m1", requestId: "r1", senderId: "ana", content: "Pode ser sábado?", createdAt: "2026-10-26T09:02:00" },
        { id: "m2", requestId: "r1", senderId: "me", content: "Pode sim", createdAt: "2026-10-26T09:05:00" },
      ],
    });
    const screen = await renderChat();
    expect(screen.getByLabelText("Ana Paula às 9h02: Pode ser sábado?")).toBeDefined();
    expect(screen.getByLabelText("Você às 9h05: Pode sim")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Enviar mensagem")); });
    expect(actions.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("na conversa vazia, a sugestão preenche o campo (CA4)", async () => {
    const { actions } = setup();
    const screen = await renderChat();
    expect(screen.getByText("Comece a conversa")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("O livro ainda está disponível?")); });
    expect(actions.setInputText).toHaveBeenCalledWith("O livro ainda está disponível?");
  });

  it("mostra a foto da pessoa no cabeçalho e Voltar funciona (Spec 089)", async () => {
    setup();
    const onBack = jest.fn();
    const screen = await renderChat({ onBack });
    expect(screen.getByLabelText("Ana Paula")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("Combinar é um botão com rótulo acessível (Spec 089)", async () => {
    setup();
    const onOpenNegotiation = jest.fn();
    const screen = await renderChat({ onOpenNegotiation });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Combinar encontro na negociação" })); });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("depois da entrega concluída, o chat não oferece mais o Combinar (Spec 095)", async () => {
    setup();
    mockDeliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    mockDeliveryCompleted = null;
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.queryByLabelText("Combinar encontro na negociação")).toBeNull();
  });

  it("depois da entrega concluída, a conversa vira só consulta, sem campo de mensagem", async () => {
    setup();
    mockDeliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    mockDeliveryCompleted = null;
    expect(screen.getByText("Negociação concluída. A conversa ficou só para consulta.")).toBeDefined();
    expect(screen.queryByLabelText("Campo de mensagem")).toBeNull();
    expect(screen.queryByLabelText("Enviar mensagem")).toBeNull();
  });

  it("embutido na web larga, omite Voltar, Combinar e o cartão do livro (o painel lateral já oferece)", async () => {
    setup();
    const screen = await renderChat({ embedded: true });
    expect(screen.queryByText("Dom Casmurro")).toBeNull();
    expect(screen.queryByLabelText("Voltar")).toBeNull();
    expect(screen.queryByLabelText("Combinar encontro na negociação")).toBeNull();
  });

  it("mostra a falha de envio com Reenviar", async () => {
    const { actions } = setup({ sendError: "Sem conexão." });
    const screen = await renderChat();
    expect(screen.getByText("Sem conexão.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Reenviar")); });
    expect(actions.retryLastMessage).toHaveBeenCalledTimes(1);
  });

  describe("Melhorias na negociação (Spec 113)", () => {
    const offeredBook: Book = {
      id: "b2",
      title: "Memórias Póstumas",
      author: "Machado de Assis",
      ownerId: "me",
      modality: "trade",
      status: "available",
    };

    it("dono vê proposta pendente com mensagem e contrapartida, podendo aceitar", async () => {
      const { detailActions } = setup(
        {},
        {
          isOwner: true,
          request: {
            id: "r1",
            listingId: "b1",
            requesterId: "ana",
            status: "pending",
            initialMessage: "Olá, tenho interesse!",
            offeredBookId: "b2",
          },
          offeredBook,
        },
      );
      const screen = await renderChat();
      expect(screen.getByText("Nova proposta recebida")).toBeDefined();
      expect(screen.getByText('Mensagem de Ana Paula:')).toBeDefined();
      expect(screen.getByText('"Olá, tenho interesse!"')).toBeDefined();
      expect(screen.getByText("Livro oferecido em troca:")).toBeDefined();
      expect(screen.getByText("Memórias Póstumas")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Aceitar proposta" }));
      });
      expect(detailActions.respond).toHaveBeenCalledWith("accept");
    });

    it("dono pode recusar a proposta recebida", async () => {
      const { detailActions } = setup(
        {},
        {
          isOwner: true,
          request: {
            id: "r1",
            listingId: "b1",
            requesterId: "ana",
            status: "pending",
          },
        },
      );
      const screen = await renderChat();
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Recusar proposta" }));
      });
      expect(detailActions.respond).toHaveBeenCalledWith("reject");
    });

    it("exibe mensagem de erro quando o aceite da proposta falha", async () => {
      setup(
        {},
        {
          isOwner: true,
          request: {
            id: "r1",
            listingId: "b1",
            requesterId: "ana",
            status: "pending",
          },
        },
        { respond: jest.fn().mockRejectedValue(new Error("Falha ao aceitar")) },
      );
      const screen = await renderChat();
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Aceitar proposta" }));
      });
      expect(screen.getByText("Não foi possível aceitar a proposta. Tente novamente.")).toBeDefined();
    });

    it("exibe mensagem de erro quando a recusa da proposta falha", async () => {
      setup(
        {},
        {
          isOwner: true,
          request: {
            id: "r1",
            listingId: "b1",
            requesterId: "ana",
            status: "pending",
          },
        },
        { respond: jest.fn().mockRejectedValue(new Error("Falha ao recusar")) },
      );
      const screen = await renderChat();
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Recusar proposta" }));
      });
      expect(screen.getByText("Não foi possível recusar a proposta.")).toBeDefined();
    });

    it("interessado vê banner informativo de proposta enviada com sua mensagem e livro", async () => {
      setup(
        {},
        {
          isOwner: false,
          request: {
            id: "r1",
            listingId: "b1",
            requesterId: "me",
            status: "pending",
            initialMessage: "Troca pelo meu?",
            offeredBookId: "b2",
          },
          offeredBook,
        },
      );
      const screen = await renderChat();
      expect(
        screen.getByText("Sua proposta foi enviada. O bate-papo será liberado assim que o anunciante aceitar."),
      ).toBeDefined();
      expect(screen.getByText('Sua mensagem: "Troca pelo meu?"')).toBeDefined();
      expect(screen.getByText("Livro oferecido: Memórias Póstumas")).toBeDefined();
      expect(screen.getByText("Proposta em análise")).toBeDefined();
    });

    it("renderiza balões de evento do encontro e entrega na linha do tempo", async () => {
      mockMeetingState = {
        meeting: {
          id: "m1",
          requestId: "r1",
          pointName: "Praça da Bandeira",
          scheduledAt: "2026-11-05T14:00:00.000Z",
          status: "confirmed",
          suggestedBy: "ana",
        },
        loading: false,
      };
      mockDeliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-11-05T15:00:00.000Z" };

      setup({ messages: [] });
      const screen = await renderChat();

      expect(screen.getByText("Encontro confirmado em Praça da Bandeira")).toBeDefined();
      expect(screen.getByText("Livro entregue presencialmente com sucesso!")).toBeDefined();

      mockMeetingState = { meeting: null, loading: false };
      mockDeliveryCompleted = null;
    });

    it("permite abrir direções no mapa, adicionar à agenda e ir para entrega", async () => {
      mockMeetingState = {
        meeting: {
          id: "m1",
          requestId: "r1",
          pointName: "Praça da Bandeira",
          scheduledAt: "2026-11-05T14:00:00.000Z",
          status: "confirmed",
          suggestedBy: "ana",
        },
        loading: false,
      };

      setup();
      const onScheduleMeeting = jest.fn();
      const onOpenDelivery = jest.fn();
      const screen = await renderChat({ onScheduleMeeting, onOpenDelivery });

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Como chegar" }));
      });
      expect(Linking.openURL).toHaveBeenCalled();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Adicionar à agenda" }));
      });
      expect(addMeetingToCalendar).toHaveBeenCalled();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Entrega do livro" }));
      });
      expect(onOpenDelivery).toHaveBeenCalledWith("r1");

      mockMeetingState = { meeting: null, loading: false };
    });

    it("exibe contador de caracteres quando a mensagem atinge 800 caracteres (Spec 120)", async () => {
      const longText = "a".repeat(850);
      setup({ inputText: longText });
      const screen = await renderChat();

      expect(screen.getByText("850/1000")).toBeDefined();
    });

    it("embutido sem encontro marcado omite o cartão redundante de combinar encontro e exibe o canal", async () => {
      mockMeetingState = { meeting: null, loading: false };
      setup();
      const screen = await renderChat({ embedded: true });

      expect(screen.getByText("Bate-papo da negociação · Troca")).toBeDefined();
      expect(screen.queryByText("Nenhum encontro marcado")).toBeNull();
      expect(screen.queryByRole("button", { name: "Combinar encontro" })).toBeNull();
    });

    it("embutido exibe a faixa de encontro quando já existe encontro confirmado", async () => {
      mockMeetingState = {
        meeting: {
          id: "m1",
          requestId: "r1",
          pointName: "Praça da Bandeira",
          scheduledAt: "2026-11-05T14:00:00.000Z",
          status: "confirmed",
          suggestedBy: "ana",
        },
        loading: false,
      };
      setup();
      const screen = await renderChat({ embedded: true });

      expect(screen.getByText("Encontro confirmado")).toBeDefined();
      mockMeetingState = { meeting: null, loading: false };
    });

    it("envia ao pressionar Enter no web, recarrega em erro e aciona ações do encontro no modo normal e embutido", async () => {
      const { Platform } = require("react-native");
      const originalOs = Platform.OS;
      Platform.OS = "web";
      try {
        const { actions } = setup({ inputText: "Mensagem via Enter" });
        const screen = await renderChat();
        const input = screen.getByLabelText("Campo de mensagem");
        await act(async () => {
          fireEvent(input, "keyPress", {
            nativeEvent: { key: "Enter", shiftKey: false },
            preventDefault: jest.fn(),
          });
        });
        expect(actions.sendMessage).toHaveBeenCalledTimes(1);
      } finally {
        Platform.OS = originalOs;
      }

      const { actions: errActions } = setup({ error: "Erro ao carregar mensagens" });
      const errScreen = await renderChat();
      await act(async () => {
        fireEvent.press(errScreen.getByRole("button", { name: "Tentar novamente" }));
      });
      expect(errActions.reload).toHaveBeenCalled();

      mockMeetingState = {
        meeting: {
          id: "m2",
          requestId: "r1",
          pointName: "Praça da Bandeira",
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "proposed",
          proposedBy: "ana",
        },
        loading: false,
      };
      setup();
      const onScheduleMeeting = jest.fn();
      const onOpenDelivery = jest.fn();
      const proposedEmbedded = await renderChat({
        embedded: true,
        onScheduleMeeting,
        onOpenDelivery,
      });
      await act(async () => {
        fireEvent.press(proposedEmbedded.getByRole("button", { name: "Confirmar encontro" }));
        fireEvent.press(proposedEmbedded.getByRole("button", { name: "Sugerir outro horário" }));
      });
      expect(mockMeetingActions.confirm).toHaveBeenCalled();
      expect(onScheduleMeeting).toHaveBeenCalledWith("r1");

      mockMeetingState = {
        meeting: {
          id: "m3",
          requestId: "r1",
          pointName: "Praça da Bandeira",
          scheduledAt: "2026-11-05T14:00:00.000Z",
          status: "confirmed",
          proposedBy: "ana",
        },
        loading: false,
      };
      setup();
      const confirmedEmbedded = await renderChat({
        embedded: true,
        onScheduleMeeting,
        onOpenDelivery,
      });
      await act(async () => {
        fireEvent.press(confirmedEmbedded.getByRole("button", { name: "Entrega do livro" }));
        fireEvent.press(confirmedEmbedded.getByRole("button", { name: "Adicionar à agenda" }));
        fireEvent.press(confirmedEmbedded.getByRole("button", { name: "Reagendar encontro" }));
      });
      expect(onOpenDelivery).toHaveBeenCalledWith("r1");
      expect(addMeetingToCalendar).toHaveBeenCalled();

      mockMeetingState = { meeting: null, loading: false };
    });
  });
});
