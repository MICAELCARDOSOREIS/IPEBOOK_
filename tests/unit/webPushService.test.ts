import { Platform } from "react-native";
import { WebPushService } from "@/infra/services/webPushService";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

const endpoint = "https://web.push.apple.com/inscricao";
const publicKey = "AAECAw";

function device(installed = true) {
  const subscription = {
    endpoint,
    unsubscribe: jest.fn().mockResolvedValue(true),
    toJSON: () => ({ keys: { p256dh: "chave", auth: "segredo" } }),
  };
  const pushManager = {
    getSubscription: jest.fn().mockResolvedValue(null),
    subscribe: jest.fn().mockResolvedValue(subscription),
  };
  stubGlobal("navigator", {
    standalone: installed,
    serviceWorker: { getRegistration: jest.fn().mockResolvedValue({ active: {}, pushManager }) },
  });
  stubGlobal("PushManager", class {});

  const upsert = jest.fn().mockResolvedValue({ error: null });
  const remove = jest.fn().mockResolvedValue({ error: null });
  const client = {
    from: () => ({ upsert, delete: () => ({ eq: remove }) }),
  } as unknown as SupabaseAppClient;
  return { subscription, pushManager, upsert, remove, service: new WebPushService(client, publicKey) };
}

describe("Avisos Web Push na Tela de Início", () => {
  const platform = Platform.OS;
  beforeEach(() => { Platform.OS = "web"; });
  afterEach(() => {
    Platform.OS = platform;
    unstubAllGlobals();
  });

  it("pede instalação no Safari e não chama a API de inscrição", async () => {
    const { service, pushManager } = device(false);
    await expect(service.status()).resolves.toBe("requires-install");
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it("registra a inscrição do dispositivo somente após a ação de ativar", async () => {
    const { service, pushManager, upsert } = device();
    await expect(service.status()).resolves.toBe("inactive");
    expect(pushManager.subscribe).not.toHaveBeenCalled();

    const pending = service.enable("u1");
    expect(pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true, applicationServerKey: new Uint8Array([0, 1, 2, 3]),
    });
    await pending;
    expect(upsert).toHaveBeenCalledWith({
      user_id: "u1", endpoint, p256dh: "chave", auth_secret: "segredo",
    }, { onConflict: "endpoint" });
  });

  it("cancela a inscrição local quando o servidor recusa gravá-la", async () => {
    const { service, subscription, upsert } = device();
    upsert.mockResolvedValue({ error: new Error("Recusado") });
    await service.status();
    await expect(service.enable("u1")).rejects.toThrow("Não foi possível salvar a inscrição");
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("remove a inscrição do navegador e da conta ao desativar", async () => {
    const { service, subscription, pushManager, remove } = device();
    pushManager.getSubscription.mockResolvedValue(subscription);
    await service.disable();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith("endpoint", endpoint);
  });
});
