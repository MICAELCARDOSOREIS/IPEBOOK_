import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import type { BlockedUser } from "@/model/entities/blockedUser";
import type { Book } from "@/model/entities/book";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type { AppNotification } from "@/model/entities/notification";
import type { SearchAlert } from "@/model/entities/searchAlert";
import { DataSourceError } from "@/model/errors";
import type { IPushNotificationService } from "@/model/services/iPushNotificationService";
import type { IBlockedUserUseCases } from "@/usecase/iBlockedUserUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { useBlockedUsersViewModel } from "@/viewmodel/useBlockedUsersViewModel";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import {
  type NegotiationChatUseCases,
  useNegotiationChatViewModel,
} from "@/viewmodel/useNegotiationChatViewModel";
import { useNotificationPreferencesViewModel } from "@/viewmodel/useNotificationPreferencesViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mounted: ReactTestRenderer[] = [];

afterEach(async () => {
  while (mounted.length > 0) {
    const tree = mounted.pop();
    await act(async () => {
      tree?.unmount();
    });
  }
});

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function mountHook<T>(useHook: () => T) {
  let current!: T;
  function Probe() {
    current = useHook();
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return {
    get current() {
      return current;
    },
  };
}

const SAMPLE_BOOK: Book = {
  id: "book-1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "user-1",
  modality: "donation",
  status: "available",
};

const SAMPLE_DRAFT: Book = {
  ...SAMPLE_BOOK,
  id: "draft-1",
  status: "draft",
};

const SAMPLE_NOTIFICATION: AppNotification = {
  id: "notif-1",
  userId: "user-1",
  title: "Novo pedido",
  message: "Alguém pediu seu livro.",
  type: "request_received",
  read: false,
  createdAt: "2026-11-25T10:00:00.000Z",
};

const SAMPLE_ALERT: SearchAlert = {
  id: "alert-1",
  userId: "user-1",
  query: "Machado",
  active: true,
  createdAt: "2026-11-25T10:00:00.000Z",
  modalities: ["donation", "trade", "sale"],
};

const SAMPLE_BLOCKED: BlockedUser = {
  userId: "user-2",
  name: "Pessoa Bloqueada",
  blockedAt: "2026-11-25T10:00:00.000Z",
};

function stubBookUseCases(overrides: Partial<IBookUseCases> = {}): IBookUseCases {
  return {
    listBooks: jest.fn().mockResolvedValue([SAMPLE_BOOK]),
    createListing: jest.fn().mockResolvedValue(SAMPLE_BOOK),
    getBookById: jest.fn().mockResolvedValue(SAMPLE_BOOK),
    listMyListings: jest.fn().mockResolvedValue([SAMPLE_BOOK]),
    cancelListing: jest.fn().mockResolvedValue(undefined),
    updateListing: jest.fn().mockResolvedValue(SAMPLE_BOOK),
    togglePauseListing: jest.fn().mockResolvedValue({ ...SAMPLE_BOOK, status: "paused" }),
    listDrafts: jest.fn().mockResolvedValue([SAMPLE_DRAFT]),
    saveDraft: jest.fn().mockResolvedValue(SAMPLE_DRAFT),
    discardDraft: jest.fn().mockResolvedValue(undefined),
    publishDraft: jest.fn().mockResolvedValue(SAMPLE_BOOK),
    ...overrides,
  };
}

function stubPushService(): IPushNotificationService {
  return {
    getPermissions: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue(true),
    registerForPushNotifications: jest.fn().mockResolvedValue(null),
    subscribeToOpened: jest.fn().mockReturnValue(jest.fn()),
    scheduleLocalNotification: jest.fn().mockResolvedValue(null),
    scheduleMeetingReminder: jest.fn().mockResolvedValue(null),
    cancelScheduledNotification: jest.fn().mockResolvedValue(true),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
  };
}

describe("Atualização otimista com rollback em erro (caminho feliz em segundo plano)", () => {
  it("useFavoriteButtonViewModel: atualiza coração imediatamente e reverte se o banco falhar", async () => {
    const deferred = createDeferred<boolean>();
    const useCases: IFavoriteUseCases = {
      isFavorite: jest.fn().mockResolvedValue(false),
      toggleFavorite: jest.fn().mockReturnValue(deferred.promise),
      listFavorites: jest.fn().mockResolvedValue([]),
    };

    const hook = await mountHook(() => useFavoriteButtonViewModel("book-1", "user-1", useCases));
    expect(hook.current[0].selected).toBe(false);

    let togglePromise!: Promise<boolean>;
    await act(async () => {
      togglePromise = hook.current[1].toggle();
    });

    // Antes de o banco responder, o coração já está preenchido na tela
    expect(hook.current[0].selected).toBe(true);
    expect(hook.current[0].error).toBeNull();

    // Banco falha → reverte e exibe erro
    let ok = true;
    await act(async () => {
      deferred.reject(new DataSourceError("Sem conexão com o servidor."));
      ok = await togglePromise;
    });

    expect(ok).toBe(false);
    expect(hook.current[0].selected).toBe(false);
    expect(hook.current[0].error).toBe("Sem conexão com o servidor.");
  });

  it("useBookDetailViewModel: alterna favorito imediatamente nos detalhes e reverte em erro", async () => {
    const deferred = createDeferred<boolean>();
    const books = stubBookUseCases();
    const favorites: IFavoriteUseCases = {
      isFavorite: jest.fn().mockResolvedValue(false),
      toggleFavorite: jest.fn().mockReturnValue(deferred.promise),
      listFavorites: jest.fn().mockResolvedValue([]),
    };

    const hook = await mountHook(() => useBookDetailViewModel("book-1", books, favorites, "user-1"));
    expect(hook.current[0].isFavorite).toBe(false);

    let togglePromise!: Promise<void>;
    await act(async () => {
      togglePromise = hook.current[1].toggleFavorite("user-1");
    });

    expect(hook.current[0].isFavorite).toBe(true);

    await act(async () => {
      deferred.reject(new DataSourceError("Erro ao salvar favorito."));
      await togglePromise;
    });

    expect(hook.current[0].isFavorite).toBe(false);
    expect(hook.current[0].favoriteError).toBe("Erro ao salvar favorito.");
  });

  it("useFavoritesViewModel: remove favorito imediatamente da lista e restaura em erro", async () => {
    const deferred = createDeferred<boolean>();
    const favorites: IFavoriteUseCases = {
      isFavorite: jest.fn().mockResolvedValue(true),
      toggleFavorite: jest.fn().mockReturnValue(deferred.promise),
      listFavorites: jest.fn().mockResolvedValue([SAMPLE_BOOK]),
    };

    const hook = await mountHook(() => useFavoritesViewModel("user-1", favorites));
    expect(hook.current[0].books).toHaveLength(1);

    let removePromise!: Promise<boolean>;
    await act(async () => {
      removePromise = hook.current[1].removeFavorite("book-1");
    });

    expect(hook.current[0].books).toHaveLength(0);

    let ok = true;
    await act(async () => {
      deferred.reject(new DataSourceError("Falha ao remover favorito."));
      ok = await removePromise;
    });

    expect(ok).toBe(false);
    expect(hook.current[0].books).toHaveLength(1);
    expect(hook.current[0].actionError).toBe("Falha ao remover favorito.");
  });

  it("useNotificationsViewModel: marca como lida e exclui imediatamente, revertendo em erro", async () => {
    const markDeferred = createDeferred<void>();
    const deleteDeferred = createDeferred<void>();
    const useCases: INotificationUseCases = {
      listNotifications: jest.fn().mockResolvedValue([SAMPLE_NOTIFICATION]),
      markAsRead: jest.fn().mockReturnValue(markDeferred.promise),
      markAllAsRead: jest.fn().mockResolvedValue(undefined),
      deleteNotification: jest.fn().mockReturnValue(deleteDeferred.promise),
      clearAll: jest.fn().mockResolvedValue(undefined),
      clearRead: jest.fn().mockResolvedValue(undefined),
    };

    const hook = await mountHook(() =>
      useNotificationsViewModel("user-1", useCases, stubPushService()),
    );
    expect(hook.current[0].unreadCount).toBe(1);

    let markPromise!: Promise<void>;
    await act(async () => {
      markPromise = hook.current[1].markAsRead("notif-1");
    });
    expect(hook.current[0].unreadCount).toBe(0);
    expect(hook.current[0].notifications[0]?.read).toBe(true);

    await act(async () => {
      markDeferred.reject(new DataSourceError("Erro ao marcar lida."));
      await markPromise;
    });
    expect(hook.current[0].unreadCount).toBe(1);
    expect(hook.current[0].actionError).toBe("Erro ao marcar lida.");

    let deletePromise!: Promise<void>;
    await act(async () => {
      deletePromise = hook.current[1].deleteNotification("notif-1");
    });
    expect(hook.current[0].notifications).toHaveLength(0);

    await act(async () => {
      deleteDeferred.reject(new DataSourceError("Erro ao excluir."));
      await deletePromise;
    });
    expect(hook.current[0].notifications).toHaveLength(1);
    expect(hook.current[0].actionError).toBe("Erro ao excluir.");
  });

  it("useSearchAlertsViewModel: alterna ativo e remove imediatamente, revertendo em erro", async () => {
    const toggleDeferred = createDeferred<void>();
    const removeDeferred = createDeferred<void>();
    const useCases: ISearchAlertUseCases = {
      listAlerts: jest.fn().mockResolvedValue([SAMPLE_ALERT]),
      createAlert: jest.fn().mockResolvedValue(SAMPLE_ALERT),
      updateAlert: jest.fn().mockResolvedValue(undefined),
      setActive: jest.fn().mockReturnValue(toggleDeferred.promise),
      deleteAlert: jest.fn().mockReturnValue(removeDeferred.promise),
      matchNewBook: jest.fn().mockResolvedValue(undefined),
    };

    const hook = await mountHook(() => useSearchAlertsViewModel("user-1", "", useCases));
    expect(hook.current[0].alerts[0]?.active).toBe(true);

    let togglePromise!: Promise<void>;
    await act(async () => {
      togglePromise = hook.current[1].setActive("alert-1", false);
    });
    expect(hook.current[0].alerts[0]?.active).toBe(false);

    await act(async () => {
      toggleDeferred.reject(new DataSourceError("Erro ao pausar alerta."));
      await togglePromise;
    });
    expect(hook.current[0].alerts[0]?.active).toBe(true);
    expect(hook.current[0].error).toBe("Erro ao pausar alerta.");

    let removePromise!: Promise<boolean>;
    await act(async () => {
      removePromise = hook.current[1].remove("alert-1");
    });
    expect(hook.current[0].alerts).toHaveLength(0);

    let ok = true;
    await act(async () => {
      removeDeferred.reject(new DataSourceError("Erro ao remover alerta."));
      ok = await removePromise;
    });
    expect(ok).toBe(false);
    expect(hook.current[0].alerts).toHaveLength(1);
    expect(hook.current[0].error).toBe("Erro ao remover alerta.");
  });

  it("useNotificationPreferencesViewModel: alterna chave na hora e reverte se falhar", async () => {
    const updateDeferred = createDeferred<{ userId: string; mutedTypes: never[] }>();
    const useCases: IUserPreferencesUseCases = {
      getPreferences: jest.fn().mockResolvedValue({ userId: "user-1", mutedTypes: [] }),
      updatePreferences: jest.fn().mockReturnValue(updateDeferred.promise),
    };

    const hook = await mountHook(() => useNotificationPreferencesViewModel("user-1", useCases));
    expect(hook.current[0].enabled.meetings).toBe(true);

    let togglePromise!: Promise<void>;
    await act(async () => {
      togglePromise = hook.current[1].setEnabled("meetings", false);
    });
    expect(hook.current[0].enabled.meetings).toBe(false);

    await act(async () => {
      updateDeferred.reject(new DataSourceError("Falha ao salvar preferências."));
      await togglePromise;
    });
    expect(hook.current[0].enabled.meetings).toBe(true);
    expect(hook.current[0].error).toBe("Não foi possível salvar suas preferências de notificação.");
  });

  it("useMyListingsViewModel: pausa e remove anúncio imediatamente na estante, revertendo em erro", async () => {
    const pauseDeferred = createDeferred<Book>();
    const cancelDeferred = createDeferred<void>();
    const useCases = stubBookUseCases({
      togglePauseListing: jest.fn().mockReturnValue(pauseDeferred.promise),
      cancelListing: jest.fn().mockReturnValue(cancelDeferred.promise),
    });

    const hook = await mountHook(() => useMyListingsViewModel("user-1", useCases));
    expect(hook.current[0].books[0]?.status).toBe("available");

    let pausePromise!: Promise<boolean>;
    await act(async () => {
      pausePromise = hook.current[1].togglePauseListing("book-1");
    });
    expect(hook.current[0].books[0]?.status).toBe("paused");

    let pauseOk = true;
    await act(async () => {
      pauseDeferred.reject(new DataSourceError("Falha ao pausar anúncio."));
      pauseOk = await pausePromise;
    });
    expect(pauseOk).toBe(false);
    expect(hook.current[0].books[0]?.status).toBe("available");
    expect(hook.current[0].pauseError).toBe("Falha ao pausar anúncio.");

    let cancelPromise!: Promise<boolean>;
    await act(async () => {
      cancelPromise = hook.current[1].cancelListing("book-1");
    });
    expect(hook.current[0].books).toHaveLength(0);

    let cancelOk = true;
    await act(async () => {
      cancelDeferred.reject(new DataSourceError("Falha ao remover anúncio."));
      cancelOk = await cancelPromise;
    });
    expect(cancelOk).toBe(false);
    expect(hook.current[0].books).toHaveLength(1);
    expect(hook.current[0].cancelError).toBe("Falha ao remover anúncio.");
  });

  it("useManageListingViewModel: pausa anúncio imediatamente e reverte se o banco falhar", async () => {
    const pauseDeferred = createDeferred<Book>();
    const useCases = stubBookUseCases({
      togglePauseListing: jest.fn().mockReturnValue(pauseDeferred.promise),
    });

    const hook = await mountHook(() => useManageListingViewModel("book-1", "user-1", useCases));
    expect(hook.current[0].book?.status).toBe("available");

    let pausePromise!: Promise<boolean>;
    await act(async () => {
      pausePromise = hook.current[1].togglePause();
    });
    expect(hook.current[0].book?.status).toBe("paused");

    let ok = true;
    await act(async () => {
      pauseDeferred.reject(new DataSourceError("Erro ao pausar."));
      ok = await pausePromise;
    });
    expect(ok).toBe(false);
    expect(hook.current[0].book?.status).toBe("available");
    expect(hook.current[0].error).toBe("Erro ao pausar.");
  });

  it("useDraftsViewModel: descarta rascunho imediatamente e restaura se o banco falhar", async () => {
    const discardDeferred = createDeferred<void>();
    const useCases = stubBookUseCases({
      discardDraft: jest.fn().mockReturnValue(discardDeferred.promise),
    });

    const hook = await mountHook(() => useDraftsViewModel("user-1", useCases));
    expect(hook.current[0].drafts).toHaveLength(1);

    let discardPromise!: Promise<boolean>;
    await act(async () => {
      discardPromise = hook.current[1].discardDraft("draft-1");
    });
    expect(hook.current[0].drafts).toHaveLength(0);

    let ok = true;
    await act(async () => {
      discardDeferred.reject(new DataSourceError("Falha ao descartar."));
      ok = await discardPromise;
    });
    expect(ok).toBe(false);
    expect(hook.current[0].drafts).toHaveLength(1);
    expect(hook.current[0].discardError).toBe("Falha ao descartar.");
  });

  it("useNegotiationChatViewModel: exibe mensagem na hora, substitui sem duplicar no Realtime e reverte em erro", async () => {
    const sendDeferred = createDeferred<NegotiationMessage>();
    let onRealtimeMessage: ((msg: NegotiationMessage) => void) | null = null;
    const useCases: NegotiationChatUseCases = {
      getMessages: jest.fn().mockResolvedValue([]),
      sendMessage: jest.fn().mockReturnValue(sendDeferred.promise),
      subscribeToMessages: jest.fn((_reqId, cb) => {
        onRealtimeMessage = cb;
        return jest.fn();
      }),
    };

    const hook = await mountHook(() => useNegotiationChatViewModel("req-1", "user-1", useCases));

    await act(async () => {
      hook.current[1].setInputText("Combinado às 15h!");
    });

    let sendPromise!: Promise<boolean>;
    await act(async () => {
      sendPromise = hook.current[1].sendMessage();
    });

    // Mensagem já aparece imediatamente e campo limpa na hora
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].messages[0]?.content).toBe("Combinado às 15h!");
    expect(hook.current[0].inputText).toBe("");

    // Realtime entrega a mensagem confirmada antes da resposta HTTP (sem duplicar)
    const confirmed: NegotiationMessage = {
      id: "msg-server-1",
      requestId: "req-1",
      senderId: "user-1",
      content: "Combinado às 15h!",
      createdAt: "2026-11-25T15:00:00.000Z",
    };
    await act(async () => {
      onRealtimeMessage?.(confirmed);
    });
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].messages[0]?.id).toBe("msg-server-1");

    await act(async () => {
      sendDeferred.resolve(confirmed);
      await sendPromise;
    });
    expect(hook.current[0].messages).toHaveLength(1);

    // Agora testa falha de envio: remove mensagem otimista e restaura texto
    const failDeferred = createDeferred<NegotiationMessage>();
    (useCases.sendMessage as jest.Mock).mockReturnValueOnce(failDeferred.promise);

    await act(async () => {
      hook.current[1].setInputText("Mensagem sem sinal");
    });
    let failPromise!: Promise<boolean>;
    await act(async () => {
      failPromise = hook.current[1].sendMessage();
    });
    expect(hook.current[0].messages).toHaveLength(2);
    expect(hook.current[0].inputText).toBe("");

    let ok = true;
    await act(async () => {
      failDeferred.reject(new DataSourceError("Sem internet."));
      ok = await failPromise;
    });
    expect(ok).toBe(false);
    expect(hook.current[0].messages).toHaveLength(1);
    expect(hook.current[0].inputText).toBe("Mensagem sem sinal");
    expect(hook.current[0].sendError).toBe("Sem internet.");
  });

  it("useBlockedUsersViewModel: remove bloqueado imediatamente e restaura se o banco falhar", async () => {
    const unblockDeferred = createDeferred<void>();
    const useCases: IBlockedUserUseCases = {
      listBlockedUsers: jest.fn().mockResolvedValue([SAMPLE_BLOCKED]),
      blockUser: jest.fn().mockResolvedValue(undefined),
      unblockUser: jest.fn().mockReturnValue(unblockDeferred.promise),
      isBlocked: jest.fn().mockResolvedValue(true),
    };

    const hook = await mountHook(() => useBlockedUsersViewModel("user-1", useCases));
    expect(hook.current[0].blockedUsers).toHaveLength(1);

    let unblockPromise!: Promise<boolean>;
    await act(async () => {
      unblockPromise = hook.current[1].unblockUser("user-2");
    });
    expect(hook.current[0].blockedUsers).toHaveLength(0);

    let ok = true;
    await act(async () => {
      unblockDeferred.reject(new DataSourceError("Falha ao desbloquear."));
      ok = await unblockPromise;
    });
    expect(ok).toBe(false);
    expect(hook.current[0].blockedUsers).toHaveLength(1);
    expect(hook.current[0].actionMessage).toBe("Falha ao desbloquear.");
  });
});
