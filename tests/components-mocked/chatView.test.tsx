import { act, fireEvent, render } from "@testing-library/react-native";
import * as Linking from "expo-linking";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { NegotiationChatState } from "@/viewmodel/useNegotiationChatViewModel";
import type { NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import { addMeetingToCalendar } from "@/view/calendarIntegration";
import { Chat } from "@/view/conversations/chat";

vi.mock("@/viewmodel/useRequestDetailViewModel", () => ({ useRequestDetailViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNegotiationChatViewModel", () => ({ useNegotiationChatViewModel: vi.fn() }));
const mockMeetingActions = { reload: vi.fn(), confirm: vi.fn() };
let mockMeetingState: { meeting: any; loading: boolean } = { meeting: null, loading: false };
vi.mock("@/viewmodel/useMeetingViewModel", () => ({
  useMeetingViewModel: vi.fn(() => [mockMeetingState, mockMeetingActions]),
}));
vi.mock("@/view/calendarIntegration", () => ({
  addMeetingToCalendar: vi.fn().mockResolvedValue(true),
}));
vi.mock("expo-linking", () => ({
  openURL: vi.fn().mockResolvedValue(undefined),
}));
// Entrega por QR (Spec 095): começa sem conclusão.
let deliveryCompleted: Record<string, unknown> | null = null;
vi.mock("@/viewmodel/useDeliveryViewModel", () => ({
  useDeliveryStatus: () => ({ loading: false, role: "receiver", completed: deliveryCompleted }),
}));

import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";

const book: Book = { id: "b1", title: "Dom Casmurro", author: "Machado", ownerId: "ana", modality: "trade", status: "reserved" };

function setup(
  chat: Partial<NegotiationChatState> = {},
  detailOverride: Partial<NegotiationDetail> = {},
  detailActionsOverride: { reload?: any; respond?: any } = {},
) {
  const detailActions = { reload: vi.fn(), respond: vi.fn().mockResolvedValue(true), ...detailActionsOverride };
  vi.mocked(useRequestDetailViewModel).mockReturnValue([
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
  const actions = { setInputText: vi.fn(), sendMessage: vi.fn().mockResolvedValue(true), retryLastMessage: vi.fn(), reload: vi.fn() };
  vi.mocked(useNegotiationChatViewModel).mockReturnValue([
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
  it("tocar no cartão do livro abre o acompanhamento da negociação", async () => {
    setup();
    const onOpenNegotiation = vi.fn();
    const screen = await renderChat({ onOpenNegotiation });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Abrir negociação de Dom Casmurro" }));
    });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("mostra a pessoa, o livro e Combinar abre a negociação (CA2)", async () => {
    setup();
    const onOpenNegotiation = vi.fn();
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
    const onBack = vi.fn();
    const screen = await renderChat({ onBack });
    expect(screen.getByLabelText("Ana Paula")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("Combinar é um botão com rótulo acessível (Spec 089)", async () => {
    setup();
    const onOpenNegotiation = vi.fn();
    const screen = await renderChat({ onOpenNegotiation });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Combinar encontro na negociação" })); });
    expect(onOpenNegotiation).toHaveBeenCalledWith("r1");
  });

  it("depois da entrega concluída, o chat não oferece mais o Combinar (Spec 095)", async () => {
    setup();
    deliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    deliveryCompleted = null;
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.queryByLabelText("Combinar encontro na negociação")).toBeNull();
  });

  it("depois da entrega concluída, a conversa vira só consulta, sem campo de mensagem", async () => {
    setup();
    deliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-10-29T10:00:00.000Z" };
    const screen = await renderChat({});
    deliveryCompleted = null;
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
        { respond: vi.fn().mockRejectedValue(new Error("Falha ao aceitar")) },
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
        { respond: vi.fn().mockRejectedValue(new Error("Falha ao recusar")) },
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
      deliveryCompleted = { requestId: "r1", completedBy: "me", completedAt: "2026-11-05T15:00:00.000Z" };

      setup({ messages: [] });
      const screen = await renderChat();

      expect(screen.getByText("Encontro confirmado em Praça da Bandeira")).toBeDefined();
      expect(screen.getByText("Livro entregue presencialmente com sucesso!")).toBeDefined();

      mockMeetingState = { meeting: null, loading: false };
      deliveryCompleted = null;
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
      const onScheduleMeeting = vi.fn();
      const onOpenDelivery = vi.fn();
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
  });
});
