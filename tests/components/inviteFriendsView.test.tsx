import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InviteFriends } from "@/view/profile/inviteFriends";
import type { InviteFriendsState, InviteFriendsActions } from "@/viewmodel/useInviteFriendsViewModel";

vi.mock("@/viewmodel/useInviteFriendsViewModel", () => ({
  useInviteFriendsViewModel: vi.fn(),
}));
vi.mock("react-native-view-shot", () => ({ captureRef: vi.fn().mockResolvedValue("file:///tmp/convite.png") }));

import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
const mockedUseInviteFriendsViewModel = vi.mocked(useInviteFriendsViewModel);

function mockViewModel(
  state: Partial<InviteFriendsState> = {},
  actions: Partial<InviteFriendsActions> = {},
) {
  const fullState: InviteFriendsState = {
    sharing: false,
    linkCopied: false,
    error: null,
    inviteMessage: "Oi! Participe do IpêBook em Piripiri: https://ipebook.app",
    inviteUrl: "https://ipebook.app",
    ...state,
  };
  const fullActions: InviteFriendsActions = {
    shareImage: vi.fn().mockResolvedValue(undefined),
    shareToWhatsApp: vi.fn().mockResolvedValue(undefined),
    shareNative: vi.fn().mockResolvedValue(undefined),
    copyLink: vi.fn().mockResolvedValue(undefined),
    dismissLinkCopied: vi.fn(),
    ...actions,
  };
  mockedUseInviteFriendsViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

describe("InviteFriends — Convidar amigos (Figma 08.02, Spec 057)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza cabeçalho, manchete e prévia da mensagem", async () => {
    mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    expect(screen.getByText("Convidar amigos")).toBeDefined();
    expect(screen.getByText("Livros ganham vida quando são lidos.")).toBeDefined();
    expect(
      screen.getByText(/Oi! Participe do IpêBook em Piripiri: https:\/\/ipebook\.app/),
    ).toBeDefined();
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

  it("chama onBack ao acionar o botão de voltar", async () => {
    mockViewModel();
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends onBack={onBack} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("um único botão Compartilhar convite envia imagem e texto, sem os outros botões (Spec 092)", async () => {
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
    expect(screen.getByText("Texto que vai junto com a imagem")).toBeDefined();
    const capture = vi.mocked(actions.shareImage).mock.calls[0][0];
    await expect(capture()).resolves.toBe("file:///tmp/convite.png");
  });
});
