import React from "react";
import { act, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PushRegistration } from "@/view/components/PushRegistration";

const registro = vi.hoisted(() => ({ calls: [] as Array<string | null> }));
const auth = vi.hoisted(() => ({ user: { id: "u1" } as { id: string } | null }));
vi.mock("@/viewmodel/usePushRegistration", () => ({
  usePushRegistration: (userId: string | null) => { registro.calls.push(userId); },
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: auth.user, loading: false, error: null }, {}],
}));

describe("PushRegistration (Spec 096)", () => {
  afterEach(() => {
    registro.calls.length = 0;
    auth.user = { id: "u1" };
  });

  it("liga o push à conta logada e não desenha nada", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<PushRegistration onOpenRoute={() => {}} />); });
    expect(screen.toJSON()).toBeNull();
    expect(registro.calls).toContain("u1");
  });

  it("passa nulo ao hook quando não há conta logada", async () => {
    auth.user = null;
    await act(async () => {
      const screen = await render(<PushRegistration onOpenRoute={() => {}} />);
      expect(screen.toJSON()).toBeNull();
    });
    expect(registro.calls).toContain(null);
  });
});
