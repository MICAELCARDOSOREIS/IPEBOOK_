import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { tokens } from "@/view/tokens";

export type ExpressivePressOptions = {
  disabled?: boolean;
  /** Escala atingida enquanto o elemento está pressionado (padrão: 0.96). */
  pressedScale?: number;
};

export type ExpressivePressResult = {
  scale: Animated.Value;
  isPressed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
};

/**
 * Feedback tátil-visual do Material 3 Expressive (Spec 109 / ADR 0084):
 * comprime suavemente o componente com física de mola (`tokens.spring.spatialFast`) e expõe
 * `isPressed` para metamorfose de forma (`tokens.shapeMorph`), respeitando "reduzir movimento".
 */
export function useExpressivePress({
  disabled = false,
  pressedScale = 0.96,
}: ExpressivePressOptions = {}): ExpressivePressResult {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (active) reduceMotionRef.current = Boolean(reduced);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const animateScale = useCallback(
    (toValue: number) => {
      if (reduceMotionRef.current) {
        scale.setValue(toValue);
        return;
      }
      Animated.spring(scale, {
        toValue,
        tension: tokens.spring.spatialFast.tension,
        friction: tokens.spring.spatialFast.friction,
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const onPressIn = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    animateScale(pressedScale);
  }, [disabled, pressedScale, animateScale]);

  const onPressOut = useCallback(() => {
    setIsPressed(false);
    animateScale(1);
  }, [animateScale]);

  return { scale, isPressed, onPressIn, onPressOut };
}

export default useExpressivePress;
