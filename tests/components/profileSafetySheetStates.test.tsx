import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { ProfileSafetySheet } from "@/view/listings/profileSafetySheet";

const book = (id: string, title: string): Book => ({ id, title, author: "A", ownerId: "ana", modality: "trade", status: "available" });
const base = {
  visible: true,
  personName: "Ana",
  listings: null as readonly Book[] | null,
  loadingListings: false,
  blocking: false,
  error: null as string | null,
  onLoadListings: vi.fn(),
  onReportListing: vi.fn(),
  onReportUser: vi.fn(),
  onConfirmBlock: vi.fn(),
  onClose: vi.fn(),
};

async function open(props: Partial<typeof base> = {}) {
  const screen = await render(<ProfileSafetySheet {...base} {...props} />);
  await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar um anúncio de Ana")); });
  return screen;
}

describe("ProfileSafetySheet — estados (Spec 091)", () => {
  it("carrega os anúncios ao escolher denunciar um anúncio e mostra o carregamento", async () => {
    base.onLoadListings.mockClear();
    const screen = await open({ loadingListings: true });
    expect(base.onLoadListings).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Carregando anúncios")).toBeDefined();
  });

  it("avisa quando a pessoa não tem anúncios e quando a carga falha", async () => {
    const empty = await open({ listings: [] });
    expect(empty.getByText("Ana não tem anúncios ativos para denunciar.")).toBeDefined();
    const failed = await open({ listings: [], error: "Não foi possível carregar os anúncios desta pessoa." });
    expect(failed.getAllByText("Não foi possível carregar os anúncios desta pessoa.").length).toBeGreaterThan(0);
  });

  it("não recarrega anúncios que já foram carregados e mostra erro de bloqueio", async () => {
    base.onLoadListings.mockClear();
    const screen = await open({ listings: [book("l1", "Dom Casmurro")] });
    expect(base.onLoadListings).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Denunciar o anúncio Dom Casmurro")).toBeDefined();
    const withError = await render(<ProfileSafetySheet {...base} error="Não foi possível bloquear. Tente novamente." />);
    expect(withError.getByText("Não foi possível bloquear. Tente novamente.")).toBeDefined();
  });

  it("Cancelar fecha a folha", async () => {
    base.onClose.mockClear();
    const screen = await render(<ProfileSafetySheet {...base} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Cancelar")); });
    expect(base.onClose).toHaveBeenCalledTimes(1);
  });
});
