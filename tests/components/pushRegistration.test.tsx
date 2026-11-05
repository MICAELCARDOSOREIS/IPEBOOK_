
import { act, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PERMISSION_PROMPT_COPY } from "@/view/components/PermissionPromptDialog";
import { PushRegistration } from "@/view/components/PushRegistration";

const registro = vi.hoisted(() => ({ calls: [] as Array<string | null> }));
const auth = vi.hoisted(() => ({
  user: { id: "u1" } as { id: string } | null,
  actions: { refreshSession: vi.fn() },
}));
const prompt = vi.hoisted(() => ({
  state: { status: "idle" as string, granted: true },
  actions: { refresh: vi.fn(), approve: vi.fn(), decline: vi.fn(), dismiss: vi.fn() },
}));
vi.mock("@/viewmodel/usePushRegistration", () => ({
  usePushRegistration: (userId: string | null) => {
    registro.calls.push(userId);
  },
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: auth.user, loading: false, error: null }, auth.actions],
}));
vi.mock("@/viewmodel/usePermissionPromptViewModel", () => ({
  usePermissionPromptViewModel: () => [prompt.state, prompt.actions],
}));

describe("PushRegistration (Spec 096 e Spec 020)", () => {
  afterEach(() => {
    registro.calls.length = 0;
    auth.user = { id: "u1" };
    auth.actions.refreshSession.mockReset();
    prompt.state = { status: "idle", granted: true };
    prompt.actions.refresh.mockReset();
    prompt.actions.approve.mockReset();
    prompt.actions.decline.mockReset();
    prompt.actions.dismiss.mockReset();
  });

  it("liga o push à conta logada e não desenha nada com a permissão concedida", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(screen.toJSON()).toBeNull();
    expect(registro.calls).toContain("u1");
  });

  it("passa nulo ao hook quando não há conta logada", async () => {
    auth.user = null;
    await act(async () => {
      const screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
      expect(screen.toJSON()).toBeNull();
    });
    expect(registro.calls).toContain(null);
    expect(prompt.actions.refresh).not.toHaveBeenCalled();
  });

  it("T005: relê a sessão ao navegar, então o aviso sai na mesma execução do login", async () => {
    auth.user = null;
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/criar-conta" onOpenRoute={() => {}} />);
    });
    expect(auth.actions.refreshSession).toHaveBeenCalledTimes(1);

    auth.user = { id: "u2" };
    await act(async () => {
      screen.rerender(<PushRegistration pathname="/criar-conta" onOpenRoute={() => {}} />);
    });
    await act(async () => {
      screen.rerender(<PushRegistration pathname="/anunciar" onOpenRoute={() => {}} />);
    });
    expect(auth.actions.refreshSession).toHaveBeenCalledTimes(1);
    expect(prompt.actions.refresh).toHaveBeenCalled();
  });

  it("CA2: ao entrar na conta explica o motivo dos avisos antes do prompt nativo", async () => {
    prompt.state = { status: "explain", granted: false };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(prompt.actions.refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.allow));
    });
    expect(prompt.actions.approve).toHaveBeenCalledTimes(1);
  });

  it("CA3: a recusa mostra o estado de avisos indisponíveis e fecha sem travar o app", async () => {
    prompt.state = { status: "denied", granted: false };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.deniedMessage)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.understood));
    });
    expect(prompt.actions.dismiss).toHaveBeenCalledTimes(1);
  });
});
