import { act, fireEvent, render } from "@testing-library/react-native";
import type React from "react";
import * as Linking from "expo-linking";
import { Clipboard, Platform, Share, StyleSheet } from "react-native";
import type { Book } from "@/model/entities/book";
import ManageListing from "@/view/listings/manageListing";
import type { ManageListingActions, ManageListingState } from "@/viewmodel/useManageListingViewModel";

jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `https://ipebook.app${path}`),
  openURL: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/viewmodel/useManageListingViewModel", () => ({
  useManageListingViewModel: jest.fn(),
}));

import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";

const mockedUseManageListingViewModel = jest.mocked(useManageListingViewModel);

const book: Book = {
  id: "b1",
  title: "O Pequeno Príncipe",
  author: "Antoine de Saint-Exupéry",
  ownerId: "user-1",
  modality: "sale",
  price: 25,
  status: "available",
  condition: "good",
  city: "Piripiri",
  state: "PI",
  neighborhood: "Centro",
};

function mockViewModel(state: Partial<ManageListingState>, actions: Partial<ManageListingActions> = {}) {
  const fullState: ManageListingState = {
    book,
    loading: false,
    busy: false,
    error: null,
    removed: false,
    ...state,
  };
  const fullActions: ManageListingActions = {
    load: jest.fn().mockResolvedValue(undefined),
    togglePause: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseManageListingViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

async function renderScreen(props: Partial<React.ComponentProps<typeof ManageListing>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<ManageListing bookId="b1" sessionUserId="user-1" {...props} />);
  });
  return screen;
}

