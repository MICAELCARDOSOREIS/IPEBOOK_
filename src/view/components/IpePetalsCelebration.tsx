import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import type { IpePetalVariant } from "@/view/components/ipeCelebrationController";
import ipeFloradaNatural from "@/view/assets/ipe-florada-natural.png";
import ipeFlorTrombetaNatural from "@/view/assets/ipe-flor-trombeta-natural.png";
import ipePetalaNatural from "@/view/assets/ipe-petala-natural.png";
import ipeFolhaNatural from "@/view/assets/ipe-folha-natural.png";

const PETAL_COUNT = 38;
const ENTRY_PETAL_COUNT = 16;
const BOTTOM_NAV_HEIGHT = 80;

export type IpePetalsCelebrationProps = {
  /** Se a animação está ativa (padrão: true). */
  active?: boolean;
  /** Variação curta de entrada ou florada completa disparada pela pessoa. */
  variant?: IpePetalVariant;
  /** Chamado quando a animação termina naturalmente. */
  onComplete?: () => void;
  /** Identificador para testes. */
  testID?: string;
  /** Mensagem comemorativa flutuante de acolhimento (opcional). */
  message?: string;
  /** Distância opcional do rodapé onde as pétalas devem pousar (em dp/px). */
  bottomOffset?: number;
};

type PetalConfig = {
  id: number;
  startXRatio: number;
  driftX: number;
  width: number;
  height: number;
  delay: number;
  duration: number;
  rotation: number;
  tiltX: number;
  tiltY: number;
  spinDirection: number;
  depthScale: number;
  opacity: number;
  imageType: "blossom" | "trumpet" | "petal" | "leaf";
  layer: "foreground" | "midground" | "background";
  /** Posição onde a peça pousa por um instante antes de desaparecer. */
  restingPlace: "none" | "topBar" | "bottomBar";
  restingAngle: number;
  restingYOffset: number;
};

