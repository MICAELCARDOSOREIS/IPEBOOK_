import { createElement } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { SupabaseDeliveryDataSource } from "@/infra/datasources/supabaseDeliveryDataSource";
import { SupabaseMeetingDataSource } from "@/infra/datasources/supabaseMeetingDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { MessageSubscriptionStatusCallback } from "@/model/datasources/iMessageDataSource";
import type { Delivery } from "@/model/entities/delivery";
import type { Meeting } from "@/model/entities/meeting";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type { IBookRequestUseCases, NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import type { IDeliveryUseCases } from "@/usecase/iDeliveryUseCases";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";
import { useDeliveryStatus, useDeliveryViewModel } from "@/viewmodel/useDeliveryViewModel";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { notifyBooksCatalogMutated, notifyFavoriteChanged } from "@/viewmodel/sessionCacheRegistry";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mounted: ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
  jest.restoreAllMocks();
});

describe("Sincronização em tempo real (chat, encontros, propostas e entregas)", () => {
  it("ressincroniza mensagens silenciosamente quando o canal Realtime reconecta ou o app volta ao primeiro plano", async () => {
    const initialMessages: NegotiationMessage[] = [
      { id: "m1", requestId: "req-1", senderId: "u1", content: "Oi!", createdAt: "2026-11-26T10:00:00Z" },
    ];
    let serverMessages = [...initialMessages];
    let capturedStatus: MessageSubscriptionStatusCallback | undefined;
    let appStateListener: ((state: AppStateStatus) => void) | undefined;

    jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return { remove: jest.fn() } as never;
    });

    const useCases = {
      getMessages: jest.fn(async () => [...serverMessages]),
      sendMessage: jest.fn(async () => serverMessages[0]),
      subscribeToMessages: jest.fn((_reqId, _onMsg, onStatus?: MessageSubscriptionStatusCallback) => {
        capturedStatus = onStatus;
        return jest.fn();
      }),
    };

    let result!: ReturnType<typeof useNegotiationChatViewModel>;
    function Probe() {
      result = useNegotiationChatViewModel("req-1", "u1", useCases);
      return null;
    }

    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });
    expect(result[0].messages).toHaveLength(1);
    expect(result[0].isLoading).toBe(false);

    // Simula queda do canal e nova mensagem chegando enquanto estava desconectado
    serverMessages = [
      ...serverMessages,
      { id: "m2", requestId: "req-1", senderId: "u2", content: "Aceitei o encontro!", createdAt: "2026-11-26T10:01:00Z" },
    ];

    await act(async () => {
      capturedStatus?.("CHANNEL_ERROR");
      capturedStatus?.("SUBSCRIBED");
    });

    expect(result[0].messages.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(result[0].isLoading).toBe(false);

    // Simula ida ao segundo plano e retorno com uma 3ª mensagem
    serverMessages = [
      ...serverMessages,
      { id: "m3", requestId: "req-1", senderId: "u2", content: "Estou indo!", createdAt: "2026-11-26T10:02:00Z" },
    ];

    await act(async () => {
      appStateListener?.("background");
      appStateListener?.("active");
    });

    expect(result[0].messages.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);
  });

  it("atualiza o encontro ao vivo no useMeetingViewModel quando a outra pessoa confirma sem precisar sair e entrar", async () => {
    const proposedMeeting: Meeting = {
      id: "meet-1",
      requestId: "req-1",
      pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2026-11-27T15:00:00.000Z",
      proposedBy: "u1",
      status: "proposed",
    };
    let currentMeeting: Meeting = proposedMeeting;
    let triggerRealtime: (() => void) | undefined;

    const useCases: IMeetingUseCases = {
      getMeeting: jest.fn(async () => currentMeeting),
      getMeetingHistory: jest.fn(async () => [currentMeeting]),
      getUserMeetingHistory: jest.fn(async () => [currentMeeting]),
      propose: jest.fn(),
      confirm: jest.fn(),
      reschedule: jest.fn(),
      cancel: jest.fn(),
    };
    const rateLimiter = { check: jest.fn(() => ({ allowed: true, retryAfterMs: 0 })), consume: jest.fn(), reset: jest.fn() };
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const subscribe = jest.fn((_reqId: string, _userId: string, onChange: () => void) => {
      triggerRealtime = onChange;
      return jest.fn();
    });

    let result!: ReturnType<typeof useMeetingViewModel>;
    function Probe() {
      result = useMeetingViewModel("req-1", "u1", useCases, rateLimiter as never, logger as never, subscribe);
      return null;
    }

    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });
    expect(result[0].meeting?.status).toBe("proposed");
    expect(result[0].loading).toBe(false);

    // Outra pessoa aceita/confirma o encontro no banco
    currentMeeting = { ...proposedMeeting, status: "confirmed" };
    await act(async () => {
      triggerRealtime?.();
    });

    expect(result[0].meeting?.status).toBe("confirmed");
    expect(result[0].loading).toBe(false);
  });

  it("atualiza o status da proposta ao vivo no useRequestDetailViewModel quando o dono aceita", async () => {
    let status: "pending" | "accepted" = "pending";
    let triggerRealtime: (() => void) | undefined;

    const makeDetail = (): NegotiationDetail => ({
      request: { id: "req-1", listingId: "book-1", requesterId: "u2", status },
      book: {
        id: "book-1",
        ownerId: "u1",
        title: "Vidas Secas",
        author: "Graciliano Ramos",
        modality: "trade",
        photos: [],
        status: status === "accepted" ? "reserved" : "available",
      },
      isOwner: false,
      counterpartId: "u1",
      counterpartName: "Ana",
      safeMeetingPoints: [],
    });

    const useCases = {
      getRequestDetail: jest.fn(async () => makeDetail()),
    } as unknown as IBookRequestUseCases;

    const subscribe = jest.fn((_reqId: string, _userId: string, onChange: () => void) => {
      triggerRealtime = onChange;
      return jest.fn();
    });

    let result!: ReturnType<typeof useRequestDetailViewModel>;
    function Probe() {
      result = useRequestDetailViewModel("req-1", "u2", useCases, subscribe);
      return null;
    }

    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });
    expect(result[0].detail?.request.status).toBe("pending");

    status = "accepted";
    await act(async () => {
      triggerRealtime?.();
    });

    expect(result[0].detail?.request.status).toBe("accepted");
    expect(result[0].loading).toBe(false);
  });

  it("atualiza a entrega por QR ao vivo em useDeliveryStatus e useDeliveryViewModel", async () => {
    let completed: Delivery | null = null;
    let triggerStatus: (() => void) | undefined;
    let triggerQr: (() => void) | undefined;

    const useCases: IDeliveryUseCases = {
      getRole: jest.fn(async () => "giver"),
      getDelivery: jest.fn(async () => completed),
      generateCode: jest.fn(async () => ({ code: "ABCD2345", expiresAt: "2026-11-26T15:00:00.000Z" })),
      confirmDelivery: jest.fn(),
    };

    const subStatus = jest.fn((_reqId: string, _userId: string, onChange: () => void) => {
      triggerStatus = onChange;
      return jest.fn();
    });
    const subQr = jest.fn((_reqId: string, _userId: string, onChange: () => void) => {
      triggerQr = onChange;
      return jest.fn();
    });

    let statusResult!: ReturnType<typeof useDeliveryStatus>;
    let qrResult!: ReturnType<typeof useDeliveryViewModel>;
    function Probe() {
      statusResult = useDeliveryStatus("req-1", "u1", 0, useCases, subStatus);
      qrResult = useDeliveryViewModel("req-1", "u1", useCases, 0, subQr);
      return null;
    }

    await act(async () => {
      mounted.push(create(createElement(Probe)));
    });
    expect(statusResult.completed).toBeNull();
    expect(qrResult[0].completed).toBeNull();

    completed = { requestId: "req-1", completedBy: "u2", completedAt: "2026-11-26T14:30:00.000Z" };
    await act(async () => {
      triggerStatus?.();
      triggerQr?.();
    });

    expect(statusResult.completed).toEqual(completed);
    expect(qrResult[0].completed).toEqual(completed);
  });

  it("autentica o socket Realtime e assina tabelas de encontros, pedidos e entregas nos datasources Supabase", async () => {
    const handlers: Array<(payload: unknown) => void> = [];
    const setAuth = jest.fn();
    const removeChannel = jest.fn();
    const channel: { on: jest.Mock; subscribe: jest.Mock } = {
      on: jest.fn((_evt: string, _cfg: unknown, cb: (payload: unknown) => void) => {
        handlers.push(cb);
        return channel;
      }),
      subscribe: jest.fn(() => channel),
    };
    const client = {
      auth: { getSession: jest.fn(async () => ({ data: { session: { access_token: "jwt-valido" } } })) },
      realtime: { setAuth },
      channel: jest.fn(() => channel),
      removeChannel,
    } as unknown as SupabaseAppClient;

    const onMeeting = jest.fn();
    const onRequest = jest.fn();
    const onDelivery = jest.fn();

    const offMeeting = new SupabaseMeetingDataSource(client).subscribeToRequest("req-1", onMeeting);
    const offRequest = new SupabaseBookRequestDataSource(client).subscribeToRequest("req-1", onRequest);
    const offDelivery = new SupabaseDeliveryDataSource(client).subscribeToRequest("req-1", onDelivery);

    await Promise.resolve();
    expect(setAuth).toHaveBeenCalledWith("jwt-valido");
    expect(channel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ table: "v2_meetings", filter: "request_id=eq.req-1" }),
      expect.any(Function),
    );
    expect(channel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ table: "v2_book_requests", filter: "id=eq.req-1" }),
      expect.any(Function),
    );
    expect(channel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ table: "v2_deliveries", filter: "request_id=eq.req-1" }),
      expect.any(Function),
    );

    handlers.forEach((fn) => fn({ new: {} }));
    expect(onMeeting).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onDelivery).toHaveBeenCalledTimes(1);

    offMeeting();
    offRequest();
    offDelivery();
    expect(removeChannel).toHaveBeenCalledTimes(3);
  });

  it("sincroniza catálogo (Início/Explorar) quando um anúncio é alterado na Estante e sincroniza corações de favoritos entre telas", async () => {
    let booksList = [
      { id: "b1", ownerId: "u1", title: "Capitães da Areia", author: "Jorge Amado", modality: "sale" as const, photos: [], status: "available" as const },
    ];
    const bookUseCases = {
      listBooks: jest.fn(async () => [...booksList]),
    };

    let homeResult!: ReturnType<typeof useHomeViewModel>;
    function HomeProbe() {
      homeResult = useHomeViewModel(bookUseCases as never);
      return null;
    }

    const favUseCases = {
      isFavorite: jest.fn(async () => false),
      toggleFavorite: jest.fn(async () => true),
    };
    let favResult!: ReturnType<typeof useFavoriteButtonViewModel>;
    function FavProbe() {
      favResult = useFavoriteButtonViewModel("b1", "u1", favUseCases as never);
      return null;
    }

    await act(async () => {
      mounted.push(create(createElement(HomeProbe)));
      mounted.push(create(createElement(FavProbe)));
    });
    expect(homeResult[0].books).toHaveLength(1);
    expect(favResult[0].selected).toBe(false);

    // Simula exclusão/pausa do anúncio na aba Estante -> Início/Explorar recarrega sem sair do pager
    booksList = [];
    await act(async () => {
      notifyBooksCatalogMutated();
    });
    expect(homeResult[0].books).toHaveLength(0);

    // Simula favoritar o livro em Detalhe/Favoritos -> coração montado no Explorar atualiza na hora
    await act(async () => {
      notifyFavoriteChanged("u1", "b1", true);
    });
    expect(favResult[0].selected).toBe(true);
  });
});
