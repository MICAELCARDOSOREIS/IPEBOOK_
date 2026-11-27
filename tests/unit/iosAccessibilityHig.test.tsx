import { cleanup, render } from "@testing-library/react-native";
import { Platform, StyleSheet, Text } from "react-native";
import { BottomSheet } from "@/view/components/BottomSheet";
import { NavigationBar } from "@/view/components/NavigationBar";
import { TopAppBar } from "@/view/components/TopAppBar";
import { colors, tokens } from "@/view/tokens";
import * as UseReduceTransparencyModule from "@/view/useReduceTransparency";

describe("iOS Nativo · Acessibilidade Digital Apple HIG (Spec 137, Issue #233, Fluxo 12)", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.restoreAllMocks();
  });

  describe("1. Reduzir Transparência (Apple HIG / Fallback Sólido)", () => {
    it("BottomSheet adota fundo sólido colors.m3.surfaceContainer no iOS sob Reduzir Transparência", async () => {
      jest.spyOn(UseReduceTransparencyModule, "useReduceTransparency").mockReturnValue(true);

      const screen = await render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Filtros" testID="test-sheet">
          <Text>Conteúdo</Text>
        </BottomSheet>,
      );

      const container = screen.getByTestId("test-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);

      expect(flatStyle.backgroundColor).toBe(colors.m3.surfaceContainer);
      expect(flatStyle.borderColor).toBe("transparent");
      expect(screen.queryByTestId("ios-native-glass", { includeHiddenElements: true })).toBeNull();
    });

    it("BottomSheet renderiza Liquid Glass nativo no iOS quando Reduzir Transparência está desativado", async () => {
      jest.spyOn(UseReduceTransparencyModule, "useReduceTransparency").mockReturnValue(false);

      const screen = await render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Filtros" testID="test-sheet">
          <Text>Conteúdo</Text>
        </BottomSheet>,
      );

      const container = screen.getByTestId("test-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);

      expect(flatStyle.backgroundColor).toBe("transparent");
      expect(flatStyle.borderColor).toBe("transparent");
      expect(screen.getByTestId("ios-native-glass", { includeHiddenElements: true })).toBeDefined();
    });

    it("NavigationBar oculta GlassView e renderiza dock sólido sob Reduzir Transparência no iOS", async () => {
      jest.spyOn(UseReduceTransparencyModule, "useReduceTransparency").mockReturnValue(true);

      const screen = await render(
        <NavigationBar active="home" onNavigate={jest.fn()} />,
      );

      const dock = screen.getByTestId("navigation-bar-dock");
      expect(dock).toBeDefined();
      expect(screen.queryByTestId("ios-native-glass", { includeHiddenElements: true })).toBeNull();
    });
  });

  describe("2. Dynamic Type (Tipografia Adaptável e Defesa de Layout)", () => {
    it("TopAppBar define maxFontSizeMultiplier={1.3} e numberOfLines={1} no título para evitar estouro de cabeçalho", async () => {
      const screen = await render(<TopAppBar title="Minha Estante de Livros" onBack={jest.fn()} />);
      const titleElement = screen.getByText("Minha Estante de Livros");

      expect(titleElement.props.maxFontSizeMultiplier).toBe(1.3);
      expect(titleElement.props.numberOfLines).toBe(1);
      expect(titleElement.props.accessibilityRole).toBe("header");
    });

    it("NavigationBar deixa os rótulos de abas crescerem e mantém o limite visual do selo", async () => {
      const screen = await render(
        <NavigationBar
          active="home"
          onNavigate={jest.fn()}
          badges={{ shelf: 3 }}
        />,
      );

      const labelElement = screen.getByText("Início");
      expect(labelElement.props.maxFontSizeMultiplier).toBe(0);
      expect(labelElement.props.numberOfLines).toBeUndefined();

      const badgeElement = screen.getByText("3");
      expect(badgeElement.props.maxFontSizeMultiplier).toBe(1.2);
    });

    it("BottomSheet define maxFontSizeMultiplier={1.3} e numberOfLines={1} no título da folha", async () => {
      const screen = await render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Opções de Ordenação">
          <Text>Opções</Text>
        </BottomSheet>,
      );

      const titleElement = screen.getByText("Opções de Ordenação");
      expect(titleElement.props.maxFontSizeMultiplier).toBe(1.3);
      expect(titleElement.props.numberOfLines).toBe(1);
      expect(titleElement.props.accessibilityRole).toBe("header");
    });
  });

  describe("3. Semântica VoiceOver e Acessibilidade de Leitor de Tela", () => {
    it("TopAppBar declara accessibilityRole='header' no título e 'button' com label 'Voltar' no botão de navegação", async () => {
      const onBackMock = jest.fn();
      const screen = await render(<TopAppBar title="Detalhes do Livro" onBack={onBackMock} />);

      const backButton = screen.getByLabelText("Voltar");
      expect(backButton).toBeDefined();
      expect(backButton.props.accessibilityRole).toBe("button");

      const titleHeader = screen.getByText("Detalhes do Livro");
      expect(titleHeader.props.accessibilityLabel).toBe("Detalhes do Livro");
      expect(titleHeader.props.accessibilityRole).toBe("header");
    });

    it("NavigationBar declara accessibilityRole='tablist' no dock e 'tab' com accessibilityState nos itens", async () => {
      const screen = await render(
        <NavigationBar
          active="search"
          onNavigate={jest.fn()}
          disabledDestinations={["shelf"]}
          badges={{ search: 1 }}
        />,
      );

      const tablist = screen.getByTestId("navigation-bar-tablist");
      expect(tablist.props.accessibilityRole).toBe("tablist");

      const activeTab = screen.getByLabelText("Explorar, 1 nova");
      expect(activeTab.props.accessibilityRole).toBe("tab");
      expect(activeTab.props.accessibilityState).toEqual({ selected: true });

      const disabledTab = screen.getByLabelText("Estante (em breve)");
      expect(disabledTab.props.accessibilityRole).toBe("tab");
      expect(disabledTab.props.accessibilityState).toEqual({ selected: false, disabled: true });
    });

    it("BottomSheet declara accessibilityRole='button' e label 'Fechar' no botão de fechamento", async () => {
      const screen = await render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Filtrar" showCloseButton>
          <Text>Filtros</Text>
        </BottomSheet>,
      );

      const closeButton = screen.getByLabelText("Fechar");
      expect(closeButton).toBeDefined();
      expect(closeButton.props.accessibilityRole).toBe("button");
    });
  });

  describe("4. Alvos de Toque Apple HIG (Área Mínima ≥ 44×44 pt no iOS)", () => {
    it("TopAppBar garante botão voltar com dimensão mínima de 44×44 pt no iOS", async () => {
      const screen = await render(<TopAppBar title="Acessibilidade" onBack={jest.fn()} />);
      const backButton = screen.getByLabelText("Voltar");

      const flatStyle = StyleSheet.flatten(backButton.props.style);
      expect(flatStyle.minWidth).toBe(44);
      expect(flatStyle.minHeight).toBe(44);
      expect(flatStyle.width).toBe(44);
      expect(flatStyle.height).toBe(44);
    });

    it("BottomSheet garante botão fechar com dimensão de 44×44 pt no iOS", async () => {
      const screen = await render(
        <BottomSheet visible={true} onClose={jest.fn()} title="Título" showCloseButton>
          <Text>Conteúdo</Text>
        </BottomSheet>,
      );

      const closeButton = screen.getByLabelText("Fechar");
      const flatStyle = StyleSheet.flatten(closeButton.props.style);

      expect(flatStyle.width).toBe(44);
      expect(flatStyle.height).toBe(44);
    });
  });
});
