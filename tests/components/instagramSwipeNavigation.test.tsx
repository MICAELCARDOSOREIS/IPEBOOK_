import { act, fireEvent, render } from "@testing-library/react-native";
import { Animated, Platform, Pressable, Text } from "react-native";
import type { Book } from "@/model/entities/book";
import { getStackScreenOptions } from "@/view/stackScreenOptions";
import {
  indexToMainTab,
  isMainTabsSwipeActive,
  mainTabsScrollProgress,
  mainTabToIndex,
  markMainTabsScrollState,
  resetMainTabsStateForTesting,
  selectMainTab,
  triggerMainTabScrollToTop,
  getMainTabsSnapshot,
} from "@/view/mainTabsState";
import { MainTabsPager } from "@/view/components/MainTabsPager";
import { NavigationBar } from "@/view/components/NavigationBar";
import { SearchBookCard } from "@/view/search/SearchBookCard";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";

describe("Spec 144 — Navegação por arraste estilo Instagram e transições direcionais", () => {
  beforeEach(() => {
    resetMainTabsStateForTesting();
  });

  describe("getStackScreenOptions", () => {
    const originalOS = Platform.OS;
    afterEach(() => {
      Platform.OS = originalOS;
    });

    it("usa slide_from_right com gesto interativo em telas de detalhe no Android e fullScreenGestureEnabled no iOS", () => {
      Platform.OS = "android";
      const androidOpts = getStackScreenOptions("livro/[id]", "#FCFAF5", false);
      expect(androidOpts.animation).toBe("slide_from_right");
      expect(androidOpts.gestureEnabled).toBe(true);
      expect(androidOpts.fullScreenGestureEnabled).toBeUndefined();

      Platform.OS = "ios";
      const iosOpts = getStackScreenOptions("conversa/[id]", "#FCFAF5", false);
      expect(iosOpts.animation).toBe("slide_from_right");
      expect(iosOpts.gestureEnabled).toBe(true);
      expect(iosOpts.fullScreenGestureEnabled).toBe(true);
    });

    it("usa slide_from_bottom em fluxos modais (anunciar, editar, denunciar)", () => {
      Platform.OS = "android";
      expect(getStackScreenOptions("anunciar", "#FCFAF5", false).animation).toBe("slide_from_bottom");
      expect(getStackScreenOptions("editar-anuncio/[id]", "#FCFAF5", false).animation).toBe("slide_from_right");
      expect(getStackScreenOptions("denunciar/[id]", "#FCFAF5", false).animation).toBe("slide_from_bottom");
    });

    it("mantém fade leve em rotas raiz/acesso e na Web, e none quando Reduce Motion está ativo", () => {
      Platform.OS = "android";
      expect(getStackScreenOptions("index", "#FCFAF5", false).animation).toBe("fade");
      expect(getStackScreenOptions("entrar", "#FCFAF5", false).animation).toBe("fade");
      expect(getStackScreenOptions("livro/[id]", "#FCFAF5", true).animation).toBe("none");

      Platform.OS = "web";
      expect(getStackScreenOptions("livro/[id]", "#FCFAF5", false).animation).toBe("fade");
    });
  });

  describe("mainTabsState e MainTabsPager", () => {
    it("mapeia abas e índices e incrementa scrollToTopTick corretamente", () => {
      expect(mainTabToIndex("home")).toBe(0);
      expect(mainTabToIndex("search")).toBe(1);
      expect(mainTabToIndex("shelf")).toBe(2);
      expect(indexToMainTab(0)).toBe("home");
      expect(indexToMainTab(1)).toBe("search");
      expect(indexToMainTab(2)).toBe("shelf");

      triggerMainTabScrollToTop("home");
      expect(getMainTabsSnapshot().scrollToTopTicks.home).toBe(1);
      expect(getMainTabsSnapshot().scrollToTopTicks.search).toBe(0);
    });

    it("monta Início imediatamente e carrega Explorar/Estante sob demanda mantendo vivas após arraste", async () => {
      const screen = await render(
        <MainTabsPager
          homeContent={<Text>Tela Início</Text>}
          searchContent={<Text>Tela Explorar</Text>}
          shelfContent={<Text>Tela Estante</Text>}
        />,
      );

      expect(getMainTabsSnapshot().pagerMounted).toBe(true);
      expect(screen.getByText("Tela Início")).toBeDefined();
      expect(screen.queryByText("Tela Explorar")).toBeNull();
      expect(screen.queryByText("Tela Estante")).toBeNull();

      // Simula início de arraste para a direita (Início -> Explorar)
      const pager = screen.getByTestId("main-tabs-pager");
      await act(async () => {
        pager.props.onPageScroll({ nativeEvent: { position: 0, offset: 0.35 } });
      });
      expect(screen.getByText("Tela Explorar")).toBeDefined();

      // Completa a virada para Explorar
      await act(async () => {
        pager.props.onPageSelected({ nativeEvent: { position: 1 } });
      });
      expect(getMainTabsSnapshot().activeTab).toBe("search");

      // Troca programática pelo dock para Estante sem desmontar/re-registrar o pager
      const listener = jest.fn();
      const unsub = (await import("@/view/mainTabsState")).subscribeMainTabs(listener);
      await act(async () => {
        selectMainTab("shelf", true);
      });
      unsub();
      expect(getMainTabsSnapshot().pagerMounted).toBe(true);
      expect(getMainTabsSnapshot().activeTab).toBe("shelf");
      expect(screen.getByText("Tela Estante")).toBeDefined();
      // Apenas 1 emissão de mudança de estado (sem piscar pagerMounted true -> false -> true)
      expect(listener).toHaveBeenCalledTimes(1);
      // Início e Explorar permanecem montadas em memória (preservando rolagem)
      expect(screen.getByText("Tela Início")).toBeDefined();
      expect(screen.getByText("Tela Explorar")).toBeDefined();
    });
  });

  describe("NavigationBar sincronizada 1:1 e reselect", () => {
    it("aceita scrollProgress contínuo e chama onReselectActive ao tocar na aba já ativa", async () => {
      const onNavigate = jest.fn();
      const onReselectActive = jest.fn();
      const progress = new Animated.Value(0);

      const screen = await render(
        <ThemeProvider>
          <NavigationBar
            active="home"
            onNavigate={onNavigate}
            onReselectActive={onReselectActive}
            scrollProgress={progress}
          />
        </ThemeProvider>,
      );

      expect(screen.getByTestId("navigation-bar-active-pill")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByRole("tab", { name: "Início" }));
      });
      expect(onReselectActive).toHaveBeenCalledWith("home");
      expect(onNavigate).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.press(screen.getByRole("tab", { name: "Explorar" }));
      });
      expect(onNavigate).toHaveBeenCalledWith("search");
      expect(mainTabsScrollProgress).toBeDefined();
    });
  });

  describe("proteção contra abertura acidental de livro durante arraste", () => {
    const sampleBook: Book = {
      id: "book-swipe-1",
      ownerId: "owner-1",
      title: "Grande Sertão: Veredas",
      author: "Guimarães Rosa",
      modality: "trade",
      price: undefined,
      photos: [],
      neighborhood: "Centro",
      status: "available",
      category: "Literatura",
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("bloqueia useGuardedPress durante arraste/settling e no cooldown imediato, liberando após encerrar", async () => {
      let now = 10_000;
      jest.spyOn(Date, "now").mockImplementation(() => now);
      const onOpen = jest.fn();

      function GuardedProbe() {
        const guarded = useGuardedPress(() => onOpen());
        return (
          <Pressable testID="guarded-probe" onPress={guarded}>
            <Text>Abrir</Text>
          </Pressable>
        );
      }

      const screen = await render(
        <MainTabsPager
          homeContent={<GuardedProbe />}
          searchContent={<Text>Explorar</Text>}
          shelfContent={<Text>Estante</Text>}
        />,
      );

      const pager = screen.getByTestId("main-tabs-pager");
      const probe = screen.getByTestId("guarded-probe");

      // Toque normal antes do arraste abre imediatamente
      await act(async () => {
        fireEvent.press(probe);
      });
      expect(onOpen).toHaveBeenCalledTimes(1);

      // Durante dragging e settling, toques são suprimidos
      await act(async () => {
        pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: "dragging" } });
      });
      expect(isMainTabsSwipeActive()).toBe(true);
      await act(async () => {
        fireEvent.press(probe);
      });
      expect(onOpen).toHaveBeenCalledTimes(1);

      await act(async () => {
        pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: "settling" } });
        fireEvent.press(probe);
      });
      expect(onOpen).toHaveBeenCalledTimes(1);

      // Ao voltar a idle, mantém breve cooldown contra toque residual do dedo levantando
      await act(async () => {
        pager.props.onPageScrollStateChanged({ nativeEvent: { pageScrollState: "idle" } });
      });
      expect(isMainTabsSwipeActive()).toBe(true);
      await act(async () => {
        fireEvent.press(probe);
      });
      expect(onOpen).toHaveBeenCalledTimes(1);

      // Depois do cooldown (300ms), toque normal volta a abrir instantaneamente
      now += 300;
      expect(isMainTabsSwipeActive()).toBe(false);
      await act(async () => {
        fireEvent.press(probe);
      });
      expect(onOpen).toHaveBeenCalledTimes(2);
    });

    it("ignora toque no SearchBookCard quando o dedo arrastou lateralmente ou o pager está em arraste", async () => {
      const onPress = jest.fn();
      const screen = await render(
        <ThemeProvider>
          <SearchBookCard
            item={sampleBook}
            wideWeb={false}
            gridColumns={1}
            userId="u1"
            onPress={onPress}
            onFavoriteToggle={jest.fn()}
          />
        </ThemeProvider>,
      );

      const cardButton = screen.getByLabelText("Ver detalhe de Grande Sertão: Veredas, Guimarães Rosa em Centro");
      const chevronButton = screen.getByLabelText("Abrir Grande Sertão: Veredas");

      // Arraste horizontal (> 10px) no card principal não abre o livro
      await act(async () => {
        fireEvent(cardButton, "pressIn", { nativeEvent: { pageX: 280, pageY: 320 } });
        fireEvent(cardButton, "press", { nativeEvent: { pageX: 255, pageY: 322 } });
      });
      expect(onPress).not.toHaveBeenCalled();

      // Arraste horizontal na seta da borda direita também não abre o livro
      await act(async () => {
        fireEvent(chevronButton, "pressIn", { nativeEvent: { pageX: 350, pageY: 320 } });
        fireEvent(chevronButton, "press", { nativeEvent: { pageX: 332, pageY: 321 } });
      });
      expect(onPress).not.toHaveBeenCalled();

      // Pager em estado dragging bloqueia toque no card
      markMainTabsScrollState("dragging");
      await act(async () => {
        fireEvent(cardButton, "pressIn", { nativeEvent: { pageX: 200, pageY: 320 } });
        fireEvent(cardButton, "press", { nativeEvent: { pageX: 201, pageY: 320 } });
      });
      expect(onPress).not.toHaveBeenCalled();

      // Toque limpo com pager idle abre normalmente
      resetMainTabsStateForTesting();
      await act(async () => {
        fireEvent(cardButton, "pressIn", { nativeEvent: { pageX: 200, pageY: 320 } });
        fireEvent(cardButton, "press", { nativeEvent: { pageX: 202, pageY: 321 } });
      });
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith("book-swipe-1");
    });
  });
});
