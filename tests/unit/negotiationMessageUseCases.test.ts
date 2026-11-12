import { describe, it, expect, beforeEach } from "vitest";
import {
  getNegotiationMessages,
  sendNegotiationMessage,
  type MessageUseCaseContext,
} from "@/model/usecases/messageUseCases";
import { validateNegotiationMessage } from "@/model/validators/messageValidator";
import { MemoryMessageDataSource } from "@/infra/datasources/memoryMessageDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBlockedUserDataSource } from "@/infra/datasources/memoryBlockedUserDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";

describe("Mensagens e Chat da Negociação (Spec 061 / ADR 0044)", () => {
  let messageDataSource: MemoryMessageDataSource;
  let bookRequestDataSource: MemoryBookRequestDataSource;
  let bookDataSource: MemoryBookDataSource;
  let blockedUserDataSource: MemoryBlockedUserDataSource;
  let context: MessageUseCaseContext;

  const userOwner = "user-proprietario";
  const userRequester = "user-solicitante";
  const userThirdParty = "user-terceiro";

  const sampleBook: Book = {
    id: "livro-1",
    title: "O Quinze",
    author: "Rachel de Queiroz",
    ownerId: userOwner,
    condition: "good",
    modality: "sale",
    price: 25,
    city: "Piripiri",
    state: "PI",
    neighborhood: "Centro",
    status: "available",
  };

  const sampleRequestAccepted: BookRequest = {
    id: "pedido-1",
    listingId: "livro-1",
    requesterId: userRequester,
    status: "accepted",
  };

  const sampleRequestPending: BookRequest = {
    id: "pedido-2",
    listingId: "livro-1",
    requesterId: userRequester,
    status: "pending",
  };

  beforeEach(() => {
    messageDataSource = new MemoryMessageDataSource();
    bookRequestDataSource = new MemoryBookRequestDataSource([
      sampleRequestAccepted,
      sampleRequestPending,
    ]);
    bookDataSource = new MemoryBookDataSource([sampleBook]);
    blockedUserDataSource = new MemoryBlockedUserDataSource();

    context = {
      messageDataSource,
      bookRequestDataSource,
      bookDataSource,
      blockedUserDataSource,
    };
  });

  describe("Validador de Mensagens", () => {
    it("aceita mensagem válida e retorna texto sanitizado", () => {
      const res = validateNegotiationMessage("Olá! Chego em 10 minutos na Praça.");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.sanitizedContent).toBe("Olá! Chego em 10 minutos na Praça.");
      }
    });

    it("rejeita mensagem vazia ou só com espaços", () => {
      const res1 = validateNegotiationMessage("");
      expect(res1.success).toBe(false);

      const res2 = validateNegotiationMessage("    ");
      expect(res2.success).toBe(false);
    });

    it("rejeita mensagem acima de 1000 caracteres", () => {
      const longText = "a".repeat(1001);
      const res = validateNegotiationMessage(longText);
      expect(res.success).toBe(false);
    });

    it("sanitiza tags HTML e scripts maliciosos", () => {
      const res = validateNegotiationMessage("<script>alert('xss')</script>Olá!");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.sanitizedContent).not.toContain("<script>");
      }
    });
  });

  describe("Obter Histórico de Mensagens (getNegotiationMessages)", () => {
    it("permite que o solicitante e o proprietário consultem as mensagens", async () => {
      await messageDataSource.sendMessage({
        requestId: "pedido-1",
        senderId: userRequester,
        content: "Mensagem 1",
      });

      const msgsRequester = await getNegotiationMessages("pedido-1", userRequester, context);
      expect(msgsRequester).toHaveLength(1);
      expect(msgsRequester[0].content).toBe("Mensagem 1");

      const msgsOwner = await getNegotiationMessages("pedido-1", userOwner, context);
      expect(msgsOwner).toHaveLength(1);
      expect(msgsOwner[0].content).toBe("Mensagem 1");
    });

    it("rejeita consulta de mensagens por terceiro", async () => {
      await expect(
        getNegotiationMessages("pedido-1", userThirdParty, context)
      ).rejects.toThrow("Não autorizado a acessar as mensagens deste pedido.");
    });

    it("rejeita consulta em pedido que não está aceito", async () => {
      await expect(
        getNegotiationMessages("pedido-2", userRequester, context)
      ).rejects.toThrow("Apenas pedidos aceitos possuem canal de mensagens ativo.");
    });

    it("rejeita se o pedido não for encontrado", async () => {
      await expect(
        getNegotiationMessages("pedido-inexistente", userRequester, context)
      ).rejects.toThrow("Pedido não encontrado.");
    });
  });

  describe("Enviar Mensagem (sendNegotiationMessage)", () => {
    it("permite envio com sucesso pelo solicitante e persiste", async () => {
      const msg = await sendNegotiationMessage(
        {
          requestId: "pedido-1",
          senderId: userRequester,
          content: "Estou chegando de camisa azul.",
        },
        context
      );

      expect(msg.id).toBeDefined();
      expect(msg.content).toBe("Estou chegando de camisa azul.");
      expect(msg.senderId).toBe(userRequester);

      const all = await messageDataSource.getMessagesByRequestId("pedido-1");
      expect(all).toHaveLength(1);
    });

    it("permite envio com sucesso pelo proprietário do livro", async () => {
      const msg = await sendNegotiationMessage(
        {
          requestId: "pedido-1",
          senderId: userOwner,
          content: "Perfeito, estou te aguardando no banco próximo à fonte.",
        },
        context
      );

      expect(msg.senderId).toBe(userOwner);
    });

    it("rejeita envio se terceiro tentar postar mensagem", async () => {
      await expect(
        sendNegotiationMessage(
          {
            requestId: "pedido-1",
            senderId: userThirdParty,
            content: "Mensagem intromissiva",
          },
          context
        )
      ).rejects.toThrow("Não autorizado a enviar mensagens neste pedido.");
    });

    it("rejeita envio se a mensagem for vazia", async () => {
      await expect(
        sendNegotiationMessage(
          {
            requestId: "pedido-1",
            senderId: userRequester,
            content: "   ",
          },
          context
        )
      ).rejects.toThrow("A mensagem não pode ser vazia.");
    });

    it("rejeita envio se houver bloqueio mútuo ativo entre os participantes", async () => {
      // O proprietário bloqueou o solicitante
      await blockedUserDataSource.block(userOwner, userRequester);

      await expect(
        sendNegotiationMessage(
          {
            requestId: "pedido-1",
            senderId: userRequester,
            content: "Tentativa de envio",
          },
          context
        )
      ).rejects.toThrow("Não é possível enviar mensagens para um usuário bloqueado.");

      await expect(
        sendNegotiationMessage(
          {
            requestId: "pedido-1",
            senderId: userOwner,
            content: "Tentativa de envio",
          },
          context
        )
      ).rejects.toThrow("Não é possível enviar mensagens para um usuário bloqueado.");
    });
  });
});
