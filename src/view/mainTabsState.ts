import { useSyncExternalStore } from "react";
import { Animated } from "react-native";

export type MainDockTab = "home" | "search" | "shelf";
export type MainTabsScrollState = "idle" | "dragging" | "settling";

export const MAIN_DOCK_TABS: readonly MainDockTab[] = ["home", "search", "shelf"];
const SWIPE_TAP_COOLDOWN_MS = 260;

export function mainTabToIndex(tab: MainDockTab): number {
  const idx = MAIN_DOCK_TABS.indexOf(tab);
  return idx >= 0 ? idx : 0;
}

export function indexToMainTab(index: number): MainDockTab {
  return MAIN_DOCK_TABS[index] ?? "home";
}

type TabsSnapshot = {
  activeTab: MainDockTab;
  pagerMounted: boolean;
  scrollToTopTicks: Record<MainDockTab, number>;
};

type PagerController = {
  setPage: (index: number, animated: boolean) => void;
};

let snapshot: TabsSnapshot = {
  activeTab: "home",
  pagerMounted: false,
  scrollToTopTicks: { home: 0, search: 0, shelf: 0 },
};

let controller: PagerController | null = null;
const listeners = new Set<() => void>();
let pagerScrollState: MainTabsScrollState = "idle";
let draggingDuringTransition = false;
let lastDragAt = 0;
let lastScrollOffsetAt = 0;

/**
 * Progresso contínuo (0..2) do pager nativo das 3 abas principais (Spec 144 / ADR 0120).
 * Atualizado em tempo real pelo `onPageScroll` do `PagerView` para deslizar a pílula do dock 1:1.
 */
export const mainTabsScrollProgress = new Animated.Value(0);

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeMainTabs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMainTabsSnapshot(): TabsSnapshot {
  return snapshot;
}

export function useMainTabsState(): TabsSnapshot {
  return useSyncExternalStore(subscribeMainTabs, getMainTabsSnapshot, getMainTabsSnapshot);
}

export function registerMainTabsPager(nextController: PagerController | null) {
  controller = nextController;
  const pagerMounted = nextController !== null;
  if (snapshot.pagerMounted !== pagerMounted) {
    snapshot = { ...snapshot, pagerMounted };
    emit();
  }
}

export function syncMainTabFromPager(tab: MainDockTab) {
  if (snapshot.activeTab === tab) return;
  snapshot = { ...snapshot, activeTab: tab };
  emit();
}

/**
 * Solicita a troca da aba ativa no pager nativo (ou apenas atualiza o estado se ainda não montado).
 * Quando o pager está montado com animação, delega diretamente ao `ViewPager2`/`UIPageViewController`
 * e deixa `onPageSelected` sincronizar `activeTab` ao concluir a transição — evitando re-renderizar
 * o `RootLayout` no meio da animação de troca pela tabbar (Spec 144).
 */
export function selectMainTab(tab: MainDockTab, animated = true): boolean {
  const index = mainTabToIndex(tab);
  if (controller) {
    controller.setPage(index, animated);
    if (!animated && snapshot.activeTab !== tab) {
      snapshot = { ...snapshot, activeTab: tab };
      emit();
    }
    return true;
  }
  if (snapshot.activeTab !== tab) {
    snapshot = { ...snapshot, activeTab: tab };
    emit();
  }
  mainTabsScrollProgress.setValue(index);
  return false;
}

/**
 * Aciona rolagem suave para o topo da aba quando o leitor toca na aba já selecionada (estilo Instagram).
 */
export function triggerMainTabScrollToTop(tab: MainDockTab) {
  snapshot = {
    ...snapshot,
    scrollToTopTicks: {
      ...snapshot.scrollToTopTicks,
      [tab]: snapshot.scrollToTopTicks[tab] + 1,
    },
  };
  emit();
}

/**
 * Registra o estado de rolagem do pager nativo (`idle` | `dragging` | `settling`) para evitar
 * toques acidentais em cards enquanto o leitor arrasta o dedo entre as abas principais.
 */
export function markMainTabsScrollState(nextState: MainTabsScrollState) {
  const now = Date.now();
  if (nextState === "dragging") {
    pagerScrollState = "dragging";
    draggingDuringTransition = true;
    lastDragAt = now;
    return;
  }
  if (nextState === "settling") {
    pagerScrollState = "settling";
    if (draggingDuringTransition) {
      lastDragAt = now;
    }
    return;
  }
  if (draggingDuringTransition) {
    lastDragAt = now;
  }
  pagerScrollState = "idle";
  draggingDuringTransition = false;
}

/**
 * Registra movimento horizontal contínuo do pager durante arraste manual (offset intermediário).
 */
export function markMainTabsScrollOffset(offset: number, isProgrammatic = false) {
  if (!isProgrammatic && offset > 0.01 && offset < 0.99) {
    lastScrollOffsetAt = Date.now();
  }
}

/**
 * Indica se há um arraste horizontal de aba em andamento ou encerrado há poucos milissegundos.
 * Usado para suprimir aberturas acidentais de livros ao deslizar entre Início, Explorar e Estante.
 */
export function isMainTabsSwipeActive(cooldownMs = SWIPE_TAP_COOLDOWN_MS): boolean {
  if (pagerScrollState !== "idle") return true;
  const lastActivity = Math.max(lastDragAt, lastScrollOffsetAt);
  return lastActivity > 0 && Date.now() - lastActivity < cooldownMs;
}

export function resetMainTabsStateForTesting() {
  controller = null;
  pagerScrollState = "idle";
  draggingDuringTransition = false;
  lastDragAt = 0;
  lastScrollOffsetAt = 0;
  snapshot = {
    activeTab: "home",
    pagerMounted: false,
    scrollToTopTicks: { home: 0, search: 0, shelf: 0 },
  };
  mainTabsScrollProgress.setValue(0);
  emit();
}
