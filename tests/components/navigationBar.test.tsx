
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { NavigationBar } from "@/view/components/NavigationBar";

describe("NavigationBar (design-system/04-componentes/barra-de-navegacao.md, ADR 0011)", () => {
  afterEach(() => {
    cleanup();
  });

  it("mostra os três destinos principais da barra inferior (Conversas e Perfil ficam no topo da Home)", async () => {
    const { getByLabelText, queryByLabelText } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    expect(getByLabelText("Início")).toBeDefined();
    expect(getByLabelText("Explorar")).toBeDefined();
    expect(getByLabelText("Estante")).toBeDefined();
    expect(queryByLabelText("Conversas")).toBeNull();
    expect(queryByLabelText("Perfil")).toBeNull();
  });

  it("mostra selo numérico no destino, limita a 9+ e anuncia a contagem (Spec 091)", async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <NavigationBar active="home" onNavigate={() => {}} badges={{ home: 2, shelf: 12, search: 0 }} />,
    );
    expect(getByLabelText("Início, 2 novas")).toBeDefined();
    expect(getByText("2")).toBeDefined();
    expect(getByText("9+")).toBeDefined();
    expect(getByLabelText("Estante, 12 novas")).toBeDefined();
    expect(getByLabelText("Explorar")).toBeDefined();
    expect(queryByText("0")).toBeNull();
  });

  it("agrupa as abas em um contêiner com papel tablist", async () => {
    const { getByTestId, getAllByRole } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    expect(getByTestId("navigation-bar-tablist").props.accessibilityRole).toBe("tablist");
    expect(getAllByRole("tab")).toHaveLength(3);
  });

  it("anuncia o destino atual como selecionado e os demais como não selecionados", async () => {
    const { getByLabelText } = await render(<NavigationBar active="search" onNavigate={() => {}} />);
    expect(getByLabelText("Explorar").props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText("Início").props.accessibilityState).toEqual({ selected: false });
    expect(getByLabelText("Estante").props.accessibilityState).toEqual({ selected: false });
  });

  it("chama onNavigate com o destino tocado", async () => {
    const onNavigate = vi.fn();
    const { getByLabelText } = await render(<NavigationBar active="home" onNavigate={onNavigate} />);
    fireEvent.press(getByLabelText("Estante"));
    expect(onNavigate).toHaveBeenCalledWith("shelf");
  });

  it("desabilita destinos indicados em disabledDestinations e não dispara onNavigate", async () => {
    const onNavigate = vi.fn();
    const { getByLabelText } = await render(
      <NavigationBar active="home" disabledDestinations={["shelf"]} onNavigate={onNavigate} />
    );

    const shelfTab = getByLabelText("Estante (em breve)");
    expect(shelfTab).toBeDefined();
    expect(shelfTab.props.accessibilityState).toEqual({ selected: false, disabled: true });

    fireEvent.press(shelfTab);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("eleva os itens e aplica padding seguro contra a barra de navegação do sistema (3 botões Android / Home Indicator)", async () => {
    const safeArea = await import("react-native-safe-area-context");
    const spy = vi.spyOn(safeArea, "useSafeAreaInsets").mockReturnValue({
      top: 24,
      bottom: 48, // Altura padrão da barra nativa de 3 botões do Android
      left: 0,
      right: 0,
    });

    const { getByTestId } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    const tablist = getByTestId("navigation-bar-tablist");

    // paddingBottom deve acomodar os 48dp da barra do sistema com respiro (48 + 8 = 56dp)
    const styleObj = Array.isArray(tablist.props.style)
      ? Object.assign({}, ...tablist.props.style.flat().filter(Boolean))
      : tablist.props.style;

    expect(styleObj.paddingBottom).toBeGreaterThanOrEqual(56);
    spy.mockRestore();
  });

  it("responde aos eventos de hover nos itens inativos (Material 3 State Layer)", async () => {
    const { getByLabelText } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    const exploreTab = getByLabelText("Explorar");

    // Simula hover in e hover out
    await fireEvent(exploreTab, "hoverIn");
    await fireEvent(exploreTab, "hoverOut");
  });

  it("renderiza a pílula ativa deslizante contínua para o destino ativo (Material 3 Expressive)", async () => {
    const { getByTestId } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    const activePill = getByTestId("navigation-bar-active-pill");
    expect(activePill).toBeDefined();
  });

  it("não renderiza pílula ativa quando o destino ativo não pertence à barra inferior (ex.: conversas ou perfil)", async () => {
    const { queryByTestId } = await render(<NavigationBar active="profile" onNavigate={() => {}} />);
    expect(queryByTestId("navigation-bar-active-pill")).toBeNull();
  });

  it("aplica padding mínimo de 12dp quando insets.bottom é zero", async () => {
    const safeArea = await import("react-native-safe-area-context");
    const spy = vi.spyOn(safeArea, "useSafeAreaInsets").mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });

    const { getByTestId } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    const tablist = getByTestId("navigation-bar-tablist");
    const styleObj = Array.isArray(tablist.props.style)
      ? Object.assign({}, ...tablist.props.style.flat().filter(Boolean))
      : tablist.props.style;

    expect(styleObj.paddingBottom).toBe(12);
    spy.mockRestore();
  });

  it("ignora duplo toque rápido no mesmo destino ou destino diferente (debounce)", async () => {
    const onNavigate = vi.fn();
    const { getByLabelText } = await render(<NavigationBar active="home" onNavigate={onNavigate} />);
    const shelfTab = getByLabelText("Estante");

    fireEvent.press(shelfTab);
    fireEvent.press(shelfTab);

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
