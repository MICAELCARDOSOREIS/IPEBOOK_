import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from "react-native";
import * as GlassEffect from "expo-glass-effect";
import * as SafeAreaContext from "react-native-safe-area-context";
import { BottomSheet } from "@/view/components/BottomSheet";
import { NavigationBar } from "@/view/components/NavigationBar";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TopAppBar } from "@/view/components/TopAppBar";
import { triggerHaptic } from "@/view/haptics";
import { colors, tokens } from "@/view/tokens";
import * as UseIsWideWebModule from "@/view/useIsWideWeb";
import { useReduceTransparency } from "@/view/useReduceTransparency";

describe("iOS Nativo · Design System Liquid Glass & Apple HIG (Spec 137, ADR 0114, Issue #227)", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.mocked(GlassEffect.isGlassEffectAPIAvailable).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.restoreAllMocks();
  });

  describe("Tokens Liquid Glass", () => {
    it("declara tokens contratuais de vidro em conformidade com design-system/tokens.json", () => {
      expect(tokens.glass).toBeDefined();
      expect(tokens.glass.fill).toBe("rgba(252, 250, 245, 0.58)");
      expect(tokens.glass.stroke).toBe("rgba(255, 255, 255, 0.75)");
    });
  });

  describe("useReduceTransparency", () => {
    it("retorna false quando desativado ou fora do iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
      function TestComponent() {
        const reduced = useReduceTransparency();
        return <Text testID="val">{String(reduced)}</Text>;
      }
      const screen = await render(<TestComponent />);
      expect(screen.getByTestId("val").props.children).toBe("false");
    });

    it("retorna true no iOS quando AccessibilityInfo indica redução de transparência", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(true);

      function TestComponent() {
        const reduced = useReduceTransparency();
        return <Text testID="val">{String(reduced)}</Text>;
      }
      const screen = await render(<TestComponent />);
      expect(screen.getByTestId("val").props.children).toBe("true");
    });

    it("lida defensivamente com rejeição de isReduceTransparencyEnabled mantendo false", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockRejectedValue(new Error("Falha nativa"));

      function TestComponent() {
        const reduced = useReduceTransparency();
        return <Text testID="val">{String(reduced)}</Text>;
      }
      const screen = await render(<TestComponent />);
      expect(screen.getByTestId("val").props.children).toBe("false");
    });

    it("registra listener para o evento reduceTransparencyChanged, reage à emissão e desinscreve no unmount", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);

      let listenerCallback: ((enabled: boolean) => void) | undefined;
      const removeMock = jest.fn();

      jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event: string, cb: unknown) => {
        if (event === "reduceTransparencyChanged") {
          listenerCallback = cb as (enabled: boolean) => void;
        }
        return { remove: removeMock } as never;
      });

      function TestComponent() {
        const reduced = useReduceTransparency();
        return <Text testID="val">{String(reduced)}</Text>;
      }

      const screen = await render(<TestComponent />);
      expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith("reduceTransparencyChanged", expect.any(Function));
      expect(listenerCallback).toBeDefined();

      // Dispara evento de ativação
      await act(async () => {
        listenerCallback?.(true);
      });
      expect(screen.getByTestId("val").props.children).toBe("true");

      // Dispara evento de desativação
      await act(async () => {
        listenerCallback?.(false);
      });
      expect(screen.getByTestId("val").props.children).toBe("false");

      // Desmonta e confere remoção da subscrição
      await act(async () => {
        screen.unmount();
      });
      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe("triggerHaptic", () => {
    let impactSpy: jest.SpyInstance;
    let selectionSpy: jest.SpyInstance;
    let notificationSpy: jest.SpyInstance;

    beforeEach(() => {
      impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
      selectionSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();
      notificationSpy = jest.spyOn(Haptics, "notificationAsync").mockResolvedValue();
    });

    it("dispara as APIs corretas do expo-haptics no iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });

      triggerHaptic("light");
      expect(impactSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

      triggerHaptic("medium");
      expect(impactSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);

      triggerHaptic("heavy");
      expect(impactSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);

      triggerHaptic("selection");
      expect(selectionSpy).toHaveBeenCalled();

      triggerHaptic("success");
      expect(notificationSpy).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);

      triggerHaptic("warning");
      expect(notificationSpy).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);

      triggerHaptic("error");
      expect(notificationSpy).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    });

    it("é no-op fora do iOS sem acionar expo-haptics", () => {
      impactSpy.mockClear();
      selectionSpy.mockClear();
      notificationSpy.mockClear();
      Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
      triggerHaptic("selection");
      triggerHaptic("light");
      expect(impactSpy).not.toHaveBeenCalled();
      expect(selectionSpy).not.toHaveBeenCalled();
    });
  });

  describe("ScreenContainer", () => {
    it("renderiza o conteúdo preservando a gestão de teclado delegada ao KeyboardAwareRoot global", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      const screen = await render(
        <ScreenContainer testID="screen-container">
          <Text>Conteúdo iOS</Text>
        </ScreenContainer>,
      );
      expect(screen.getByText("Conteúdo iOS")).toBeDefined();
      const container = screen.getByTestId("screen-container");
      expect(container).toBeDefined();
    });

    it("renderiza normalmente no Android", async () => {
      Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
      const screen = await render(
        <ScreenContainer>
          <Text>Conteúdo Android</Text>
        </ScreenContainer>,
      );
      expect(screen.getByText("Conteúdo Android")).toBeDefined();
    });
  });

  describe("NavigationBar (Liquid Glass e Apple HIG)", () => {
    it("renderiza dock flutuante com Liquid Glass nativo e haptics de seleção no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
      const selectionSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();

      const onNavigate = jest.fn();
      const screen = await render(<NavigationBar active="home" onNavigate={onNavigate} />);

      const tablist = screen.getByTestId("navigation-bar-tablist");
      expect(tablist).toBeDefined();

      const dock = screen.getByTestId("navigation-bar-dock");
      const flatStyle = StyleSheet.flatten(dock.props.style);
      expect(flatStyle.backgroundColor).toBe("transparent");
      expect(flatStyle.borderColor).toBe("transparent");

      const glassView = screen.getByTestId("ios-native-glass", { includeHiddenElements: true });
      expect(glassView.props).toMatchObject({
        glassEffectStyle: "regular",
        pointerEvents: "none",
        accessibilityElementsHidden: true,
      });

      const activePill = screen.getByTestId("navigation-bar-active-pill");
      const pillStyle = StyleSheet.flatten(activePill.props.style);
      expect(pillStyle.top).toBe(tokens.spacing[4]);
      expect(pillStyle.bottom).toBe(tokens.spacing[4]);
      expect(pillStyle.width).toBeGreaterThan(100);

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(3);

      fireEvent.press(tabs[1]);
      expect(selectionSpy).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith("search");
    });

    it.each([
      ["com Reduzir Transparência", true],
      ["com API indisponível", false],
    ])("aplica fallback opaco %s no iOS", async (_reason, reduceTransparency) => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(reduceTransparency);
      jest.mocked(GlassEffect.isGlassEffectAPIAvailable).mockReturnValue(reduceTransparency);

      const onNavigate = jest.fn();
      const screen = await render(<NavigationBar active="home" onNavigate={onNavigate} />);

      const tablist = screen.getByTestId("navigation-bar-tablist");
      expect(tablist).toBeDefined();

      const dock = screen.getByTestId("navigation-bar-dock");
      const flatStyle = StyleSheet.flatten(dock.props.style);
      expect(flatStyle.backgroundColor).toBe(colors.m3.surfaceContainer);
      expect(flatStyle.borderColor).toBe(colors.m3.outlineVariant);
      expect(screen.queryByTestId("ios-native-glass", { includeHiddenElements: true })).toBeNull();
    });
  });

  describe("TopAppBar (Apple HIG)", () => {
    it("garante alvo de toque mínimo de 44x44 pt no botão voltar e dispara feedback tátil no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
      const onBack = jest.fn();
      const screen = await render(<TopAppBar title="Título da Tela" onBack={onBack} />);

      const backBtn = screen.getByLabelText("Voltar");
      expect(backBtn).toBeDefined();

      const flatStyle = StyleSheet.flatten(backBtn.props.style);
      expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);

      fireEvent.press(backBtn);
      expect(impactSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("BottomSheet (Apple HIG & Acessibilidade)", () => {
    it("não renderiza nada quando visible=false", async () => {
      const onClose = jest.fn();
      const screen = await render(
        <BottomSheet visible={false} onClose={onClose} testID="modal-sheet">
          <Text>Oculto</Text>
        </BottomSheet>,
      );
      expect(screen.queryByTestId("modal-sheet")).toBeNull();
      expect(screen.queryByText("Oculto")).toBeNull();
    });

    it("renderiza com modal de acessibilidade, drag handle, GlassView no iOS, estilo Liquid Glass e cantos de 28 dp", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);

      const onClose = jest.fn();
      const screen = await render(
        <BottomSheet visible onClose={onClose} title="Opções do Livro" showCloseButton testID="modal-sheet">
          <View>
            <Text>Conteúdo da folha</Text>
          </View>
        </BottomSheet>,
      );

      const sheetModal = screen.getByTestId("modal-sheet");
      expect(sheetModal).toBeDefined();
      expect(sheetModal.props["aria-modal"]).toBe(true);
      expect(sheetModal.props.accessibilityViewIsModal).toBe(true);

      const container = screen.getByTestId("modal-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);
      expect(flatStyle.backgroundColor).toBe("transparent");
      expect(flatStyle.borderColor).toBe("transparent");
      expect(flatStyle.borderTopLeftRadius).toBe(tokens.radius.xxl);
      expect(flatStyle.borderTopRightRadius).toBe(tokens.radius.xxl);

      expect(screen.getByTestId("bottom-sheet-drag-area")).toBeDefined();
      expect(screen.getByTestId("bottom-sheet-handle")).toBeDefined();
      expect(screen.getByTestId("ios-native-glass", { includeHiddenElements: true })).toBeDefined();
      expect(screen.getByText("Opções do Livro")).toBeDefined();
      expect(screen.getByText("Conteúdo da folha")).toBeDefined();

      const closeBtn = screen.getByLabelText("Fechar");
      expect(closeBtn).toBeDefined();
      fireEvent.press(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("aplica fallback opaco surfaceContainer no iOS quando Reduzir Transparência estiver ativo", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(true);

      const screen = await render(
        <BottomSheet visible onClose={jest.fn()} testID="modal-sheet">
          <Text>Conteúdo sem transparência</Text>
        </BottomSheet>,
      );

      const container = screen.getByTestId("modal-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);
      expect(flatStyle.backgroundColor).toBe(colors.m3.surfaceContainer);
      expect(screen.queryByTestId("ios-native-glass", { includeHiddenElements: true })).toBeNull();
    });

    it("respeita insets.bottom dinâmico somando à folga do Home Indicator", async () => {
      jest.spyOn(SafeAreaContext, "useSafeAreaInsets").mockReturnValue({
        top: 47,
        left: 0,
        right: 0,
        bottom: 34,
      });

      const screen = await render(
        <BottomSheet visible onClose={jest.fn()} testID="modal-sheet">
          <Text>Safe Area Test</Text>
        </BottomSheet>,
      );

      const container = screen.getByTestId("modal-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);
      expect(flatStyle.paddingBottom).toBe(34 + tokens.spacing[8]); // 34 + 8 = 42
    });

    it("no modo wideWeb oculta o drag handle e aplica estilo centralizado de diálogo desktop", async () => {
      jest.spyOn(UseIsWideWebModule, "useIsWideWeb").mockReturnValue(true);

      const screen = await render(
        <BottomSheet visible onClose={jest.fn()} testID="modal-sheet">
          <Text>Desktop Content</Text>
        </BottomSheet>,
      );

      expect(screen.queryByTestId("bottom-sheet-drag-area")).toBeNull();
      const container = screen.getByTestId("modal-sheet-container");
      const flatStyle = StyleSheet.flatten(container.props.style);
      expect(flatStyle.maxWidth).toBe(480);
    });

    it("fecha ao tocar fora da folha (backdrop)", async () => {
      const onClose = jest.fn();
      const screen = await render(
        <BottomSheet visible onClose={onClose}>
          <Text>Item</Text>
        </BottomSheet>,
      );

      const backdrop = screen.getByLabelText("Fechar ao tocar fora");
      fireEvent.press(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
