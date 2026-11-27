
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import { InviteFriends } from "@/view/profile/inviteFriends";
import type { InviteFriendsState, InviteFriendsActions } from "@/viewmodel/useInviteFriendsViewModel";

jest.mock("@/viewmodel/useInviteFriendsViewModel", () => ({
  useInviteFriendsViewModel: jest.fn(),
}));
jest.mock("react-native-view-shot", () => ({ captureRef: jest.fn().mockResolvedValue("file:///tmp/convite.png") }));

import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
const mockedUseInviteFriendsViewModel = jest.mocked(useInviteFriendsViewModel);

function mockViewModel(
  state: Partial<InviteFriendsState> = {},
  actions: Partial<InviteFriendsActions> = {},
) {
  const fullState: InviteFriendsState = {
    sharing: false,
    linkCopied: false,
    shared: false,
    error: null,
    inviteMessage: "Oi! Participe do IpêBook em Piripiri: https://ipebook.app",
    inviteUrl: "https://ipebook.app",
    ...state,
  };
  const fullActions: InviteFriendsActions = {
    shareImage: jest.fn().mockResolvedValue(undefined),
    shareToWhatsApp: jest.fn().mockResolvedValue(undefined),
    shareNative: jest.fn().mockResolvedValue(undefined),
    copyLink: jest.fn().mockResolvedValue(undefined),
    dismissLinkCopied: jest.fn(),
    dismissShared: jest.fn(),
    ...actions,
  };
  mockedUseInviteFriendsViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("InviteFriends — Convidar amigos (Figma 08.02, Spec 057)", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    cleanup();
    Platform.OS = originalPlatform;
  });

  it("abre o compartilhamento apenas do texto ao tocar na opção do iOS", async () => {
    Platform.OS = "ios";
    const actions = mockViewModel();
    const screen = await render(<InviteFriends />);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Compartilhar texto" }));
    });

    expect(actions.shareNative).toHaveBeenCalledTimes(1);
    expect(actions.shareImage).not.toHaveBeenCalled();
  });

  it("renderiza cabeçalho, manchete e orientação de link", async () => {
    mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    expect(screen.getByText("Convidar amigos")).toBeDefined();
    expect(screen.getByText("Livros ganham vida quando são lidos.")).toBeDefined();
    expect(screen.getByText("O link vai junto na mensagem.")).toBeDefined();
  });

  it("exibe aviso acessível quando o link foi copiado", async () => {
    mockViewModel({ linkCopied: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    expect(
      screen.getByText("Link copiado para a área de transferência!"),
    ).toBeDefined();
  });

  it("confirma quando a folha de compartilhamento foi aberta", async () => {
    mockViewModel({ shared: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    expect(screen.getByText("Convite pronto. Escolha o app para enviar.")).toBeDefined();
  });

  it("chama onBack ao acionar o botão de voltar", async () => {
    mockViewModel();
    const onBack = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends onBack={onBack} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("aciona o compartilhamento de imagem e texto no Android (Spec 092)", async () => {
    Platform.OS = "android";
    const actions = mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });
    expect(screen.getByLabelText("Convite para o IpêBook em Piripiri. Acesse ipebook.app")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Compartilhar o convite com imagem e texto"));
    });
    expect(actions.shareImage).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Enviar convite pelo WhatsApp")).toBeNull();
    expect(screen.queryByLabelText("Mais opções de compartilhamento")).toBeNull();
    expect(screen.queryByLabelText("Copiar link do aplicativo")).toBeNull();
    expect(screen.queryByRole("button", { name: "Compartilhar texto" })).toBeNull();
    expect(screen.getByText("O link vai junto na mensagem.")).toBeDefined();
    const capture = jest.mocked(actions.shareImage).mock.calls[0][0];
    await expect(capture()).resolves.toBe("file:///tmp/convite.png");
  });
});
