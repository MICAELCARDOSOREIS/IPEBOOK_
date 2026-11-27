// @deno-types="npm:@types/web-push@3.6.4"
import webPush from "npm:web-push@3.6.7";
import { isApplePushEndpoint } from "./logic.ts";

export type WebPushDestination = { endpoint: string; p256dh: string; auth_secret: string };
export type WebPushCredentials = { subject: string; publicKey: string; privateKey: string };

export function getWebPushCredentials(): WebPushCredentials | null {
  const publicKey = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("WEB_PUSH_VAPID_PRIVATE_KEY");
  if (!publicKey || !privateKey) return null;
  return { subject: "mailto:contato@ipebook.app", publicKey, privateKey };
}

export async function sendWebPush(
  destination: WebPushDestination,
  credentials: WebPushCredentials,
): Promise<"sent" | "expired" | "failed"> {
  if (!isApplePushEndpoint(destination.endpoint)) return "expired";
  try {
    const request = webPush.generateRequestDetails({
      endpoint: destination.endpoint,
      keys: { p256dh: destination.p256dh, auth: destination.auth_secret },
    }, "{}", { vapidDetails: credentials, TTL: 3600, contentEncoding: "aes128gcm" });

    const response = await fetch(destination.endpoint, {
      method: "POST",
      headers: request.headers as Record<string, string>,
      body: request.body ? Uint8Array.from(request.body) : undefined,
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    await response.body?.cancel();
    if (response.status === 404 || response.status === 410) return "expired";
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
