import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { useBlockedUsersViewModel } from "@/viewmodel/useBlockedUsersViewModel";
import type { IBlockedUserUseCases } from "@/usecase/iBlockedUserUseCases";
import type { BlockedUser } from "@/model/entities/blockedUser";
import { DomainError } from "@/model/errors";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(sessionUserId: string | null, useCases: IBlockedUserUseCases) {
  let result!: ReturnType<typeof useBlockedUsersViewModel>;
  function HookProbe() {
    result = useBlockedUsersViewModel(sessionUserId, useCases);
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

function createMockUseCases(initialList: BlockedUser[] = []): IBlockedUserUseCases {
  let list = [...initialList];
  return {
    listBlockedUsers: async () => list,
    blockUser: async () => {},
    unblockUser: async (_session, target) => {
      list = list.filter((u) => u.userId !== target);
    },
    isBlocked: async () => false,
  };
}

describe("useBlockedUsersViewModel (Spec 056 / ADR 0039)", () => {
  it("carrega lista de bloqueados com sucesso quando autenticado", async () => {
    const mockList: BlockedUser[] = [
      { userId: "user-1", name: "Carlos", blockedAt: "2026-10-20T10:00:00Z" },
    ];
    const useCases = createMockUseCases(mockList);

    const hook = await renderHook("my-user-id", useCases);

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].blockedUsers).toHaveLength(1);
    expect(hook.current[0].blockedUsers[0].name).toBe("Carlos");
  });

  it("define erro ao tentar carregar sem sessão", async () => {
    const useCases = createMockUseCases();
    const hook = await renderHook(null, useCases);

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBe(
      "Sessão necessária para acessar pessoas bloqueadas.",
    );
  });

  it("desbloqueia usuário e atualiza lista com mensagem de sucesso", async () => {
    const mockList: BlockedUser[] = [
      { userId: "user-1", name: "Carlos", blockedAt: "2026-10-20T10:00:00Z" },
    ];
    const useCases = createMockUseCases(mockList);

    const hook = await renderHook("my-user-id", useCases);
    expect(hook.current[0].blockedUsers).toHaveLength(1);

    let success = false;
    await act(async () => {
      success = await hook.current[1].unblockUser("user-1");
    });

    expect(success).toBe(true);
    expect(hook.current[0].blockedUsers).toHaveLength(0);
    expect(hook.current[0].actionMessage).toBe("Pessoa desbloqueada com sucesso.");

    act(() => {
      hook.current[1].clearActionMessage();
    });
    expect(hook.current[0].actionMessage).toBeNull();
  });

  it("captura mensagem de erro amigável ao falhar o desbloqueio", async () => {
    const useCases: IBlockedUserUseCases = {
      listBlockedUsers: async () => [{ userId: "user-1", name: "Carlos", blockedAt: "2026" }],
      blockUser: async () => {},
      unblockUser: async () => {
        throw new DomainError("Falha de conexão ao desbloquear.");
      },
      isBlocked: async () => false,
    };

    const hook = await renderHook("my-user-id", useCases);

    let success = true;
    await act(async () => {
      success = await hook.current[1].unblockUser("user-1");
    });

    expect(success).toBe(false);
    expect(hook.current[0].error).toBe("Falha de conexão ao desbloquear.");
  });
});
