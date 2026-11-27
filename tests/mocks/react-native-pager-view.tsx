import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, type ViewProps } from "react-native";

export type PagerViewOnPageSelectedEvent = {
  nativeEvent: { position: number };
};

export type PagerViewOnPageScrollEvent = {
  nativeEvent: { position: number; offset: number };
};

export type PagerViewOnPageScrollStateChangedEvent = {
  nativeEvent: { pageScrollState: "idle" | "dragging" | "settling" };
};

export type PagerViewRef = {
  setPage: (selectedPage: number) => void;
  setPageWithoutAnimation: (selectedPage: number) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
};

type PagerViewProps = ViewProps & {
  initialPage?: number;
  scrollEnabled?: boolean;
  offscreenPageLimit?: number;
  overdrag?: boolean;
  onPageSelected?: (event: PagerViewOnPageSelectedEvent) => void;
  onPageScroll?: (event: PagerViewOnPageScrollEvent) => void;
  onPageScrollStateChanged?: (event: PagerViewOnPageScrollStateChangedEvent) => void;
  children?: React.ReactNode;
};

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(function PagerViewMock(
  {
    initialPage = 0,
    onPageSelected,
    onPageScroll,
    onPageScrollStateChanged,
    children,
    ...rest
  },
  ref,
) {
  const [, setCurrentPage] = useState(initialPage);

  useImperativeHandle(ref, () => ({
    setPage(page: number) {
      setCurrentPage(page);
      onPageScroll?.({ nativeEvent: { position: page, offset: 0 } });
      onPageSelected?.({ nativeEvent: { position: page } });
    },
    setPageWithoutAnimation(page: number) {
      setCurrentPage(page);
      onPageScroll?.({ nativeEvent: { position: page, offset: 0 } });
      onPageSelected?.({ nativeEvent: { position: page } });
    },
    setScrollEnabled() {
      // no-op em ambiente de teste
    },
  }));

  return (
    <View
      testID={rest.testID ?? "pager-view"}
      {...rest}
      // Exposto para testes dispararem gestos simulados diretamente
      {...({ onPageSelected, onPageScroll, onPageScrollStateChanged } as Record<string, unknown>)}
    >
      {children}
    </View>
  );
});

export default PagerView;
