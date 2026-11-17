import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import { MemoryNetworkStatusDataSource } from "@/infra/datasources/memoryNetworkStatusDataSource";
import { Chat } from "@/view/conversations/chat";

jest.mock("@/viewmodel/useRequestDetailViewModel", () => ({ useRequestDetailViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNegotiationChatViewModel", () => ({ useNegotiationChatViewModel: jest.fn() }));
jest.mock("@/viewmodel/useMeetingViewModel", () => ({
  useMeetingViewModel: jest.fn(() => [{ meeting: null, loading: false }, { reload: jest.fn(), confirm: jest.fn() }]),
}));
jest.mock("@/viewmodel/useDeliveryViewModel", () => ({
  useDeliveryStatus: () => ({ loading: false, role: "receiver", completed: null }),
}));
jest.mock("@/view/calendarIntegration", () => ({ addMeetingToCalendar: jest.fn() }));
jest.mock("expo-linking", () => ({ openURL: jest.fn() }));

import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";

const sampleBook: Book = {
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "ana",
  modality: "trade",
  status: "reserved",
};

describe("Chat — Blindagem offline (Spec 130 / ADR 0101)", () => {
  it("desabilita botão de envio e avisa quando offline", async () => {
    const detailActions = { reload: jest.fn(), respond: jest.fn() };
    jest.mocked(useRequestDetailViewModel).mockReturnValue([
      {
        detail: {
          request: { id: "r1", listingId: "b1", requesterId: "me", status: "accepted" },
          book: sampleBook,
          isOwner: false,
          counterpartId: "ana",
          counterpartName: "Ana Paula",
          counterpartPhotoUrl: null,
          safeMeetingPoints: [],
        },
        loading: false,
        error: null,
      },
      detailActions,
    ]);

    const chatActions = { setInputText: jest.fn(), sendMessage: jest.fn(), retryLastMessage: jest.fn(), reload: jest.fn() };
    jest.mocked(useNegotiationChatViewModel).mockReturnValue([
      { messages: [], inputText: "Olá, tudo bem?", isLoading: false, isSending: false, error: null, sendError: null },
      chatActions,
    ]);

    const networkStatusDataSource = new MemoryNetworkStatusDataSource(false); // Offline

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Chat
          requestId="r1"
          sessionUserId="me"
          networkStatusDataSource={networkStatusDataSource}
        />,
      );
    });

    // Deve exibir aviso de desconexão
    expect(screen.getByText("Sem conexão para enviar mensagens")).toBeDefined();

    // Botão de envio desabilitado
    const sendButton = screen.getByLabelText("Envio indisponível sem conexão");
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);

    // Tocar não dispara mensagem
    fireEvent.press(sendButton);
    expect(chatActions.sendMessage).not.toHaveBeenCalled();

    // Quando fica online, o botão volta a ficar habilitado
    await act(async () => {
      networkStatusDataSource.setOnline(true);
    });

    const activeSendButton = screen.getByLabelText("Enviar mensagem");
    expect(activeSendButton.props.accessibilityState?.disabled).toBe(false);
  });
});
