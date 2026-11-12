import { describe, expect, it } from "vitest";
import {
  buildPushMessage,
  channelOf,
  NOTIFICATION_CHANNEL,
  isExpoPushToken,
  isInvalidTokenTicket,
  isTypeMuted,
  parseRequestId,
  priorityOf,
  type StoredNotification,
} from "../../supabase/functions/enviar-push/logic";
import { NOTIFICATION_CHANNEL as APP_CHANNELS } from "@/model/entities/notification";

const aviso: StoredNotification = {
  id: "n1",
  user_id: "u1",
  title: "Convite para encontro",
  message: "Você recebeu um convite para Praça da Bandeira (Centro). Confirme na negociação.",
  type: "meeting_update",
  action_url: "/negociacao/3301dadb-0181-4b91-8266-2bd2f363f5f5",
};

describe("função enviar-push: lógica pura (Spec 096)", () => {
  it("CA5: a mensagem leva título, texto, canal do tipo e a rota do aviso (Spec 099)", () => {
    expect(buildPushMessage(aviso, "ExponentPushToken[abc123]")).toEqual({
      to: "ExponentPushToken[abc123]",
      title: "Convite para encontro",
      body: aviso.message,
      sound: "default",
      channelId: "reminders",
      priority: "high",
      collapseId: aviso.action_url,
      tag: aviso.action_url,
      threadId: aviso.action_url,
      data: { url: aviso.action_url, type: "meeting_update", notificationId: "n1" },
    });
  });

  it("aviso sem rota continua válido, com url nula e sem agrupamento", () => {
    const semRota = buildPushMessage({ ...aviso, action_url: null }, "ExpoPushToken[x]");
    expect(semRota.data.url).toBeNull();
    expect(semRota.collapseId).toBeUndefined();
    expect(semRota.tag).toBeUndefined();
    expect(semRota.threadId).toBeUndefined();
  });

  it("cada tipo cai no canal esperado (ADR 0075)", () => {
    expect(channelOf("request_received")).toBe("messages");
    expect(channelOf("request_accepted")).toBe("messages");
    expect(channelOf("meeting_update")).toBe("reminders");
    expect(channelOf("search_alert_match")).toBe("updates");
    expect(channelOf("safety_tip")).toBe("updates");
    expect(channelOf("desconhecido")).toBe("updates");
  });

  it("avisos da Spec 100: mensagem e recusa tocam como conversa; avaliação é novidade", () => {
    expect(channelOf("new_message")).toBe("messages");
    expect(channelOf("request_rejected")).toBe("messages");
    expect(channelOf("rating_received")).toBe("updates");
    expect(priorityOf("new_message")).toBe("high");
  });

  it("avisos da Spec 101: cancelamento toca como conversa; favorito é novidade", () => {
    expect(channelOf("request_cancelled")).toBe("messages");
    expect(channelOf("favorite_update")).toBe("updates");
  });

  it("servidor e app usam a mesma tabela de canais", () => {
    expect(NOTIFICATION_CHANNEL).toEqual(APP_CHANNELS);
  });

  it("so convoca para conversas e lembretes; novidades ficam em prioridade padrão", () => {
    expect(priorityOf("request_received")).toBe("high");
    expect(priorityOf("meeting_update")).toBe("high");
    expect(priorityOf("system")).toBe("default");
    expect(priorityOf("search_alert_match")).toBe("default");
  });

  it("reconhece o tipo desativado nas preferências (Spec 099)", () => {
    expect(isTypeMuted("system", ["system", "safety_tip"])).toBe(true);
    expect(isTypeMuted("request_received", ["system"])).toBe(false);
    // Ausente ou fora de formato = recebe tudo, como antes da Spec 099.
    expect(isTypeMuted("system", null)).toBe(false);
    expect(isTypeMuted("system", undefined)).toBe(false);
    expect(isTypeMuted("system", "system")).toBe(false);
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
