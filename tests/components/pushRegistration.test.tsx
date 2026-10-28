import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { PushRegistration } from "@/view/components/PushRegistration";

const registro = vi.hoisted(() => ({ calls: [] as Array<string | null> }));
vi.mock("@/viewmodel/usePushRegistration", () => ({
  usePushRegistration: (userId: string | null) => { registro.calls.push(userId); },
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: { id: "u1" }, loading: false, error: null }, {}],
}));

describe("PushRegistration (Spec 096)", () => {
  it("liga o push à conta logada e não desenha nada", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<PushRegistration onOpenRoute={() => {}} />); });
    expect(screen.toJSON()).toBeNull();
    expect(registro.calls).toContain("u1");
  });
});
