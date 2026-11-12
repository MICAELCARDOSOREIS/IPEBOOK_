import { describe, expect, it } from "vitest";
import { resolveNotificationRoute } from "@/viewmodel/notificationRoute";

describe("resolveNotificationRoute", () => {
  it("normaliza actionUrl existente garantindo barra inicial", () => {
    expect(
      resolveNotificationRoute({
        type: "request_received",
        actionUrl: "pedidos-recebidos",
      }),
    ).toBe("/pedidos-recebidos");

    expect(
      resolveNotificationRoute({
        type: "system",
        actionUrl: "/livro/123",
      }),
    ).toBe("/livro/123");
  });

  it("resolve rota padrão por tipo quando actionUrl não está presente", () => {
    expect(resolveNotificationRoute({ type: "request_received" })).toBe("/pedidos-recebidos");
    expect(resolveNotificationRoute({ type: "request_accepted" })).toBe("/meus-pedidos");
    expect(resolveNotificationRoute({ type: "request_rejected" })).toBe("/meus-pedidos");
    expect(resolveNotificationRoute({ type: "request_cancelled" })).toBe("/meus-pedidos");
    expect(resolveNotificationRoute({ type: "meeting_update" })).toBe("/meus-pedidos");
    expect(resolveNotificationRoute({ type: "new_message" })).toBe("/conversas");
    expect(resolveNotificationRoute({ type: "rating_received" })).toBe("/perfil");
    expect(resolveNotificationRoute({ type: "favorite_update" })).toBe("/favoritos");
    expect(resolveNotificationRoute({ type: "search_alert_match" })).toBe("/pesquisa");
    expect(resolveNotificationRoute({ type: "safety_tip" })).toBe("/ajuda");
    expect(resolveNotificationRoute({ type: "system" })).toBe("/ajuda");
  });
});
