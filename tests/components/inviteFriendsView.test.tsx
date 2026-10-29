import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InviteFriends } from "@/view/profile/inviteFriends";
import type { InviteFriendsState, InviteFriendsActions } from "@/viewmodel/useInviteFriendsViewModel";

vi.mock("@/viewmodel/useInviteFriendsViewModel", () => ({
  useInviteFriendsViewModel: vi.fn(),
}));

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
    inviteMessage: "Oi! Participe do IpêBook em Piripiri: https://ipebook.pages.dev",
    inviteUrl: "https://ipebook.pages.dev",
    ...state,
  };
  const fullActions: InviteFriendsActions = {
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
      screen.getByText(/Oi! Participe do IpêBook em Piripiri: https:\/\/ipebook\.pages\.dev/),
    ).toBeDefined();
  });

  it("aciona envio pelo WhatsApp ao tocar no botão principal", async () => {
    const actions = mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite pelo WhatsApp"));
    });
    expect(actions.shareToWhatsApp).toHaveBeenCalledTimes(1);
  });

  it("aciona compartilhamento nativo ao tocar em outras opções", async () => {
    const actions = mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mais opções de compartilhamento"));
    });
    expect(actions.shareNative).toHaveBeenCalledTimes(1);
  });

  it("aciona cópia de link ao tocar no botão de texto", async () => {
    const actions = mockViewModel();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InviteFriends />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Copiar link do aplicativo"));
    });
    expect(actions.copyLink).toHaveBeenCalledTimes(1);
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
    expect(screen.getByText("Link copiado!")).toBeDefined();
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
});
