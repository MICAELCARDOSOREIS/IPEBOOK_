import { describe, expect, it } from "vitest";
import {
  buildPushMessage,
  isExpoPushToken,
  isInvalidTokenTicket,
  parseRequestId,
  type StoredNotification,
} from "../../supabase/functions/enviar-push/logic";

const aviso: StoredNotification = {
  id: "n1",
  user_id: "u1",
  title: "Convite para encontro",
  message: "Você recebeu um convite para Praça da Bandeira (Centro). Confirme na negociação.",
  type: "meeting_update",
  action_url: "/negociacao/3301dadb-0181-4b91-8266-2bd2f363f5f5",
};

describe("função enviar-push: lógica pura (Spec 096)", () => {
  it("CA5: a mensagem leva título, texto e a rota do aviso", () => {
    expect(buildPushMessage(aviso, "ExponentPushToken[abc123]")).toEqual({
      to: "ExponentPushToken[abc123]",
      title: "Convite para encontro",
      body: aviso.message,
      sound: "default",
      channelId: "default",
      priority: "high",
      data: { url: aviso.action_url, type: "meeting_update", notificationId: "n1" },
    });
  });

  it("aviso sem rota continua válido, com url nula", () => {
    expect(buildPushMessage({ ...aviso, action_url: null }, "ExpoPushToken[x]").data.url).toBeNull();
  });

  it("só aceita token no formato do Expo", () => {
    expect(isExpoPushToken("ExponentPushToken[abc123]")).toBe(true);
    expect(isExpoPushToken("ExpoPushToken[abc123]")).toBe(true);
    for (const ruim of ["", "abc", "ExponentPushToken[]", "ExponentPushToken[a b]", null, undefined, 42]) {
      expect(isExpoPushToken(ruim)).toBe(false);
    }
  });

  it("CA6: reconhece só o erro de aparelho não registrado como token inválido", () => {
    expect(isInvalidTokenTicket({ status: "error", details: { error: "DeviceNotRegistered" } })).toBe(true);
    expect(isInvalidTokenTicket({ status: "error", details: { error: "MessageRateExceeded" } })).toBe(false);
    expect(isInvalidTokenTicket({ status: "ok" })).toBe(false);
    expect(isInvalidTokenTicket(undefined)).toBe(false);
  });

  it("lê o id do corpo e recusa o que não for texto simples", () => {
    expect(parseRequestId({ id: " n1 " })).toBe("n1");
    for (const ruim of [null, undefined, "n1", 3, {}, { id: 5 }, { id: "  " }, { id: "x".repeat(65) }]) {
      expect(parseRequestId(ruim)).toBeNull();
    }
  });
});