describe("tela de gerenciar anúncio (Figma 04.08)", () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it("mostra o livro e mantém a ação de segurança acessível no iPhone compacto", async () => {
    jest.replaceProperty(Platform, "OS", "ios");
    mockViewModel({});
    const screen = await renderScreen();

    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("Gerenciar anúncio");
    expect(headers).toContain("O Pequeno Príncipe");
    expect(screen.getByText("O Pequeno Príncipe")).toBeDefined();
    expect(screen.getByText("Antoine de Saint-Exupéry")).toBeDefined();
    expect(screen.getByText("Bom estado")).toBeDefined();
    expect(screen.getByText("Centro · Piripiri · PI")).toBeDefined();
    expect(screen.getByText("Anúncio ativo")).toBeDefined();
    expect(screen.getByLabelText("Editar anúncio")).toBeDefined();
    expect(screen.getByLabelText("Pausar anúncio")).toBeDefined();

    const safety = screen.getByRole("button", { name: "Segurança em Piripiri" });
    expect(screen.queryByText("Segurança")).toBeNull();
    expect(StyleSheet.flatten(safety.props.style)).toMatchObject({ width: 44, minHeight: 44 });
    await act(async () => { fireEvent.press(safety); });
    expect(screen.getByRole("header", { name: "Segurança em Piripiri" })).toBeDefined();
    const emergency = screen.getByRole("link", { name: "Emergência policial · Ligar 190" });
    const civilPolice = screen.getByRole("link", { name: "Polícia Civil do Piauí · Ligar 197" });
    const localStation = screen.getByRole("link", { name: "Consultar a Delegacia de Piripiri" });
    const openURL = jest.spyOn(Linking, "openURL");
    try {
      await act(async () => {
        fireEvent.press(emergency);
        fireEvent.press(civilPolice);
        fireEvent.press(localStation);
      });
      expect(openURL.mock.calls).toEqual([
        ["tel:190"],
        ["tel:197"],
        ["https://portal.pi.gov.br/pc/delegacias-do-interior/"],
      ]);
    } finally {
      openURL.mockRestore();
    }
  });

  it("mostra o erro quando o compartilhamento no WhatsApp falha (Spec 118)", async () => {
    mockViewModel({});
    const linking = await import("expo-linking");
    jest.mocked(linking.openURL).mockRejectedValueOnce(new Error("sem WhatsApp"));
    const shareSpy = jest.spyOn(Share, "share").mockRejectedValueOnce(new Error("folha indisponível"));
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Divulgar no WhatsApp"));
    });

    expect(screen.getByText("Não foi possível compartilhar o anúncio. Tente novamente.")).toBeDefined();
    shareSpy.mockRestore();
  });

  it("mostra o estado pausado e a ação de retomar", async () => {
    mockViewModel({ book: { ...book, status: "paused" } });
    const screen = await renderScreen();

    expect(screen.getByText("Anúncio pausado")).toBeDefined();
    expect(screen.getByLabelText("Retomar anúncio")).toBeDefined();
    expect(screen.queryByLabelText("Pausar anúncio")).toBeNull();
  });

  it("bloqueia edição e pausa quando há negociação aceita", async () => {
    mockViewModel({ book: { ...book, status: "reserved" } });
    const screen = await renderScreen();

    expect(screen.getByText("Negociação em andamento")).toBeDefined();
    expect(screen.getByLabelText("Editar anúncio").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText("Pausar anúncio").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Excluir anúncio" }).props.accessibilityState.disabled).toBe(true);
    expect(
      screen.getByText("A exclusão fica indisponível enquanto houver uma negociação em andamento."),
    ).toBeDefined();

    mockViewModel({ book: { ...book, status: "delivered" } });
    await act(async () => {
      await screen.rerender(<ManageListing bookId="b1" sessionUserId="user-1" />);
    });
    expect(screen.getByText("Livro entregue")).toBeDefined();
    expect(screen.getByLabelText("Editar anúncio").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText("Pausar anúncio").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Excluir anúncio" }).props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText("O anúncio de um livro entregue fica no histórico.")).toBeDefined();
    expect(screen.queryByText(/enquanto houver uma negociação em andamento/)).toBeNull();
  });

  it("transforma o botão inferior em 'Ir para a conversa' quando reservado com negociação aceita", async () => {
    const onOpenChat = jest.fn();
    mockViewModel({ book: { ...book, status: "reserved" }, acceptedRequestId: "req-99" });
    const screen = await renderScreen({ onOpenChat });

    const chatButton = screen.getByRole("button", { name: "Ir para a conversa" });
    expect(chatButton.props.accessibilityState.disabled).toBe(false);
    await act(async () => { fireEvent.press(chatButton); });
    expect(onOpenChat).toHaveBeenCalledWith("req-99");
  });

  it("aciona a edição do anúncio", async () => {
    mockViewModel({});
    const onEdit = jest.fn();
    const screen = await renderScreen({ onEdit });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Editar anúncio"));
    });

    expect(onEdit).toHaveBeenCalledWith("b1");
  });

  it("pausa o anúncio pela ação correspondente", async () => {
    const actions = mockViewModel({});
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Pausar anúncio"));
    });

    expect(actions.togglePause).toHaveBeenCalledTimes(1);
  });

  it("só exclui depois da confirmação no diálogo", async () => {
    const actions = mockViewModel({});
    const onRemoved = jest.fn();
    const screen = await renderScreen({ onRemoved });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir anúncio" }));
    });
    expect(screen.getByText("Excluir anúncio?")).toBeDefined();
    expect(actions.remove).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir" }));
    });

    expect(actions.remove).toHaveBeenCalledTimes(1);
    expect(onRemoved).toHaveBeenCalledTimes(1);
  });

  it("mantém o anúncio quando a exclusão é cancelada", async () => {
    const actions = mockViewModel({});
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir anúncio" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Manter anúncio" }));
    });

    expect(actions.remove).not.toHaveBeenCalled();
  });

  it("exibe carregamento e erro de carga", async () => {
    mockViewModel({ book: null, loading: true });
    const carregando = await renderScreen();
    expect(carregando.getByLabelText("Carregando anúncio")).toBeDefined();

    mockViewModel({ book: null, loading: false, error: "Você só pode gerenciar seus próprios anúncios." });
    const comErro = await renderScreen();
    expect(comErro.getByText("Você só pode gerenciar seus próprios anúncios.")).toBeDefined();
  });

  it("aciona a visualização pública do anúncio quando disponível", async () => {
    mockViewModel({});
    const onViewPublicListing = jest.fn();
    const screen = await renderScreen({ onViewPublicListing });

    const viewButton = screen.getByLabelText("Ver anúncio como leitor");
    expect(viewButton).toBeDefined();

    await act(async () => {
      fireEvent.press(viewButton);
    });

    expect(onViewPublicListing).toHaveBeenCalledWith("b1");
  });

  it("copia o link direto na divulgação e não exibe o botão redundante de compartilhar abaixo", async () => {
    mockViewModel({});
    const copySpy = jest.spyOn(Clipboard, "setString");
    const screen = await renderScreen();

    expect(screen.getByText("ipebook.app/livro/b1")).toBeDefined();
    expect(screen.queryByLabelText("Compartilhar anúncio")).toBeNull();
    const copyButton = screen.getByLabelText("Copiar link do anúncio");
    await act(async () => {
      fireEvent.press(copyButton);
    });
    expect(copySpy).toHaveBeenCalledWith("https://ipebook.app/livro/b1");
    expect(screen.getByText("Link do anúncio copiado para a área de transferência!")).toBeDefined();
    expect(screen.getByText("Copiado")).toBeDefined();
  });

  it("mostra aviso contextual na divulgação quando o anúncio está pausado", async () => {
    mockViewModel({ book: { ...book, status: "paused" } });
    const screen = await renderScreen();
    expect(
      screen.getByText("Anúncio pausado: retome o anúncio antes de divulgar para que leitores consigam acessá-lo."),
    ).toBeDefined();
  });

  it("permite divulgar o anúncio no WhatsApp (Spec 118)", async () => {
    mockViewModel({});
    const screen = await renderScreen();

    const whatsappButton = screen.getByLabelText("Divulgar no WhatsApp");
    expect(whatsappButton).toBeDefined();

    await act(async () => {
      fireEvent.press(whatsappButton);
    });
  });

  it("atende aos padrões de acessibilidade (IHC e a11y)", async () => {
    mockViewModel({});
    const screen = await renderScreen({ onViewPublicListing: jest.fn() });

    // Seções organizadas com cabeçalhos acessíveis para navegação semântica
    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("Divulgação");
    expect(screen.getByRole("button", { name: "Pausar anúncio" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Excluir anúncio" })).toBeDefined();

    // Resumo acessível do livro para leitores de tela
    const bookSummary = screen.getByLabelText(/Resumo do anúncio: O Pequeno Príncipe/);
    expect(bookSummary).toBeDefined();

    // Região de status ao vivo com accessibilityLiveRegion polite
    const statusRegion = screen.getByLabelText(/Status do anúncio: Anúncio ativo/);
    expect(statusRegion).toBeDefined();
    expect(statusRegion.props.accessibilityLiveRegion).toBe("polite");

    // Hints informativos nas ações para usuários com leitor de tela
    const editBtn = screen.getByLabelText("Editar anúncio");
    expect(editBtn.props.accessibilityHint).toContain("Abre o formulário");

    const viewBtn = screen.getByLabelText("Ver anúncio como leitor");
    expect(viewBtn.props.accessibilityHint).toContain("Abre a visualização");

    const whatsappBtn = screen.getByLabelText("Divulgar no WhatsApp");
    expect(whatsappBtn.props.accessibilityHint).toContain("Abre o WhatsApp");

    const copyBtn = screen.getByLabelText("Copiar link do anúncio");
    expect(copyBtn.props.accessibilityHint).toContain("Copia o endereço direto");

    const pauseBtn = screen.getByLabelText("Pausar anúncio");
    expect(pauseBtn.props.accessibilityHint).toContain("Oculta temporariamente");
  });

  it("reserva respiro inferior suficiente no iOS para a barra fixa não cobrir a divulgação", async () => {
    jest.replaceProperty(Platform, "OS", "ios");
    mockViewModel({});
    const screen = await renderScreen();
    type JsonNode = { type?: string; props?: { contentContainerStyle?: unknown }; children?: Array<JsonNode | string> | null };
    const findScroll = (node: JsonNode | null): JsonNode | null => {
      if (!node || typeof node === "string") return null;
      if (node.type === "ScrollView") return node;
      for (const child of node.children ?? []) {
        if (typeof child !== "string") {
          const hit = findScroll(child);
          if (hit) return hit;
        }
      }
      return null;
    };
    const scrollNode = findScroll(screen.toJSON() as JsonNode | null);
    expect(scrollNode).not.toBeNull();
    const scrollStyle = StyleSheet.flatten(scrollNode?.props?.contentContainerStyle as never);
    expect(Number(scrollStyle.paddingBottom)).toBeGreaterThanOrEqual(112);
  });

  it("aplica a cor temática correspondente à modalidade do anúncio (doação, troca e venda)", async () => {
    const { tokens } = await import("@/view/tokens");

    mockViewModel({ book: { ...book, modality: "donation", price: undefined } });
    const donationScreen = await renderScreen();
    expect(donationScreen.getByLabelText("Editar anúncio").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: tokens.colors.badge.donation.background })]),
    );

    mockViewModel({ book: { ...book, modality: "trade", price: undefined } });
    const tradeScreen = await renderScreen();
    expect(tradeScreen.getByLabelText("Editar anúncio").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: tokens.colors.badge.trade.background })]),
    );

    mockViewModel({ book: { ...book, modality: "sale", price: 25 } });
    const saleScreen = await renderScreen();
    expect(saleScreen.getByLabelText("Editar anúncio").props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: tokens.colors.badge.sale.background })]),
    );
  });
});
