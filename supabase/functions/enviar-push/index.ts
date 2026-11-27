// Edge Function `enviar-push` (Spec 096 / ADR 0071). Roda no Deno do Supabase.
// Recebe `{ id }` de um aviso novo, reivindica o envio e manda o push pelo serviço do Expo.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  PUSH_ACCEPTED_RESPONSE,
  PUSH_WEBHOOK_HEADER,
  buildPushMessage,
  isAuthorizedWebhookSecret,
  isExpoPushToken,
  isInvalidTokenTicket,
  isTypeMuted,
  parseRequestId,
  type PushTicket,
  type StoredNotification,
} from "./logic.ts";
import { getWebPushCredentials, sendWebPush } from "./webPush.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405, { erro: "Use POST." });

  // Spec 143 / A2: exige segredo dedicado de webhook em tempo constante antes de tocar no banco.
  const expectedSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  const providedSecret = request.headers.get(PUSH_WEBHOOK_HEADER);
  if (!isAuthorizedWebhookSecret(providedSecret, expectedSecret)) {
    return reply(401, { erro: "Não autorizado." });
  }

  const id = parseRequestId(await request.json().catch(() => null));
  if (!id) return reply(400, { erro: "Informe o id do aviso." });

  // A chave de serviço só existe aqui, no servidor (RN-06).
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // RN-03: só quem consegue marcar `pushed_at` envia; uma segunda chamada não acha nada.
  // Primeiro a pessoa: sem token válido ou com o tipo desativado, o aviso não consome o envio
  // (reavivar a preferência depois volta a funcionar para avisos ainda não enviados).
  const { data: claimed, error: claimError } = await admin
    .from("v2_notifications")
    .select("id,user_id,title,message,type,action_url")
    .eq("id", id)
    .is("pushed_at", null)
    .maybeSingle();
  if (claimError) return reply(500, { erro: "Falha interna ao processar aviso." });
  if (!claimed) return reply(200, { ...PUSH_ACCEPTED_RESPONSE });

  const notification = claimed as StoredNotification;
  const { data: preferences } = await admin
    .from("v2_user_preferences")
    .select("push_token,muted_types")
    .eq("user_id", notification.user_id)
    .maybeSingle();
  const token = preferences?.push_token;
  // Spec 099: a pessoa desativou este tipo de aviso — o push não sai, mas o aviso segue no app.
  if (isTypeMuted(notification.type, preferences?.muted_types)) {
    return reply(200, { ...PUSH_ACCEPTED_RESPONSE });
  }

  const webCredentials = getWebPushCredentials();
  const { data: webSubscriptions } = webCredentials
    ? await admin.from("v2_web_push_subscriptions").select("endpoint,p256dh,auth_secret")
      .eq("user_id", notification.user_id).limit(10)
    : { data: null };
  if (!isExpoPushToken(token) && !webSubscriptions?.length) return reply(200, { ...PUSH_ACCEPTED_RESPONSE });

  // Reivindica o envio de forma atômica agora que há destino e permissão (RN-03).
  const { count } = await admin
    .from("v2_notifications")
    .update({ pushed_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id)
    .is("pushed_at", null);
  if (!count) return reply(200, { ...PUSH_ACCEPTED_RESPONSE });

  const sendNativePush = async (nativeToken: string) => {
    const { count: unreadCount, error: badgeError } = await admin
      .from("v2_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", notification.user_id)
      .eq("read", false);
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(buildPushMessage(notification, nativeToken, badgeError ? undefined : unreadCount ?? undefined)),
    }).catch(() => null);
    if (!response?.ok) return false;
    const ticket = ((await response.json().catch(() => null)) as { data?: PushTicket } | null)?.data;
    if (isInvalidTokenTicket(ticket)) {
      await admin.from("v2_user_preferences").update({ push_token: null })
        .eq("user_id", notification.user_id).eq("push_token", nativeToken);
    }
    return true;
  };

  const webSends = webCredentials ? (webSubscriptions ?? []).map(async (destination) => {
    const result = await sendWebPush(destination, webCredentials);
    if (result === "expired") {
      await admin.from("v2_web_push_subscriptions").delete().eq("endpoint", destination.endpoint)
        .eq("user_id", notification.user_id).eq("auth_secret", destination.auth_secret);
    }
    return result !== "failed";
  }) : [];
  const sends = isExpoPushToken(token) ? [sendNativePush(token), ...webSends] : webSends;
  const results = await Promise.allSettled(sends);
  if (!results.some((result) => result.status === "fulfilled" && result.value)) {
    return reply(502, { erro: "Serviço de push indisponível." });
  }
  return reply(200, { ...PUSH_ACCEPTED_RESPONSE });
});
