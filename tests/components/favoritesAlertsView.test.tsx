
import { act, fireEvent, render, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import Favorites from "@/view/favorites/favorites";
import SearchAlerts from "@/view/search/searchAlerts";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors } from "@/view/tokens";
import { bookUseCases, favoriteUseCases, searchAlertUseCases } from "@/di/container";

describe("favoritos e alertas (spec 016)", () => {
  it("orienta a entrar sem perder a tela de favoritos", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId={null} onBack={vi.fn()} onLogin={onLogin} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Entre para ver seus favoritos" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it("mostra lista vazia de favoritos para conta sem livros salvos", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId="usuario-favoritos-vazio" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Nenhum livro salvo" })).toBeDefined();
  });

  it("atualiza favoritos ao retornar do detalhe após desfavoritar", async () => {
    const userId = "usuario-retorno-favoritos";
    const book = await bookUseCases.createListing({ title: "Livro de retorno", author: "Autora", modality: "donation" }, userId);
    await favoriteUseCases.toggleFavorite(userId, book.id);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId={userId} focusKey={0} onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByText("Livro de retorno")).toBeDefined();

    await favoriteUseCases.toggleFavorite(userId, book.id);
    await act(async () => { screen.rerender(<Favorites userId={userId} focusKey={1} onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Nenhum livro salvo" })).toBeDefined();
  });

  it("favoritos vazio segue 02.14: copy e ação logo abaixo, sem ícone (Spec 043, RN-10)", async () => {
    const onExploreBooks = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId="usuario-favoritos-vazio-043" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} onExploreBooks={onExploreBooks} />); });
    const box = within(screen.getByTestId("favorites-empty-state"));
    expect(box.getByRole("header", { name: "Nenhum livro salvo" })).toBeDefined();
    expect(box.getByText(/Toque (no coração dos anúncios|em Favoritar no anúncio) para guardar (aqui )?os livros que você quer ler\./)).toBeDefined();
    fireEvent.press(box.getByRole("button", { name: "Explorar livros" }));
    expect(onExploreBooks).toHaveBeenCalledOnce();
  });

  it("alertas vazio traz Procurar um livro logo depois do texto (Spec 043, RN-11)", async () => {
    const onSearchBooks = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alertas-vazio-043" onBack={vi.fn()} onLogin={vi.fn()} onSearchBooks={onSearchBooks} />); });
    const box = within(screen.getByTestId("search-alerts-empty-state"));
    expect(box.getByRole("header", { name: "Nenhum alerta criado" })).toBeDefined();
    fireEvent.press(box.getByRole("button", { name: "Procurar um livro" }));
    expect(onSearchBooks).toHaveBeenCalledOnce();
    expect(screen.getAllByRole("button", { name: "Procurar um livro" })).toHaveLength(1);
  });

  it("abre o gerenciamento pelo alvo único da lista", async () => {
    const onManageAlert = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alertas" initialQuery="Machado" onBack={vi.fn()} onLogin={vi.fn()} onManageAlert={onManageAlert} />); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    const row = screen.getByRole("button", { name: "Gerenciar alerta Machado" });
    expect(screen.getByText("Venda, troca e doação · Piripiri, PI")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Editar alerta Machado" })).toBeNull();
    fireEvent.press(row);
    expect(onManageAlert).toHaveBeenCalledWith(expect.stringMatching(/^alert-/));
  });

  it("associa o erro de validação do alerta ao campo para leitores de tela", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alerta-invalido" onBack={vi.fn()} onLogin={vi.fn()} />); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Termo do alerta"), "a"); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    const input = screen.getByLabelText("Termo do alerta");
    const errorText = screen.getByRole("alert");
    expect(input.props["aria-describedby"]).toBeDefined();
    expect(input.props["aria-describedby"]).toBe(errorText.props.nativeID);
    expect(input.props.accessibilityHint).toBe(errorText.props.children);

    await act(async () => { fireEvent.changeText(screen.getByLabelText("Termo do alerta"), "Machado"); });
    expect(screen.getByLabelText("Termo do alerta").props["aria-describedby"]).toBeUndefined();
  });

  it("orienta a entrar para criar um alerta", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId={null} onBack={vi.fn()} onLogin={onLogin} />); });
    expect(screen.getByRole("header", { name: "Entre para criar alertas" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it("oferece busca por outro livro após criar alerta", async () => {
    const onSearchBooks = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SearchAlerts userId="usuario-cartao-alerta" initialQuery="Clarice" onBack={vi.fn()} onLogin={vi.fn()} onSearchBooks={onSearchBooks} />);
    });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    expect(screen.getByRole("button", { name: "Gerenciar alerta Clarice" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Procurar outro livro" }));
    expect(onSearchBooks).toHaveBeenCalledTimes(1);
  });

  it("FavoriteButton alterna favorito, notifica onToggleSuccess e mostra erro quando sem sessão", async () => {
    const userId = "usuario-btn-favorito";
    const book = await bookUseCases.createListing(
      { title: "Livro Favoritável", author: "Autor", modality: "donation" },
      userId,
    );
    const onToggleSuccess = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<FavoriteButton bookId={book.id} userId={userId} onToggleSuccess={onToggleSuccess} />);
    });

    const addBtn = screen.getByRole("button", { name: "Adicionar aos favoritos" });
    await act(async () => {
      fireEvent(addBtn, "pressIn");
    });
    await act(async () => {
      fireEvent(addBtn, "pressOut");
    });
    await act(async () => {
      fireEvent.press(addBtn);
    });
    expect(onToggleSuccess).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Remover dos favoritos" })).toBeDefined();

    let unauthScreen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      unauthScreen = await render(<FavoriteButton bookId={book.id} userId={null} />);
    });
    await act(async () => {
      fireEvent.press(unauthScreen.getByRole("button", { name: "Adicionar aos favoritos" }));
    });
    expect(unauthScreen.getByRole("alert")).toBeDefined();
  });

  it("SearchAlerts exibe ErrorState com Tentar novamente quando a listagem falha e não associa erro de carga ao campo (Spec 125 T007)", async () => {
    const listSpy = vi
      .spyOn(searchAlertUseCases, "listAlerts")
      .mockRejectedValueOnce(new Error("falha de rede"))
      .mockResolvedValueOnce([]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SearchAlerts userId="usuario-erro-carga-alerta" onBack={vi.fn()} onLogin={vi.fn()} />);
    });

    expect(screen.getByRole("alert").props.children).toBe("Não foi possível carregar alertas.");
    const input = screen.getByLabelText("Termo do alerta");
    expect(input.props["aria-describedby"]).toBeUndefined();
    expect(input.props.accessibilityHint).toBeUndefined();

    const retryBtn = screen.getByRole("button", { name: "Tentar novamente" });
    await act(async () => {
      fireEvent.press(retryBtn);
    });
    expect(listSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("header", { name: "Nenhum alerta criado" })).toBeDefined();
    listSpy.mockRestore();
  });

  it("SearchAlerts aplica contraste legível (onPrimaryContainer sobre primaryContainer) no card de alerta ativo", async () => {
    const alert = await searchAlertUseCases.createAlert("usuario-contraste-alerta", "Capitães da Areia");
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SearchAlerts userId="usuario-contraste-alerta" onBack={vi.fn()} onLogin={vi.fn()} />);
    });

    const activeCard = screen.getByTestId(`active-alert-card-${alert.id}`);
    const cardStyle = StyleSheet.flatten(activeCard.props.style);
    const titleStyle = StyleSheet.flatten(screen.getByText("Alerta ativo").props.style);
    const bodyStyle = StyleSheet.flatten(
      screen.getByText("Você recebe uma notificação quando um novo livro corresponde à busca por Capitães da Areia.").props.style,
    );

    expect(cardStyle.backgroundColor).toBe(colors.m3.primaryContainer);
    expect(titleStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(bodyStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(contrastRatio(titleStyle.color as string, cardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(bodyStyle.color as string, cardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);
  });

});
