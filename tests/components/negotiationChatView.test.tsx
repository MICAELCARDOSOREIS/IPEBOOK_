import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NegotiationChatModal } from "@/view/requests/NegotiationChatModal";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("Componente NegotiationChatModal (Spec 061 / ADR 0044)", () => {
  const sampleMessages: NegotiationMessage[] = [
    {
      id: "msg-1",
      requestId: "req-100",
      senderId: "user-outro",
      content: "Oi! Chego às 16h no IFPI.",
      createdAt: "2026-10-23T15:50:00Z",
    },
    {
      id: "msg-2",
      requestId: "req-100",
      senderId: "user-meu",
      content: "Combinado, estou na recepção.",
      createdAt: "2026-10-23T15:52:00Z",
    },
  ];

  it("renderiza o cabeçalho com o nome do interlocutor e dica de segurança", async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationChatModal, {
            visible: true,
            requestId: "req-100",
            sessionUserId: "user-meu",
            counterpartName: "Ana Paula",
            onClose: () => {},
          })
        )
      );
      mounted.push(renderer);
    });

    const root = renderer.root;
    expect(root.findByProps({ children: "Ana Paula" })).toBeDefined();
    expect(
      root.findByProps({
        children: "🔒 Encontros sempre em locais públicos e movimentados de Piripiri.",
      })
    ).toBeDefined();
  });

  it("permite fechar o modal pelo botão ✕", async () => {
    const handleClose = vi.fn();
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationChatModal, {
            visible: true,
            requestId: "req-100",
            sessionUserId: "user-meu",
            counterpartName: "Ana Paula",
            onClose: handleClose,
          })
        )
      );
      mounted.push(renderer);
    });

    const closeBtn = renderer.root.findByProps({ accessibilityLabel: "Fechar conversa" });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
