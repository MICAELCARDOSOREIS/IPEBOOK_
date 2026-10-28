import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UserPreferences } from "@/model/entities/userPreferences";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { useNotificationPreferencesViewModel } from "@/viewmodel/useNotificationPreferencesViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

type HookResult = ReturnType<typeof useNotificationPreferencesViewModel>;

async function renderHook(
  userId: string | null,
  useCases: IUserPreferencesUseCases,
): Promise<{ get current(): HookResult }> {
  let result!: HookResult;
  function HookProbe() {
    result = useNotificationPreferencesViewModel(userId, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

function stubPreferences(prefs: Partial<UserPreferences>): IUserPreferencesUseCases {
  return {
    getPreferences: vi.fn().mockResolvedValue({ userId: "ana", ...prefs }),
    updatePreferences: vi.fn().mockResolvedValue({ userId: "ana", ...prefs }),
  };
}

describe("useNotificationPreferencesViewModel (Spec 099)", () => {
  it("sem preferências gravadas mostra tudo ligado", async () => {
    const hook = await renderHook("ana", stubPreferences({}));
    expect(hook.current[0].enabled).toEqual({
      proposals: true,
      meetings: true,
      searchAlerts: true,
      system: true,
    });
  });

  it("reflete o tipo desativado na categoria correta", async () => {
    const hook = await renderHook("ana", stubPreferences({ mutedTypes: ["system"] }));
    expect(hook.current[0].enabled.system).toBe(false);
    // proposals segue ligado: "system" não pertence a essa categoria.
    expect(hook.current[0].enabled.proposals).toBe(true);
  });

  it("desligar uma categoria grava todos os tipos dela em mutedTypes", async () => {
    const useCases = stubPreferences({});
    const hook = await renderHook("ana", useCases);
    await act(async () => {
      await hook.current[1].setEnabled("proposals", false);
    });
    expect(useCases.updatePreferences).toHaveBeenCalledWith("ana", {
      mutedTypes: ["request_received", "request_accepted", "request_rejected", "request_cancelled", "new_message"],
    });
  });

  it("religar remove só os tipos daquela categoria, preservando as demais", async () => {
    const useCases = stubPreferences({ mutedTypes: ["meeting_update", "system", "safety_tip"] });
    const hook = await renderHook("ana", useCases);
    await act(async () => {
      await hook.current[1].setEnabled("system", true);
    });
    const [, edits] = vi.mocked(useCases.updatePreferences).mock.calls[0];
    expect(new Set(edits.mutedTypes)).toEqual(new Set(["meeting_update"]));
  });

  it("mostra erro amigável quando salvar a preferência falha (Spec 099)", async () => {
    const useCases = stubPreferences({});
    vi.mocked(useCases.updatePreferences).mockRejectedValueOnce(new Error("rede caiu"));
    const hook = await renderHook("ana", useCases);
    await act(async () => {
      await hook.current[1].setEnabled("meetings", false);
    });
    expect(hook.current[0].error).toBe("Não foi possível salvar suas preferências de notificação.");
  });
});
