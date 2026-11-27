
import { act, fireEvent, render } from "@testing-library/react-native";
import { PERMISSION_PROMPT_COPY } from "@/view/components/PermissionPromptDialog";
import { PushRegistration } from "@/view/components/PushRegistration";

const mockRegistro = {
  calls: [] as Array<string | null>,
  permissionReady: [] as boolean[],
};
const mockAuth = {
  user: { id: "u1" } as { id: string } | null,
  actions: { refreshSession: jest.fn() },
};
const mockPrompt = {
  state: { status: "idle" as string, granted: true },
  actions: { refresh: jest.fn(), approve: jest.fn(), decline: jest.fn(), dismiss: jest.fn() },
};
jest.mock("@/viewmodel/usePushRegistration", () => ({
  usePushRegistration: (userId: string | null, _route: unknown, _svc: unknown, _prefs: unknown, ready: boolean) => {
    mockRegistro.calls.push(userId);
    mockRegistro.permissionReady.push(ready);
  },
}));
jest.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: () => [{ user: mockAuth.user, loading: false, error: null }, mockAuth.actions],
}));
jest.mock("@/viewmodel/usePermissionPromptViewModel", () => ({
  usePermissionPromptViewModel: () => [mockPrompt.state, mockPrompt.actions],
}));

describe("PushRegistration (Spec 096 e Spec 020)", () => {
  afterEach(() => {
    mockRegistro.calls.length = 0;
    mockRegistro.permissionReady.length = 0;
    mockAuth.user = { id: "u1" };
    mockAuth.actions.refreshSession.mockReset();
    mockPrompt.state = { status: "idle", granted: true };
    mockPrompt.actions.refresh.mockReset();
    mockPrompt.actions.approve.mockReset();
    mockPrompt.actions.decline.mockReset();
    mockPrompt.actions.dismiss.mockReset();
  });

  it("liga o push à conta logada e não desenha nada com a permissão concedida", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(screen.toJSON()).toBeNull();
    expect(mockRegistro.calls).toContain("u1");
  });

  it("passa nulo ao hook quando não há conta logada", async () => {
    mockAuth.user = null;
    await act(async () => {
      const screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
      expect(screen.toJSON()).toBeNull();
    });
    expect(mockRegistro.calls).toContain(null);
    expect(mockPrompt.actions.refresh).not.toHaveBeenCalled();
  });

  it("T005: relê a sessão ao navegar, então o aviso sai na mesma execução do login", async () => {
    mockAuth.user = null;
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/criar-conta" onOpenRoute={() => {}} />);
    });
    expect(mockAuth.actions.refreshSession).toHaveBeenCalledTimes(1);

    mockAuth.user = { id: "u2" };
    await act(async () => {
      screen.rerender(<PushRegistration pathname="/criar-conta" onOpenRoute={() => {}} />);
    });
    await act(async () => {
      screen.rerender(<PushRegistration pathname="/anunciar" onOpenRoute={() => {}} />);
    });
    expect(mockAuth.actions.refreshSession).toHaveBeenCalledTimes(1);
    expect(mockPrompt.actions.refresh).toHaveBeenCalled();
  });

  it("Spec 127: navegar reavalia a permissão, então conceder em outra tela libera o token na mesma execução", async () => {
    mockPrompt.state = { status: "idle", granted: false };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(mockPrompt.actions.refresh).toHaveBeenCalledTimes(1);
    expect(mockRegistro.permissionReady.at(-1)).toBe(false);

    mockPrompt.state = { status: "idle", granted: true };
    await act(async () => {
      screen.rerender(<PushRegistration pathname="/notificacoes" onOpenRoute={() => {}} />);
    });
    expect(mockPrompt.actions.refresh).toHaveBeenCalledTimes(2);
    expect(mockRegistro.permissionReady.at(-1)).toBe(true);
  });

  it("CA2: ao entrar na conta explica o motivo dos avisos antes do prompt nativo", async () => {
    mockPrompt.state = { status: "explain", granted: false };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(mockPrompt.actions.refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.allow));
    });
    expect(mockPrompt.actions.approve).toHaveBeenCalledTimes(1);
  });

  it("CA3: a recusa mostra o estado de avisos indisponíveis e fecha sem travar o app", async () => {
    mockPrompt.state = { status: "denied", granted: false };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<PushRegistration pathname="/" onOpenRoute={() => {}} />);
    });
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.deniedMessage)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.understood));
    });
    expect(mockPrompt.actions.dismiss).toHaveBeenCalledTimes(1);
  });
});
