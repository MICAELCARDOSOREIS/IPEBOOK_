import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryPushNotificationService } from "@/infra/services/memoryPushNotificationService";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { internalRouteOf, usePushRegistration } from "@/viewmodel/usePushRegistration";

const mounted: ReactTestRenderer[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

function fakePreferences(current: { pushToken?: string | null } = {}) {
  return {
    getPreferences: vi.fn().mockResolvedValue({ userId: "u1", ...current }),
    updatePreferences: vi.fn().mockResolvedValue({ userId: "u1" }),
  } as unknown as IUserPreferencesUseCases & { updatePreferences: ReturnType<typeof vi.fn>; getPreferences: ReturnType<typeof vi.fn> };
}

async function mount(
  userId: string | null,
  push: MemoryPushNotificationService,
  preferences: IUserPreferencesUseCases,
  onOpenRoute: (route: string) => void = () => {},
) {
  function Probe({ id }: { id: string | null }) {
    usePushRegistration(id, onOpenRoute, push, preferences);
    return null;
  }
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(Probe, { id: userId }));
    mounted.push(renderer);
  });
  return renderer;
}

describe("usePushRegistration (Spec 096)", () => {
  it("CA1: depois do login grava o token do aparelho nas preferências", async () => {
    const preferences = fakePreferences();
    await mount("u1", new MemoryPushNotificationService(true, "ExponentPushToken[novo]"), preferences);
    expect(preferences.updatePreferences).toHaveBeenCalledTimes(1);
    expect(preferences.updatePreferences).toHaveBeenCalledWith("u1", { pushToken: "ExponentPushToken[novo]" });
  });

  it("CA1: não grava de novo quando o token já é o mesmo", async () => {
    const preferences = fakePreferences({ pushToken: "ExponentPushToken[igual]" });
    await mount("u1", new MemoryPushNotificationService(true, "ExponentPushToken[igual]"), preferences);
    expect(preferences.updatePreferences).not.toHaveBeenCalled();
  });

  it("CA2: sem permissão, sem token ou sem login, não grava nada", async () => {
    const semPermissao = fakePreferences();
    await mount("u1", new MemoryPushNotificationService(false), semPermissao);
    const semToken = fakePreferences();
    await mount("u1", new MemoryPushNotificationService(true, null), semToken);
    const semLogin = fakePreferences();
    await mount(null, new MemoryPushNotificationService(true, "ExponentPushToken[x]"), semLogin);
    for (const p of [semPermissao, semToken, semLogin]) expect(p.updatePreferences).not.toHaveBeenCalled();
    expect(semLogin.getPreferences).not.toHaveBeenCalled();
  });

  it("CA2: falha ao gravar não derruba o app", async () => {
    const preferences = fakePreferences();
    preferences.updatePreferences.mockRejectedValue(new Error("rede"));
    await expect(mount("u1", new MemoryPushNotificationService(true, "ExponentPushToken[x]"), preferences)).resolves.toBeDefined();
  });

  it("CA3: tocar na notificação abre a rota do aviso; endereço externo é ignorado", async () => {
    const push = new MemoryPushNotificationService(true);
    const abertas: string[] = [];
    await mount("u1", push, fakePreferences(), (route) => abertas.push(route));
    push.simulateOpened("/negociacao/3301dadb-0181-4b91-8266-2bd2f363f5f5");
    push.simulateOpened("https://site-malicioso.com");
    push.simulateOpened("//site-malicioso.com");
    push.simulateOpened(null);
    expect(abertas).toEqual(["/negociacao/3301dadb-0181-4b91-8266-2bd2f363f5f5"]);
  });

  it("para de escutar o toque quando a tela sai", async () => {
    const push = new MemoryPushNotificationService(true);
    const abertas: string[] = [];
    const renderer = await mount("u1", push, fakePreferences(), (route) => abertas.push(route));
    await act(async () => { renderer.unmount(); });
    push.simulateOpened("/negociacao/r1");
    expect(abertas).toEqual([]);
  });

  it("só aceita rotas internas simples", () => {
    expect(internalRouteOf("/negociacao/abc-123")).toBe("/negociacao/abc-123");
    expect(internalRouteOf("/pesquisa?bairro=Centro")).toBe("/pesquisa?bairro=Centro");
    for (const ruim of [null, "", "negociacao/1", "//x.com", "https://x.com", "/a b", "javascript:alert(1)"]) {
      expect(internalRouteOf(ruim)).toBeNull();
    }
  });
});
