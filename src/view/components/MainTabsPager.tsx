import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { triggerHaptic } from "@/view/haptics";
import {
  getMainTabsSnapshot,
  indexToMainTab,
  type MainTabsScrollState,
  mainTabsScrollProgress,
  mainTabToIndex,
  markMainTabsScrollOffset,
  markMainTabsScrollState,
  registerMainTabsPager,
  syncMainTabFromPager,
} from "@/view/mainTabsState";

export type MainTabsPagerProps = {
  homeContent: ReactNode;
  searchContent: ReactNode;
  shelfContent: ReactNode;
};

/**
 * Contêiner nativo das 3 abas principais (`Início` ↔ `Explorar` ↔ `Estante`, Spec 144 / ADR 0120).
 * Usa `react-native-pager-view` (`ViewPager2` no Android / `UIPageViewController` no iOS) para
 * arraste horizontal 1:1 a 60-120fps sem brigar com carrosséis horizontais nem recarregar a tela.
 *
 * Não assina `useMainTabsState()` de propósito: evita desmontar/re-registrar o controlador
 * e re-renderizar o `RootLayout` durante a animação de troca ao tocar na tabbar.
 */
export function MainTabsPager({
  homeContent,
  searchContent,
  shelfContent,
}: MainTabsPagerProps) {
  const initialIndexRef = useRef(mainTabToIndex(getMainTabsSnapshot().activeTab));
  const pagerRef = useRef<PagerView>(null);
  const lastSelectedIndex = useRef(initialIndexRef.current);
  const suppressNextHapticRef = useRef(false);
  const programmaticSlideRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Início monta imediatamente; Explorar e Estante pré-montam em tempo ocioso após a 1ª pintura
  // (ou imediatamente no início do arraste/toque), eliminando travamentos ao tocar na tabbar.
  const initialMounted: Record<number, boolean> = {
    0: true,
    [initialIndexRef.current]: true,
  };
  const mountedPagesRef = useRef<Record<number, boolean>>(initialMounted);
  const [mountedPages, setMountedPages] = useState<Record<number, boolean>>(initialMounted);

  const ensurePageMounted = useCallback((index: number) => {
    if (mountedPagesRef.current[index]) return;
    const next = { ...mountedPagesRef.current, [index]: true };
    mountedPagesRef.current = next;
    setMountedPages(next);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((enabled) => {
        if (!active) return;
        const value = Boolean(enabled);
        reduceMotionRef.current = value;
        setReduceMotion(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo?.addEventListener?.("reduceMotionChanged", (enabled) => {
      const value = Boolean(enabled);
      reduceMotionRef.current = value;
      setReduceMotion(value);
    });
    return () => {
      active = false;
      sub?.remove?.();
    };
  }, []);

  // Pré-aquece as abas vizinhas em tempo ocioso após a 1ª pintura,
  // evitando montagem pesada no meio da animação de toque da tabbar.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const prewarm = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        if (mountedPagesRef.current[0] && mountedPagesRef.current[1] && mountedPagesRef.current[2]) {
          return;
        }
        const all = { 0: true, 1: true, 2: true };
        mountedPagesRef.current = all;
        setMountedPages(all);
      }, 350);
    };

    const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const cic = (globalThis as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
    if (typeof ric === "function") {
      idleId = ric(prewarm);
    } else {
      prewarm();
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (idleId !== undefined && typeof cic === "function") cic(idleId);
    };
  }, []);

  useEffect(() => {
    mainTabsScrollProgress.setValue(initialIndexRef.current);
    registerMainTabsPager({
      setPage(index: number, animated: boolean) {
        ensurePageMounted(index);
        suppressNextHapticRef.current = true;
        programmaticSlideRef.current = animated && !reduceMotionRef.current;
        if (animated && !reduceMotionRef.current) {
          pagerRef.current?.setPage?.(index);
        } else {
          pagerRef.current?.setPageWithoutAnimation?.(index);
          mainTabsScrollProgress.setValue(index);
        }
      },
    });
    return () => {
      markMainTabsScrollState("idle");
      registerMainTabsPager(null);
    };
  }, [ensurePageMounted]);

  const handlePageScrollStateChanged = useCallback(
    (event: { nativeEvent: { pageScrollState: MainTabsScrollState } }) => {
      const nextState = event.nativeEvent.pageScrollState;
      if (nextState === "dragging") {
        programmaticSlideRef.current = false;
      }
      markMainTabsScrollState(nextState);
      if (nextState === "idle") {
        programmaticSlideRef.current = false;
      }
    },
    [],
  );

  const handlePageScroll = useCallback(
    (event: { nativeEvent: { position: number; offset: number } }) => {
      const { position, offset } = event.nativeEvent;
      markMainTabsScrollOffset(offset, programmaticSlideRef.current);
      const progress = Math.max(0, Math.min(2, position + offset));
      mainTabsScrollProgress.setValue(progress);

      if (offset > 0.04 && position + 1 <= 2 && !mountedPagesRef.current[position + 1]) {
        ensurePageMounted(position + 1);
      } else if (offset > 0 && position >= 0 && !mountedPagesRef.current[position]) {
        ensurePageMounted(position);
      }
    },
    [ensurePageMounted],
  );

  const handlePageSelected = useCallback(
    (event: { nativeEvent: { position: number } }) => {
      const position = event.nativeEvent.position;
      ensurePageMounted(position);
      mainTabsScrollProgress.setValue(position);
      if (lastSelectedIndex.current !== position) {
        lastSelectedIndex.current = position;
        if (!suppressNextHapticRef.current) {
          triggerHaptic("selection");
        }
      }
      suppressNextHapticRef.current = false;
      syncMainTabFromPager(indexToMainTab(position));
    },
    [ensurePageMounted],
  );

  return (
    <PagerView
      ref={pagerRef}
      testID="main-tabs-pager"
      style={styles.pager}
      initialPage={initialIndexRef.current}
      offscreenPageLimit={2}
      overdrag={false}
      scrollEnabled={!reduceMotion}
      onPageScroll={handlePageScroll}
      onPageScrollStateChanged={handlePageScrollStateChanged}
      onPageSelected={handlePageSelected}
    >
      <View key="home" style={styles.page} collapsable={false}>
        {mountedPages[0] ? homeContent : null}
      </View>
      <View key="search" style={styles.page} collapsable={false}>
        {mountedPages[1] ? searchContent : null}
      </View>
      <View key="shelf" style={styles.page} collapsable={false}>
        {mountedPages[2] ? shelfContent : null}
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: { flex: 1 },
});

export default MainTabsPager;
