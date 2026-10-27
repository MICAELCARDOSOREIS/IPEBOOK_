import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/view/listings/editListing", () => ({ default: () => null }));
vi.mock("@/view/search/manageAlert", () => ({ default: () => null }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import EditListingScreen from "@/view/listings/editListingScreen";
import ManageAlertScreen from "@/view/search/manageAlertScreen";

const noopActions = {} as ReturnType<typeof useAuthViewModel>[1];

function auth(user: { id: string; email: string } | null, loading = false) {
  vi.mocked(useAuthViewModel).mockReturnValue([{ user, loading, error: null }, noopActions]);
}

describe("telas-contêiner que dependem da sessão (Spec 092)", () => {
  it("Editar anúncio pede entrada só quando terminou de carregar e não há sessão", async () => {
    const onRequireSignIn = vi.fn();
    auth(null, true);
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).not.toHaveBeenCalled();
    auth(null);
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
    auth({ id: "u1", email: "a@b.c" });
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });

  it("Gerenciar alerta repassa a pessoa logada ou nulo", async () => {
    auth({ id: "u1", email: "a@b.c" });
    await act(async () => { await render(<ManageAlertScreen alertId="a1" onBack={() => {}} onEditAlert={() => {}} onAlertDeleted={() => {}} />); });
    auth(null);
    await act(async () => { await render(<ManageAlertScreen alertId="a1" onBack={() => {}} onEditAlert={() => {}} onAlertDeleted={() => {}} />); });
  });
});
