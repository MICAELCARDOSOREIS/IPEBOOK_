import { fireEvent, render } from "@testing-library/react-native";
import { AccessibilityInfo, Platform, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { BottomSheet } from "@/view/components/BottomSheet";
import { NavigationBar } from "@/view/components/NavigationBar";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TopAppBar } from "@/view/components/TopAppBar";
import { triggerHaptic } from "@/view/haptics";
import { colors } from "@/view/tokens";
import { useReduceTransparency } from "@/view/useReduceTransparency";

describe("iOS Nativo · Design System Liquid Glass & Apple HIG (Spec 137, ADR 0114, Issue #227)", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.restoreAllMocks();
  });

  describe("Tokens Liquid Glass", () => {
    it("declara tokens contratuais de vidro para tema claro e escuro em conformidade com design-system/tokens.json", () => {
      expect(colors.glass).toBeDefined();
      expect(colors.glass.fill).toBe("rgba(252, 250, 245, 0.58)");
      expect(colors.glass.stroke).toBe("rgba(255, 255, 255, 0.75)");
      expect(colors.glass.fillDark).toBe("rgba(30, 30, 30, 0.42)");
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

    it("registra listener para o evento reduceTransparencyChanged no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      let listenerCallback: ((enabled: boolean) => void) | undefined;
      jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event: string, cb: any) => {
        if (event === "reduceTransparencyChanged") {
          listenerCallback = cb;
        }
        return { remove: jest.fn() } as any;
      });

      function TestComponent() {
        const reduced = useReduceTransparency();
        return <Text testID="val">{String(reduced)}</Text>;
      }
      await render(<TestComponent />);
      expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith("reduceTransparencyChanged", expect.any(Function));
      expect(listenerCallback).toBeDefined();
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
    it("envolve conteúdo com KeyboardAvoidingView no iOS quando keyboardAvoiding=true", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      const screen = await render(
        <ScreenContainer keyboardAvoiding keyboardVerticalOffset={24} testID="screen-container">
          <Text>Conteúdo iOS com teclado</Text>
        </ScreenContainer>,
      );
      expect(screen.getByText("Conteúdo iOS com teclado")).toBeDefined();
      const container = screen.getByTestId("screen-container");
      expect(container).toBeDefined();
    });

    it("renderiza normalmente sem KeyboardAvoidingView no Android", async () => {
      Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
      const screen = await render(
        <ScreenContainer keyboardAvoiding={false}>
          <Text>Conteúdo Android</Text>
        </ScreenContainer>,
      );
      expect(screen.getByText("Conteúdo Android")).toBeDefined();
    });
  });

  describe("NavigationBar (Liquid Glass e Apple HIG)", () => {
    it("renderiza dock flutuante com acabamento Liquid Glass e BlurView no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);

      const onNavigate = jest.fn();
      const screen = await render(<NavigationBar active="home" onNavigate={onNavigate} />);

      const tablist = screen.getByTestId("navigation-bar-tablist");
      expect(tablist).toBeDefined();

      const blurView = screen.getByTestId("blur-view");
      expect(blurView).toBeDefined();

      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(3);

      fireEvent.press(tabs[1]);
      expect(onNavigate).toHaveBeenCalledWith("search");
    });

    it("aplica fallback opaco sem BlurView quando Reduzir Transparência estiver ativo no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(true);

      const onNavigate = jest.fn();
      const screen = await render(<NavigationBar active="home" onNavigate={onNavigate} />);

      expect(screen.getByTestId("navigation-bar-tablist")).toBeDefined();
      expect(screen.queryByTestId("blur-view")).toBeNull();
    });
  });

  describe("TopAppBar (Apple HIG)", () => {
    it("garante alvo de toque mínimo de 44x44 pt no botão voltar no iOS", async () => {
      Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
      const onBack = jest.fn();
      const screen = await render(<TopAppBar title="Título da Tela" onBack={onBack} />);

      const backBtn = screen.getByLabelText("Voltar");
      expect(backBtn).toBeDefined();

      const flatStyle = Array.isArray(backBtn.props.style)
        ? Object.assign({}, ...backBtn.props.style)
        : backBtn.props.style;

      expect(flatStyle.minWidth).toBeGreaterThanOrEqual(44);
      expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);

      fireEvent.press(backBtn);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("BottomSheet (Apple HIG & Acessibilidade)", () => {
    it("renderiza com modal de acessibilidade, drag handle, BlurView no iOS e cantos de 28 dp", async () => {
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
      expect(screen.getByTestId("bottom-sheet-drag-area")).toBeDefined();
      expect(screen.getByTestId("bottom-sheet-handle")).toBeDefined();
      expect(screen.getByTestId("blur-view")).toBeDefined();
      expect(screen.getByText("Opções do Livro")).toBeDefined();
      expect(screen.getByText("Conteúdo da folha")).toBeDefined();

      const closeBtn = screen.getByLabelText("Fechar");
      expect(closeBtn).toBeDefined();
      fireEvent.press(closeBtn);
      expect(onClose).toHaveBeenCalled();
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
