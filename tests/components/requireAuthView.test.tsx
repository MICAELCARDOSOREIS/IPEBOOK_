import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/model/entities/user";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

import { RequireAuth } from "@/view/components/RequireAuth";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedAuth = vi.mocked(useAuthViewModel);

function mockAuth(user: User | null, loading = false) {
  mockedAuth.mockReturnValue([
    { user, loading, error: null },
    {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
    },
  ]);
}

describe("RequireAuth: catálogo só para pessoa conectada (Spec 092)", () => {
  it("redireciona e não renderiza o conteúdo sem sessão", async () => {
    mockAuth(null);
    const onRequireSignIn = vi.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("catálogo")).toBeNull();
  });

  it("não renderiza nem redireciona enquanto a sessão é verificada", async () => {
    mockAuth(null, true);
    const onRequireSignIn = vi.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.queryByText("catálogo")).toBeNull();
  });

  it("renderiza o conteúdo com sessão ativa, sem redirecionar", async () => {
    mockAuth({ id: "ana", name: "Ana", email: "ana@exemplo.com" } as User);
    const onRequireSignIn = vi.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.getByText("catálogo")).toBeTruthy();
  });
});
