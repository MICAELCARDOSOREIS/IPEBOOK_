import { describe, expect, it } from "vitest";
import { BlockedUserUseCases } from "@/usecase/blockedUserUseCases";
import { MemoryBlockedUserDataSource } from "@/infra/datasources/memoryBlockedUserDataSource";
import { AuthError, ValidationError } from "@/model/errors";

describe("BlockedUserUseCases (Spec 056 / ADR 0039)", () => {
  it("exige sessão autenticada para listar bloqueados", async () => {
    const ds = new MemoryBlockedUserDataSource();
    const uc = new BlockedUserUseCases(ds);

    await expect(uc.listBlockedUsers(null)).rejects.toThrow(AuthError);
  });

  it("exige sessão autenticada para bloquear ou desbloquear", async () => {
    const ds = new MemoryBlockedUserDataSource();
    const uc = new BlockedUserUseCases(ds);

    await expect(uc.blockUser(null, "user-2")).rejects.toThrow(AuthError);
    await expect(uc.unblockUser(null, "user-2")).rejects.toThrow(AuthError);
  });

  it("impede auto-bloqueio lançando ValidationError", async () => {
    const ds = new MemoryBlockedUserDataSource();
    const uc = new BlockedUserUseCases(ds);

    await expect(uc.blockUser("user-1", "user-1")).rejects.toThrow(ValidationError);
  });

  it("bloqueia, lista e desbloqueia com sucesso", async () => {
    const ds = new MemoryBlockedUserDataSource();
    const uc = new BlockedUserUseCases(ds);

    await uc.blockUser("user-1", "user-2");
    const list = await uc.listBlockedUsers("user-1");
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe("user-2");

    expect(await uc.isBlocked("user-1", "user-2")).toBe(true);
    expect(await uc.isBlocked("user-2", "user-1")).toBe(true);
    expect(await uc.isBlocked("user-1", "user-3")).toBe(false);

    await uc.unblockUser("user-1", "user-2");
    const emptyList = await uc.listBlockedUsers("user-1");
    expect(emptyList).toHaveLength(0);
    expect(await uc.isBlocked("user-1", "user-2")).toBe(false);
  });
});
