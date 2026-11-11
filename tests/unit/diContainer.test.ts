import { describe, expect, it, vi } from "vitest";

import * as di from "@/di/container";

describe("DI Container (Injeção de dependências e use cases globais)", () => {
  it("exporta todas as instâncias fundamentais do container", () => {
    expect(di.bookUseCases).toBeDefined();
    expect(di.authUseCases).toBeDefined();
    expect(di.bookRequestUseCases).toBeDefined();
    expect(di.meetingUseCases).toBeDefined();
    expect(di.deliveryUseCases).toBeDefined();
    expect(di.reportUseCases).toBeDefined();
    expect(di.notificationUseCases).toBeDefined();
    expect(di.publicProfileUseCases).toBeDefined();
    expect(di.ratingUseCases).toBeDefined();
    expect(di.favoriteUseCases).toBeDefined();
    expect(di.shareUseCases).toBeDefined();
    expect(di.searchAlertUseCases).toBeDefined();
    expect(di.searchHistoryUseCases).toBeDefined();
    expect(di.onboardingUseCases).toBeDefined();
    expect(di.themePreferenceUseCases).toBeDefined();
    expect(di.localCacheUseCases).toBeDefined();
    expect(di.userDataExportUseCases).toBeDefined();
    expect(di.userPreferencesUseCases).toBeDefined();
    expect(di.blockedUserUseCases).toBeDefined();
    expect(di.profilePhotoUseCases).toBeDefined();
    expect(di.listingPhotoUseCases).toBeDefined();
    expect(di.moderationUseCases).toBeDefined();
    expect(di.betaSignupUseCases).toBeDefined();
    expect(di.appUpdateUseCases).toBeDefined();
    expect(di.logger).toBeDefined();
    expect(di.rateLimiter).toBeDefined();
    expect(di.fileDownloadService).toBeDefined();
    expect(di.pwaService).toBeDefined();
    expect(di.bookMetadataService).toBeDefined();
    expect(di.pushNotificationService).toBeDefined();
    expect(di.imagePickerService).toBeDefined();
    expect(di.storeReviewService).toBeDefined();
    expect(di.errorReporter).toBeDefined();
    expect(di.notificationsPermissionPromptUseCases).toBeDefined();
  });

  describe("negotiationMessageUseCases (branches de delegação e fallbacks)", () => {
    it("executa operações de mensagens através da fachada de negociação", async () => {
      const { negotiationMessageUseCases, messageDataSource } = di;

      // getMessages e sendMessage com validação de pedido
      await expect(
        negotiationMessageUseCases.getMessages("req_inexistente", "user_1"),
      ).rejects.toThrow("Pedido não encontrado.");

      await expect(
        negotiationMessageUseCases.sendMessage({
          requestId: "req_inexistente",
          senderId: "u1",
          text: "olá",
        } as never),
      ).rejects.toThrow("Pedido não encontrado.");

      // subscribeToMessages
      const listener = vi.fn();
      const unsub = negotiationMessageUseCases.subscribeToMessages("req_1", listener);
      expect(typeof unsub).toBe("function");
      unsub();

      // subscribeToAllMessages
      const unsubAll = negotiationMessageUseCases.subscribeToAllMessages(listener);
      expect(typeof unsubAll).toBe("function");
      unsubAll();

      // hideConversation
      await negotiationMessageUseCases.hideConversation("req_1", "user_1");

      // listHiddenConversations
      const hidden = await negotiationMessageUseCases.listHiddenConversations("user_1");
      expect(typeof hidden).toBe("object");

      // Fallbacks quando os métodos não existem no messageDataSource
      const originalSubscribe = messageDataSource.subscribeToMessages;
      const originalSubscribeAll = messageDataSource.subscribeToAllMessages;
      const originalHide = messageDataSource.hideConversation;
      const originalListHidden = messageDataSource.listHiddenConversations;

      messageDataSource.subscribeToMessages = undefined;
      messageDataSource.subscribeToAllMessages = undefined;
      messageDataSource.hideConversation = undefined;
      messageDataSource.listHiddenConversations = undefined;

      const fallbackUnsub = negotiationMessageUseCases.subscribeToMessages("req_1", listener);
      expect(typeof fallbackUnsub).toBe("function");
      fallbackUnsub();

      const fallbackUnsubAll = negotiationMessageUseCases.subscribeToAllMessages(listener);
      expect(typeof fallbackUnsubAll).toBe("function");
      fallbackUnsubAll();

      await negotiationMessageUseCases.hideConversation("req_1", "user_1");
      const fallbackHidden = await negotiationMessageUseCases.listHiddenConversations("user_1");
      expect(fallbackHidden).toEqual({});

      // Restaura
      messageDataSource.subscribeToMessages = originalSubscribe;
      messageDataSource.subscribeToAllMessages = originalSubscribeAll;
      messageDataSource.hideConversation = originalHide;
      messageDataSource.listHiddenConversations = originalListHidden;
    });
  });

  describe("notificationsPermissionPromptUseCases", () => {
    it("resolve e requisita permissões através do prompt da Spec 020", async () => {
      const prompt = di.notificationsPermissionPromptUseCases;
      const decision = await prompt.resolve();
      expect(["granted", "explain", "asked"]).toContain(decision);

      const requested = await prompt.request();
      expect(typeof requested).toBe("boolean");

      await prompt.markAsked();
    });
  });
});