/** Variação determinística: a florada mantém o mesmo ritmo entre renderizações. */
function variation(index: number, salt: number): number {
  const value = Math.sin((index + 1) * 127.1 + (salt + 1) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Florada de Ipê-Amarelo: entrada suave na primeira visita e celebração completa
 * em ações iniciadas pela pessoa, com pétalas douradas ao vento.
 * Puramente visual, sem interferir na árvore de acessibilidade nem no toque.
 */
export function IpePetalsCelebration({
  active = true,
  variant = "celebration",
  onComplete,
  testID = "ipe-petals-celebration",
  message,
  bottomOffset,
}: IpePetalsCelebrationProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 360;
  const screenHeight = windowHeight > 0 ? windowHeight : 700;
  const [layoutHeight, setLayoutHeight] = useState(screenHeight);
  const effectiveHeight = layoutHeight > 100 ? layoutHeight : screenHeight;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Gera configs determinísticas com variações orgânicas de tamanho, vento e profundidade.
  const petals = useMemo<PetalConfig[]>(() => {
    const count = variant === "entry" ? ENTRY_PETAL_COUNT : PETAL_COUNT;
    return Array.from({ length: count }, (_, index) => {
      const step = (index + 0.5) / count;
      const depth = variation(index, 1);
      const layer: PetalConfig["layer"] = depth < 0.25 ? "foreground" : depth < 0.7 ? "midground" : "background";

      // Mantém algumas folhas verdes junto das flores e pétalas em cada variação.
      const imageRoll = variation(index, 10);
      let imageType: PetalConfig["imageType"];
      if (variant === "entry") {
        imageType = imageRoll < 0.2
          ? "blossom"
          : imageRoll < 0.62
            ? "trumpet"
            : imageRoll < 0.86
              ? "leaf"
              : "petal";
      } else if (imageRoll < 0.24) {
        imageType = "blossom";
      } else if (imageRoll < 0.62) {
        imageType = "trumpet";
      } else if (imageRoll < 0.82) {
        imageType = "leaf";
      } else {
        imageType = "petal";
      }

      let baseWidth = layer === "foreground" ? 40 : layer === "midground" ? 34 : 27;
      let ratio = 1.0;

      if (imageType === "blossom") {
        baseWidth = layer === "foreground" ? 56 : layer === "midground" ? 47 : 38;
        ratio = 1.0;
      } else if (imageType === "trumpet") {
        baseWidth = layer === "foreground" ? 48 : layer === "midground" ? 41 : 33;
        ratio = 1.0;
      } else if (imageType === "petal") {
        baseWidth = layer === "foreground" ? 38 : layer === "midground" ? 32 : 25;
        ratio = 1.34;
      } else if (imageType === "leaf") {
        baseWidth = layer === "foreground" ? 34 : layer === "midground" ? 29 : 23;
        ratio = 1.0;
      }

      const width = baseWidth + (index % 3) * 2;
      const height = Math.round(width * ratio);

      // Algumas peças pousam brevemente na barra superior ou inferior e depois somem.
      const settles = variation(index, 11) < (variant === "entry" ? 0.2 : 0.4);
      const restingPlace: PetalConfig["restingPlace"] = !settles
        ? "none"
        : variation(index, 15) < 0.4
          ? "topBar"
          : "bottomBar";
      const randomAngle = variation(index, 2);
      const restingAngle = imageType === "petal" || imageType === "leaf"
        ? randomAngle * 360
        : (randomAngle - 0.5) * 70;
      const restingYOffset = Math.round((variation(index, 3) - 0.5) * 24);
      const driftMagnitude = variant === "entry" ? 20 + variation(index, 4) * 30 : 28 + variation(index, 4) * 42;
      const windFactor = imageType === "petal" ? 1 : imageType === "leaf" ? 1.12 : 0.68;
      const tiltRange = imageType === "petal" ? 44 : imageType === "leaf" ? 48 : imageType === "blossom" ? 26 : 34;
      const startXRatio = Math.max(0.015, Math.min(0.985, step + (variation(index, 5) - 0.5) * 0.085));
      const baseDuration = layer === "foreground" ? 0 : layer === "midground" ? 280 : 560;
      const typeDuration = imageType === "blossom" ? 0.86 : imageType === "trumpet" ? 0.92 : imageType === "leaf" ? 0.96 : 1.08;
      const duration = (variant === "entry"
        ? 2000 + baseDuration * 0.35 + variation(index, 6) * 400
        : 3300 + baseDuration * 0.65 + variation(index, 6) * 550) * typeDuration
        + (restingPlace === "none" ? 0 : 750 + variation(index, 16) * 300);

      return {
        id: index,
        startXRatio,
        driftX: (variation(index, 7) - 0.5) * 2 * driftMagnitude * windFactor,
        width,
        height,
        delay: variant === "entry"
          ? variation(index, 8) * 460
          : variation(index, 8) * 900,
        duration,
        rotation: imageType === "petal" || imageType === "leaf"
          ? randomAngle * 360
          : (randomAngle - 0.5) * 70,
        tiltX: (variation(index, 12) - 0.5) * tiltRange,
        tiltY: (variation(index, 13) - 0.5) * tiltRange,
        spinDirection: variation(index, 9) > 0.5 ? 1 : -1,
        depthScale: layer === "foreground" ? 1.08 : layer === "midground" ? 0.94 : 0.78,
        opacity: layer === "foreground" ? 1 : layer === "midground" ? 0.82 : 0.64,
        imageType,
        layer,
        restingPlace,
        restingAngle,
        restingYOffset,
      };
    });
  }, [variant]);

  const animValues = useMemo(() => petals.map(() => new Animated.Value(0)), [petals]);
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    // Reinicia o valor de cada pétala para 0 a cada novo disparo
    animValues.forEach((anim) => anim.setValue(0));
    messageAnim.setValue(0);

    const easingFn = Easing?.linear ?? ((t: number) => t);

    const isWeb = Platform.OS === "web";
    const animations = animValues.map((anim, i) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: petals[i].duration,
        delay: petals[i].delay,
        easing: easingFn,
        useNativeDriver: !isWeb,
      });
    });

    if (message) {
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: !isWeb,
      }).start(() => {
        Animated.timing(messageAnim, {
          toValue: 0,
          delay: 2800,
          duration: 500,
          useNativeDriver: !isWeb,
        }).start();
      });
    }

    let completedCount = 0;
    animations.forEach((anim) => {
      anim.start((result) => {
        // Se a animação foi abortada ou reiniciada, não conta nem dispara onComplete
        if (result && !result.finished) {
          return;
        }
        completedCount++;
        if (completedCount === animations.length) {
          onCompleteRef.current?.();
        }
      });
    });

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [active, animValues, message, messageAnim, petals]);

  if (!active) return null;

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      pointerEvents="none"
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (h > 100) setLayoutHeight(h);
      }}
      style={[StyleSheet.absoluteFill, styles.overlay]}
    >
      {message ? (
        <Animated.View
          style={[
            styles.messageContainer,
            {
              backgroundColor: colors.ipe.container,
              borderColor: colors.ipe.bloom,
              opacity: messageAnim,
              transform: [
                {
                  translateY: messageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 28],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: colors.ipe.onContainer,
              },
            ]}
          >
            {message}
          </Text>
        </Animated.View>
      ) : null}

      {petals.map((petal, index) => {
        const anim = animValues[index];
        const settles = petal.restingPlace !== "none";
        const navBarHeight = BOTTOM_NAV_HEIGHT + insets.bottom;
        const navBarTop = effectiveHeight - navBarHeight;
        const bottomBarY =
          bottomOffset !== undefined && bottomOffset > 0
            ? Math.max(100, effectiveHeight - bottomOffset - (petal.height * 0.45 + petal.restingYOffset))
            : Math.max(100, navBarTop + 24 + petal.restingYOffset);
        const topBarY = Math.max(0, (tokens.spacing[40] - petal.height) / 2 + petal.restingYOffset);
        const restingY = petal.restingPlace === "topBar" ? topBarY : bottomBarY;
        const startX = petal.startXRatio * (screenWidth - 48) + 24;

        // A curva desacelera no pouso e segura a peça na barra antes do desaparecimento.
        const translateY = settles
          ? anim.interpolate({
              inputRange: [0, 0.1, 0.26, 0.48, 0.68, 0.74, 0.8, 0.94, 1],
              outputRange: [-72, -10, restingY * 0.08, restingY * 0.3, restingY * 0.58, restingY * 0.78, restingY, restingY, restingY],
            })
          : anim.interpolate({
              inputRange: [0, 0.08, 0.24, 0.48, 0.7, 0.88, 1],
              outputRange: [-72, -8, effectiveHeight * 0.1, effectiveHeight * 0.34, effectiveHeight * 0.62, effectiveHeight * 0.86, effectiveHeight + 60],
            });

        // A brisa muda de direção aos poucos, com um balanço diferente em cada peça.
        const finalDrift = petal.driftX * 0.35;
        const translateX = settles
          ? anim.interpolate({
              inputRange: [0, 0.18, 0.38, 0.58, 0.72, 0.8, 0.94, 1],
              outputRange: [0, petal.driftX * 0.28, petal.driftX * 0.72, -petal.driftX * 0.24, -petal.driftX * 0.58, finalDrift, finalDrift, finalDrift],
            })
          : anim.interpolate({
              inputRange: [0, 0.14, 0.32, 0.5, 0.68, 0.84, 1],
              outputRange: [0, petal.driftX * 0.25, petal.driftX * 0.78, -petal.driftX * 0.32, -petal.driftX * 0.72, petal.driftX * 0.3, 0],
            });

        // Flores balançam; pétalas giram e mudam de lado mais depressa no ar.
        const flutter = petal.imageType === "petal" ? 48 : petal.imageType === "leaf" ? 40 : 15;
        const direction = petal.spinDirection;
        const rotate = settles
          ? anim.interpolate({
              inputRange: [0, 0.22, 0.47, 0.68, 0.8, 0.94, 1],
              outputRange: [
                `${petal.rotation}deg`,
                `${petal.rotation + flutter * direction}deg`,
                `${petal.rotation - flutter * 0.65 * direction}deg`,
                `${petal.rotation + flutter * 0.45 * direction}deg`,
                `${petal.restingAngle}deg`,
                `${petal.restingAngle}deg`,
                `${petal.restingAngle}deg`,
              ],
            })
          : anim.interpolate({
              inputRange: [0, 0.2, 0.44, 0.68, 0.84, 1],
              outputRange: [
                `${petal.rotation}deg`,
                `${petal.rotation + flutter * direction}deg`,
                `${petal.rotation - flutter * direction}deg`,
                `${petal.rotation + 75 * direction}deg`,
                `${petal.rotation + 135 * direction}deg`,
                `${petal.rotation + 190 * direction}deg`,
              ],
            });

        const rotateX = settles
          ? anim.interpolate({
              inputRange: [0, 0.18, 0.4, 0.62, 0.8, 0.94, 1],
              outputRange: [
                `${petal.tiltX * 0.35}deg`,
                `${petal.tiltX}deg`,
                `${petal.tiltX * -0.55}deg`,
                `${petal.tiltX * 0.7}deg`,
                `${petal.tiltX * 0.2}deg`,
                `${petal.tiltX * 0.2}deg`,
                `${petal.tiltX * 0.2}deg`,
              ],
            })
          : anim.interpolate({
              inputRange: [0, 0.18, 0.4, 0.62, 0.82, 1],
              outputRange: [
                `${petal.tiltX * 0.35}deg`,
                `${petal.tiltX}deg`,
                `${petal.tiltX * -0.55}deg`,
                `${petal.tiltX * 0.7}deg`,
                `${petal.tiltX * -0.3}deg`,
                `${petal.tiltX * 0.2}deg`,
              ],
            });
        const rotateY = settles
          ? anim.interpolate({
              inputRange: [0, 0.2, 0.43, 0.66, 0.8, 0.94, 1],
              outputRange: [
                `${petal.tiltY * -0.3}deg`,
                `${petal.tiltY * 0.75}deg`,
                `${petal.tiltY * -0.8}deg`,
                `${petal.tiltY}deg`,
                `${petal.tiltY * 0.25}deg`,
                `${petal.tiltY * 0.25}deg`,
                `${petal.tiltY * 0.25}deg`,
              ],
            })
          : anim.interpolate({
              inputRange: [0, 0.2, 0.43, 0.66, 0.84, 1],
              outputRange: [
                `${petal.tiltY * -0.3}deg`,
                `${petal.tiltY * 0.75}deg`,
                `${petal.tiltY * -0.8}deg`,
                `${petal.tiltY}deg`,
                `${petal.tiltY * -0.45}deg`,
                `${petal.tiltY * 0.25}deg`,
              ],
            });

        // A pétala vira de lado com o vento; as flores mantêm a forma enquanto balançam.
        const scaleX = settles
          ? anim.interpolate({
              inputRange: [0, 0.22, 0.48, 0.72, 0.8, 0.94, 1],
              outputRange: [1, petal.imageType === "petal" ? 0.86 : petal.imageType === "leaf" ? 0.8 : 0.96, 1, 0.9, 0.94, 0.94, 0.94],
            })
          : anim.interpolate({
              inputRange: [0, 0.2, 0.44, 0.68, 0.84, 1],
              outputRange: [1, petal.imageType === "petal" ? 0.78 : petal.imageType === "leaf" ? 0.74 : 0.94, 1.02, 0.82, 1, 0.9],
            });

        const scale = settles
          ? anim.interpolate({
              inputRange: [0, 0.12, 0.8, 0.94, 1],
              outputRange: [petal.depthScale * 0.9, petal.depthScale, petal.depthScale, petal.depthScale, petal.depthScale],
            })
          : anim.interpolate({
              inputRange: [0, 0.12, 0.84, 1],
              outputRange: [petal.depthScale * 0.9, petal.depthScale, petal.depthScale, petal.depthScale * 0.94],
            });

        // As peças pousadas ficam visíveis brevemente e somem no fim da animação.
        const opacity = settles
          ? anim.interpolate({
              inputRange: [0, 0.05, 0.8, 0.94, 1],
              outputRange: [0, 1, 1, 1, 0],
            })
          : anim.interpolate({
              inputRange: [0, 0.05, 0.90, 1],
              outputRange: [0, 1, 1, 0],
            });

        const imageSource =
          petal.imageType === "blossom"
            ? ipeFloradaNatural
            : petal.imageType === "petal"
              ? ipePetalaNatural
              : petal.imageType === "leaf"
                ? ipeFolhaNatural
                : ipeFlorTrombetaNatural;

        return (
          <Animated.View
            key={petal.id}
            style={[
              styles.petalWrapper,
              {
                left: startX,
                width: petal.width,
                height: petal.height,
                zIndex: petal.layer === "foreground" ? 3 : petal.layer === "midground" ? 2 : 1,
                transform: [
                  { translateY },
                  { translateX },
                  { rotate },
                  { rotateX },
                  { rotateY },
                  { scaleX },
                  { scale },
                  { perspective: 700 },
                ],
                opacity,
              },
            ]}
          >
            <Image
              source={imageSource}
              resizeMode="contain"
              style={[styles.petalImage, { opacity: petal.opacity }]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: (Platform.OS === "web" ? "fixed" : "absolute") as "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    alignItems: "center",
    pointerEvents: "none",
    overflow: "hidden",
  },
  messageContainer: {
    position: "absolute",
    top: 32,
    zIndex: 100000,
    elevation: 100000,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[10],
    borderRadius: tokens.radius.full,
    borderWidth: 1.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  messageText: {
    ...tokens.typography.labelMedium,
    fontWeight: tokens.fontWeight.bold,
  },
  petalWrapper: {
    position: "absolute",
    top: 0,
    backgroundColor: "transparent",
  },
  petalImage: {
    width: "100%",
    height: "100%",
  },
});
