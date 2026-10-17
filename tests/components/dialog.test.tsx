import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { Dialog } from "@/view/components/Dialog";

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
});
