import { createElement } from "react";
import { act, render } from "@testing-library/react-native";
import {
  negotiationMessageUseCases,
  messageDataSource,
  onboardingUseCases,
  localCacheUseCases,
  networkStatusDataSource,
  searchAlertUseCases,
  searchHistoryUseCases,
  favoriteUseCases,
  shareUseCases,
  bookUseCases,
  authUseCases,
  bookRequestUseCases,
  meetingUseCases,
  deliveryUseCases,
  reportUseCases,
  betaSignupUseCases,
  notificationUseCases,
  publicProfileUseCases,
  ratingUseCases,
  userDataExportUseCases,
  userPreferencesUseCases,
  blockedUserUseCases,
  errorReporter,
  logger,
  rateLimiter,
  fileDownloadService,
  pwaService,
  bookMetadataService,
  pushNotificationService,
  imagePickerService,
  storeReviewService,
  profilePhotoUseCases,
  listingPhotoUseCases,
  moderationUseCases,
  makeBetaSignupViewModel,
  makeChatWithUser,
  makeConversationsViewModel,
  makeProfileSafetyViewModel,
  makeStartErrorReporting,
} from "@/di/container";

describe("Container DI (Injeção de Dependências)", () => {
  it("exporta todos os useCases e serviços essenciais instanciados para o ambiente", () => {
    expect(onboardingUseCases).toBeDefined();
    expect(localCacheUseCases).toBeDefined();
    expect(networkStatusDataSource).toBeDefined();
    expect(searchAlertUseCases).toBeDefined();
    expect(searchHistoryUseCases).toBeDefined();
    expect(favoriteUseCases).toBeDefined();
    expect(shareUseCases).toBeDefined();
    expect(bookUseCases).toBeDefined();
    expect(authUseCases).toBeDefined();
    expect(bookRequestUseCases).toBeDefined();
    expect(meetingUseCases).toBeDefined();
    expect(deliveryUseCases).toBeDefined();
    expect(reportUseCases).toBeDefined();
    expect(betaSignupUseCases).toBeDefined();
    expect(notificationUseCases).toBeDefined();
    expect(publicProfileUseCases).toBeDefined();
    expect(ratingUseCases).toBeDefined();
    expect(userDataExportUseCases).toBeDefined();
    expect(userPreferencesUseCases).toBeDefined();
    expect(blockedUserUseCases).toBeDefined();
    expect(errorReporter).toBeDefined();
    expect(logger).toBeDefined();
    expect(rateLimiter).toBeDefined();
    expect(fileDownloadService).toBeDefined();
    expect(pwaService).toBeDefined();
    expect(bookMetadataService).toBeDefined();
    expect(pushNotificationService).toBeDefined();
    expect(imagePickerService).toBeDefined();
    expect(storeReviewService).toBeDefined();
    expect(profilePhotoUseCases).toBeDefined();
    expect(listingPhotoUseCases).toBeDefined();
    expect(moderationUseCases).toBeDefined();
  });

  describe("negotiationMessageUseCases — delegações e fallbacks", () => {
    it("subscribeToMessages retorna função de cancelamento e lida com fallback", () => {
      const unsubscribe = negotiationMessageUseCases.subscribeToMessages("req-1", () => {});
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();

      const originalSub = messageDataSource.subscribeToMessages;
      try {
        messageDataSource.subscribeToMessages = undefined as never;
        const fallbackUnsub = negotiationMessageUseCases.subscribeToMessages("req-1", () => {});
        expect(typeof fallbackUnsub).toBe("function");
        expect(() => fallbackUnsub()).not.toThrow();
      } finally {
        messageDataSource.subscribeToMessages = originalSub;
      }
    });

    it("subscribeToAllMessages retorna função de cancelamento e lida com fallback", () => {
      const unsubscribe = negotiationMessageUseCases.subscribeToAllMessages(() => {});
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();

      const originalSub = messageDataSource.subscribeToAllMessages;
      try {
        messageDataSource.subscribeToAllMessages = undefined as never;
        const fallbackUnsub = negotiationMessageUseCases.subscribeToAllMessages(() => {});
        expect(typeof fallbackUnsub).toBe("function");
        expect(() => fallbackUnsub()).not.toThrow();
      } finally {
        messageDataSource.subscribeToAllMessages = originalSub;
      }
    });

    it("hideConversation e listHiddenConversations delegam ou usam fallback vazio", async () => {
      await negotiationMessageUseCases.hideConversation("req-2", "user-1");
      const hidden = await negotiationMessageUseCases.listHiddenConversations("user-1");
      expect(typeof hidden).toBe("object");

      const originalHide = messageDataSource.hideConversation;
      const originalList = messageDataSource.listHiddenConversations;
      try {
        messageDataSource.hideConversation = undefined as never;
        messageDataSource.listHiddenConversations = undefined as never;

        await expect(negotiationMessageUseCases.hideConversation("req-3", "user-2")).resolves.toBeUndefined();
        const fallbackList = await negotiationMessageUseCases.listHiddenConversations("user-2");
        expect(fallbackList).toEqual({});
      } finally {
        messageDataSource.hideConversation = originalHide;
        messageDataSource.listHiddenConversations = originalList;
      }
    });

    it("getMessages e sendMessage delegam para as regras de negócio de mensagens", async () => {
      await expect(
        negotiationMessageUseCases.getMessages("req-nao-existe", "user-teste"),
      ).rejects.toThrow("Pedido não encontrado.");

      await expect(
        negotiationMessageUseCases.sendMessage({
          requestId: "req-nao-existe",
          senderId: "user-teste",
          content: "Olá",
        }),
      ).rejects.toThrow("Pedido não encontrado.");
    });
  });

  describe("fábricas de ViewModel e delegações padrão do container", () => {
    async function mountHook<T>(useHook: () => T) {
      let current!: T;
      function Probe() {
        current = useHook();
        return null;
      }
      let view!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        view = await render(createElement(Probe));
      });
      return {
        get current() {
          return current;
        },
        unmount: async () => {
          await act(async () => {
            view.unmount();
          });
        },
      };
    }

    it("instancia makeBetaSignupViewModel, makeChatWithUser, makeConversationsViewModel e makeProfileSafetyViewModel", async () => {
      expect(() => makeStartErrorReporting({ init: jest.fn(), captureException: jest.fn(), setUser: jest.fn() } as never)).not.toThrow();

      const betaHook = await mountHook(() => makeBetaSignupViewModel());
      expect(betaHook.current[0]).toBeDefined();
      await betaHook.unmount();

      const chatWithHook = await mountHook(() => makeChatWithUser("user-1", "user-2", jest.fn()));
      await act(async () => {
        await chatWithHook.current.start();
      });
      await chatWithHook.unmount();

      const convHook = await mountHook(() => makeConversationsViewModel("user-1"));
      await act(async () => {
        await convHook.current[1].reload();
        await convHook.current[1].deleteConversation("req-inexistente");
        await convHook.current[1].cancelRequest("req-inexistente");
      });
      await convHook.unmount();

      const safetyHook = await mountHook(() => makeProfileSafetyViewModel("user-1", "user-2"));
      await act(async () => {
        await safetyHook.current[1].loadListings();
        await safetyHook.current[1].block();
      });
      await safetyHook.unmount();
    });
  });
});
