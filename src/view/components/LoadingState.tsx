import { useEffect, useMemo, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import {
  LoadingSkeletonContent,
  type LoadingSkeletonVariant,
} from "@/view/components/LoadingSkeletonVariants";

export type { LoadingSkeletonVariant };

export type LoadingStateProps = {
  /** Nome acessível, sem reticências (ex: "Carregando livros"). */
  label?: string;
  /** Texto oculto para leitores de tela (padrão: `${label}…`). */
  srText?: string;
  /** Formato estrutural das caixinhas de esqueleto (Spec 132 / ADR 0103). */
  variant?: LoadingSkeletonVariant;
};

/**
 * Estado de carregamento com Skeleton Loading estrutural (Spec 132 / ADR 0103):
 * desenha caixinhas pulsantes com a estrutura visual fiel da tela sem textos aparentes,
 * preservando rótulo e texto oculto para leitores de tela (TalkBack / VoiceOver).
 */
export function LoadingState({
  label = "Carregando",
  srText,
  variant = "list",
}: LoadingStateProps) {
  const styles = useMemo(() => createStyles(), []);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (reduced) {
          pulseAnim.setValue(0.75);
          return;
        }
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.92,
              duration: 680,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.45,
              duration: 680,
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
      })
      .catch(() => {
        pulseAnim.setValue(0.75);
      });
    return () => {
      loop?.stop();
    };
  }, [pulseAnim]);

  return (
    <View
      testID={`loading-skeleton-${variant}`}
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      {/* Nó acessível para leitores de tela e contratos de acessibilidade, sem exibir texto visual */}
      <View accessibilityLabel={label} style={styles.srOnly}>
        <Text style={styles.srOnlyText}>{srText ?? `${label}…`}</Text>
      </View>

      <Animated.View style={[styles.skeletonRoot, { opacity: pulseAnim }]}>
        <LoadingSkeletonContent variant={variant} />
      </Animated.View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      width: "100%",
      paddingVertical: tokens.spacing[12],
    },
    srOnly: {
      position: "absolute",
      width: 1,
      height: 1,
      opacity: 0,
      overflow: "hidden",
    },
    srOnlyText: {
      fontSize: 1,
      color: "transparent",
    },
    skeletonRoot: {
      width: "100%",
    },
  });
}

export default LoadingState;
