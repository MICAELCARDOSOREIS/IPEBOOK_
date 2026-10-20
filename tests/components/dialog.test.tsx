import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import { Dialog, resolveDialogTabWrap, type FocusableElement } from "@/view/components/Dialog";

describe("Dialog (design-system/04-componentes/dialogo.md)", () => {
  afterEach(() => {
    cleanup();
  });

  it("não renderiza conteúdo quando visible é falso", async () => {
    const { queryByText } = await render(
      <Dialog
        visible={false}
        title="Excluir anúncio?"
        message="Esta ação é irreversível."
        confirmLabel="Excluir"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(queryByText("Excluir anúncio?")).toBeNull();
  });

  it("renderiza título, mensagem e botões quando visible é verdadeiro", async () => {
    const { getByText, getByLabelText } = await render(
      <Dialog
        visible={true}
        title="Excluir anúncio?"
        message="Esta ação removerá o livro da listagem."
        confirmLabel="Excluir anúncio"
        cancelLabel="Voltar"
        destructive
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(getByText("Excluir anúncio?")).toBeDefined();
    expect(getByText("Esta ação removerá o livro da listagem.")).toBeDefined();
    expect(getByLabelText("Voltar")).toBeDefined();
    expect(getByLabelText("Excluir anúncio")).toBeDefined();
  });

  it("chama onCancel ao pressionar o botão de cancelamento", async () => {
    const onCancel = vi.fn();
    const { getByLabelText } = await render(
      <Dialog
        visible={true}
        title="Excluir anúncio?"
        message="Confirmar?"
        confirmLabel="Excluir"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    fireEvent.press(getByLabelText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("chama onConfirm ao pressionar o botão de confirmação", async () => {
    const onConfirm = vi.fn();
    const { getByLabelText } = await render(
      <Dialog
        visible={true}
        title="Excluir anúncio?"
        message="Confirmar?"
        confirmLabel="Excluir anúncio"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    fireEvent.press(getByLabelText("Excluir anúncio"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("desabilita interações e exibe loading quando loading é verdadeiro", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { getByLabelText } = await render(
      <Dialog
        visible={true}
        loading={true}
        title="Excluindo..."
        message="Aguarde"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const confirmBtn = getByLabelText("Excluir");
    expect(confirmBtn.props.accessibilityState).toEqual({ disabled: true });
  });

  describe("resolveDialogTabWrap (prisão de foco do Dialog, issue #105)", () => {
    const cancel: FocusableElement = { focus: vi.fn() };
    const confirm: FocusableElement = { focus: vi.fn() };
    const focusables = [cancel, confirm] as const;

    it("sem elementos focáveis, não decide nada", () => {
      expect(resolveDialogTabWrap([], cancel, { shiftKey: false })).toBeNull();
    });

    it("Tab no último elemento volta para o primeiro (ciclo)", () => {
      expect(resolveDialogTabWrap(focusables, confirm, { shiftKey: false })).toBe(cancel);
    });

    it("Shift+Tab no primeiro elemento vai para o último (ciclo)", () => {
      expect(resolveDialogTabWrap(focusables, cancel, { shiftKey: true })).toBe(confirm);
    });

    it("Tab no meio da lista de foco não interfere (deixa o navegador seguir o fluxo natural)", () => {
      expect(resolveDialogTabWrap(focusables, cancel, { shiftKey: false })).toBeNull();
      expect(resolveDialogTabWrap(focusables, confirm, { shiftKey: true })).toBeNull();
    });
  });

  describe("gestão de foco na Web (achado 2 da auditoria #96, issue #105)", () => {
    const originalOS = Platform.OS;
    const originalDocument = (globalThis as { document?: unknown }).document;

    type FakeListener = (event: { key: string; shiftKey?: boolean; preventDefault: () => void }) => void;

    const installFakeDocument = () => {
      const listeners = new Set<FakeListener>();
      const fakeDocument = {
        activeElement: null as unknown,
        addEventListener: (type: string, listener: FakeListener) => {
          if (type === "keydown") listeners.add(listener);
        },
        removeEventListener: (type: string, listener: FakeListener) => {
          if (type === "keydown") listeners.delete(listener);
        },
        dispatch: (event: { key: string; shiftKey?: boolean }) => {
          listeners.forEach((listener) => listener({ preventDefault: () => {}, ...event }));
        },
      };
      (globalThis as { document?: unknown }).document = fakeDocument;
      return fakeDocument;
    };

    afterEach(() => {
      cleanup();
      Platform.OS = originalOS;
      (globalThis as { document?: unknown }).document = originalDocument;
    });

    it("Esc cancela o diálogo, equivalente ao botão Cancelar", async () => {
      Platform.OS = "web";
      const fakeDocument = installFakeDocument();
      const onCancel = vi.fn();
      await render(
        <Dialog
          visible={true}
          title="Excluir anúncio?"
          message="Confirmar?"
          confirmLabel="Excluir"
          onConfirm={() => {}}
          onCancel={onCancel}
        />,
      );

      fakeDocument.dispatch({ key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("não reage a Esc quando o diálogo está fechado", async () => {
      Platform.OS = "web";
      const fakeDocument = installFakeDocument();
      const onCancel = vi.fn();
      await render(
        <Dialog
          visible={false}
          title="Excluir anúncio?"
          message="Confirmar?"
          confirmLabel="Excluir"
          onConfirm={() => {}}
          onCancel={onCancel}
        />,
      );

      fakeDocument.dispatch({ key: "Escape" });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("não reage a Esc fora da Web (iOS/Android usam o botão voltar/VoiceOver/TalkBack)", async () => {
      Platform.OS = "ios";
      const fakeDocument = installFakeDocument();
      const onCancel = vi.fn();
      await render(
        <Dialog
          visible={true}
          title="Excluir anúncio?"
          message="Confirmar?"
          confirmLabel="Excluir"
          onConfirm={() => {}}
          onCancel={onCancel}
        />,
      );

      fakeDocument.dispatch({ key: "Escape" });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("devolve o foco ao elemento que abriu o diálogo quando ele fecha", async () => {
      Platform.OS = "web";
      const fakeDocument = installFakeDocument();
      const trigger = { focus: vi.fn() };
      fakeDocument.activeElement = trigger;

      const { rerender } = await render(
        <Dialog
          visible={true}
          title="Excluir anúncio?"
          message="Confirmar?"
          confirmLabel="Excluir"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      await rerender(
        <Dialog
          visible={false}
          title="Excluir anúncio?"
          message="Confirmar?"
          confirmLabel="Excluir"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      expect(trigger.focus).toHaveBeenCalledTimes(1);
    });

    it("não falha ao abrir em loading (sem botão habilitado para focar)", async () => {
      Platform.OS = "web";
      installFakeDocument();

      await expect(
        render(
          <Dialog
            visible={true}
            loading={true}
            title="Excluindo..."
            message="Aguarde"
            confirmLabel="Excluir"
            onConfirm={() => {}}
            onCancel={() => {}}
          />,
        ),
      ).resolves.toBeDefined();
    });
  });
});
