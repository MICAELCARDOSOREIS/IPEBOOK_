import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { authUseCases, imagePickerService, publicProfileUseCases } from "@/di/container";
import type { MemoryImagePickerService } from "@/infra/services/memoryImagePickerService";
import Profile from "@/view/profile/profile";

/**
 * SC-003 (Issue #55) pela composição real (container → caso de uso → infra em memória): uma
 * pessoa autenticada edita o próprio perfil público (nome, foto pela galeria e Instagram — Spec 081) pela tela de
 * Perfil e a alteração fica disponível para quem consultar o perfil público depois.
 *
 * A parte de busca (SC-002, Issue #56) não faz parte desta entrega — ver `tasks.md` (T015/T019,
 * Maria Clara, #56) — e por isso não é coberta aqui.
 */
describe("SC-003: editar o perfil próprio pelas camadas reais", () => {
  it("salva as alterações e reflete no perfil público consultado depois", async () => {
    const user = await authUseCases.signUp("perfil-sc006@exemplo.com", "senhaSegura123", "Clarinha Martins");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(React.createElement(Profile));
    });

    expect(screen.getByDisplayValue("Clarinha Martins")).toBeDefined();
    // Galeria simulada devolve um JPEG real (magic bytes) que passa pela validação e pelo Storage em memória.
    (imagePickerService as MemoryImagePickerService).setNext({
      bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]),
      fileName: "clarinha.jpg",
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Escolher foto da galeria"));
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Instagram"), "clarinha");
    });
    await act(async () => {
      fireEvent.press(screen.getByText(/Salvar/));
    });

    expect(screen.getByText("Perfil atualizado")).toBeDefined();

    const publicProfile = await publicProfileUseCases.getPublicProfile(user.id);
    expect(publicProfile.name).toBe("Clarinha Martins");
    expect(publicProfile.photoUrl).toMatch(new RegExp(`^https://mock\\.storage\\.local/book-photos/${user.id}/`));
    expect(publicProfile.socialHandle).toBe("@clarinha");

    (imagePickerService as MemoryImagePickerService).setNext(null);
    await authUseCases.signOut();
  });
});
