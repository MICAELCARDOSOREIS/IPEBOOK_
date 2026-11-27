import { Platform } from "react-native";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { DomainError } from "@/model/errors";
import type { IWebPushService, WebPushStatus } from "@/model/services/iWebPushService";

const TABLE = "v2_web_push_subscriptions";

export class WebPushService implements IWebPushService {
  private manager?: PushManager;
  private pending?: Promise<void>;

  constructor(private readonly client: SupabaseAppClient, private readonly publicKey?: string) {}

  async status(): Promise<WebPushStatus> {
    if (!this.publicKey || Platform.OS !== "web" || typeof navigator === "undefined") return "unavailable";
    if (!("standalone" in navigator) || !navigator.serviceWorker) return "unavailable";
    if (!navigator.standalone) return "requires-install";
    if (typeof PushManager !== "function") return "unavailable";
    const registration = await navigator.serviceWorker.getRegistration();
    this.manager = registration?.active ? registration.pushManager : undefined;
    const subscription = await this.manager?.getSubscription();
    if (!this.manager) return "unavailable";
    if (!subscription) return "inactive";
    const { data, error } = await this.client.from(TABLE).select("endpoint")
      .eq("endpoint", subscription.endpoint).maybeSingle();
    if (error) throw new DomainError("Não foi possível consultar os avisos deste dispositivo.");
    return data ? "active" : "inactive";
  }

  async enable(userId: string): Promise<void> {
    if (!this.manager || !this.publicKey) throw new DomainError("Avisos indisponíveis neste dispositivo.");
    if (this.pending) return this.pending;
    this.pending = this.subscribe(this.manager, this.publicKey, userId);
    try {
      await this.pending;
    } finally {
      this.pending = undefined;
    }
  }

  private async subscribe(manager: PushManager, publicKey: string, userId: string): Promise<void> {
    // O Safari exige que subscribe seja chamado diretamente durante o toque.
    let subscription: PushSubscription;
    try {
      const key = Uint8Array.from(atob(publicKey.replaceAll("-", "+").replaceAll("_", "/")), (character) =>
        character.charCodeAt(0));
      subscription = await manager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        throw new DomainError("Permita avisos do IpêBook nos Ajustes de notificações do iPhone e tente novamente.");
      }
      throw new DomainError("Não foi possível ativar os avisos deste dispositivo.");
    }
    const { keys } = subscription.toJSON();
    const { error } = await this.client.from(TABLE).upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: keys?.p256dh,
      auth_secret: keys?.auth,
    }, { onConflict: "endpoint" });
    if (error) {
      await subscription.unsubscribe().catch(() => false);
      throw new DomainError("Não foi possível salvar a inscrição. Tente novamente.");
    }
  }

  async disable(): Promise<void> {
    if (Platform.OS !== "web" || typeof navigator === "undefined" || !navigator.serviceWorker) return;
    await this.pending?.catch(() => undefined);
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    if (!subscription) return;
    const [browser, server] = await Promise.allSettled([
      subscription.unsubscribe(),
      this.client.from(TABLE).delete().eq("endpoint", subscription.endpoint),
    ]);
    const deviceRemoved = browser.status === "fulfilled" && browser.value;
    const serverRemoved = server.status === "fulfilled" && !server.value.error;
    if (!deviceRemoved && !serverRemoved) throw new DomainError("Não foi possível desativar os avisos deste dispositivo.");
  }
}
