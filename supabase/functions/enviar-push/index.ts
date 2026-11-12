// Edge Function `enviar-push` (Spec 096 / ADR 0071). Roda no Deno do Supabase.
// Recebe `{ id }` de um aviso novo, reivindica o envio e manda o push pelo serviço do Expo.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  buildPushMessage,
  isExpoPushToken,
  isInvalidTokenTicket,
  isTypeMuted,
  parseRequestId,
  type PushTicket,
  type StoredNotification,
} from "./logic.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405, { erro: "Use POST." });

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
  if (claimError) return reply(500, { erro: "Não foi possível ler o aviso." });
  if (!claimed) return reply(200, { enviado: false, motivo: "aviso inexistente ou já enviado" });

  const notification = claimed as StoredNotification;
  const { data: preferences } = await admin
    .from("v2_user_preferences")
    .select("push_token,muted_types")
    .eq("user_id", notification.user_id)
    .maybeSingle();
  const token = preferences?.push_token;
  if (!isExpoPushToken(token)) return reply(200, { enviado: false, motivo: "pessoa sem token de push" });
  // Spec 099: a pessoa desativou este tipo de aviso — o push não sai, mas o aviso segue no app.
  if (isTypeMuted(notification.type, preferences?.muted_types)) {
    return reply(200, { enviado: false, motivo: "tipo de aviso desativado" });
  }

  // Reivindica o envio de forma atômica agora que há destino e permissão (RN-03).
  const { count } = await admin
    .from("v2_notifications")
    .update({ pushed_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id)
    .is("pushed_at", null);
  if (!count) return reply(200, { enviado: false, motivo: "envio reivindicado por outra chamada" });

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(buildPushMessage(notification, token)),
  }).catch(() => null);
  if (!response?.ok) return reply(502, { enviado: false, motivo: "serviço de push indisponível" });

  const ticket = ((await response.json().catch(() => null)) as { data?: PushTicket } | null)?.data;
  if (isInvalidTokenTicket(ticket)) {
    // RN-04: o aparelho não existe mais.
    await admin.from("v2_user_preferences").update({ push_token: null }).eq("user_id", notification.user_id);
    return reply(200, { enviado: false, motivo: "token inválido removido" });
  }
  return reply(200, { enviado: ticket?.status === "ok" });
});
