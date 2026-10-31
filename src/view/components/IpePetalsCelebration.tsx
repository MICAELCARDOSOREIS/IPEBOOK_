import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import ipePetala1 from "@/view/assets/ipe-petala-1.png";
import ipePetala2 from "@/view/assets/ipe-petala-2.png";
import ipeFlorBlossom from "@/view/assets/ipe-flor-blossom.png";
import ipeFolha1 from "@/view/assets/ipe-folha-1.png";
import ipeFolha2 from "@/view/assets/ipe-folha-2.png";
import ipeFolhaSeca from "@/view/assets/ipe-folha-seca.png";

const PETAL_COUNT = 38;
const BOTTOM_NAV_HEIGHT = 80;

export type IpePetalsCelebrationProps = {
  /** Se a animação está ativa (padrão: true). */
  active?: boolean;
  /** Chamado quando a chuva de pétalas termina naturalmente (~5 a 6.2s). */
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
  imageType: "blossom" | "trumpet" | "petal" | "leafGreen" | "leafPalmate" | "leafDry";
  layer: "foreground" | "midground" | "background";
  /** Se pousa suavemente sobre o nav bar formando um tapete visível de pétalas */
  settlesOnGround: boolean;
  restingAngle: number;
  restingYOffset: number;
};

/**
 * Chuva de pétalas de Ipê-Amarelo: micro-interação comemorativa inspirada
 * na florada real de Piripiri. Queda ágil, graciosa e alegre de pétalas
 * douradas ao vento (~5 a 6.2 segundos).
 * Puramente visual, sem interferir na árvore de acessibilidade nem no toque.
 */
export function IpePetalsCelebration({
  active = true,
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

  // Gera configs determinísticas por pétala botânica de Ipê
  const petals = useMemo<PetalConfig[]>(() => {
    return Array.from({ length: PETAL_COUNT }, (_, index) => {
      const step = index / PETAL_COUNT;
      const layer: PetalConfig["layer"] =
        index % 3 === 0 ? "foreground" : index % 3 === 1 ? "midground" : "background";

      // Mistura botânica da florada: ~75% flores e pétalas douradas, ~25% folhas verdes e secas
      const typeIndex = index % 8;
      const imageType: PetalConfig["imageType"] =
        typeIndex === 0 || typeIndex === 4
          ? "blossom"
          : typeIndex === 1 || typeIndex === 5
            ? "trumpet"
            : typeIndex === 2 || typeIndex === 6
              ? "petal"
              : typeIndex === 3
                ? "leafGreen"
                : index % 2 === 0
                  ? "leafPalmate"
                  : "leafDry";

      // Proporções botânicas naturais
      let baseWidth = layer === "foreground" ? 38 : layer === "midground" ? 32 : 26;
      let ratio = 1.0;

      if (imageType === "blossom") {
        baseWidth = layer === "foreground" ? 42 : layer === "midground" ? 35 : 28;
        ratio = 1.0;
      } else if (imageType === "trumpet") {
        baseWidth = layer === "foreground" ? 40 : layer === "midground" ? 34 : 28;
        ratio = 1.06;
      } else if (imageType === "petal") {
        baseWidth = layer === "foreground" ? 34 : layer === "midground" ? 28 : 24;
        ratio = 1.25;
      } else if (imageType === "leafGreen" || imageType === "leafDry") {
        baseWidth = layer === "foreground" ? 22 : layer === "midground" ? 18 : 15;
        ratio = 2.0;
      } else if (imageType === "leafPalmate") {
        baseWidth = layer === "foreground" ? 44 : layer === "midground" ? 36 : 28;
        ratio = 1.0;
      }

      const width = baseWidth + (index % 3) * 2;
      const height = Math.round(width * ratio);

      // Cerca de 40% das pétalas pousam na barra de navegação inferior (onde o usuário vê com clareza)
      const settlesOnGround = index % 3 === 0 || index % 7 === 0;
      const restingAngle = ((index * 37) % 56) - 28;
      // Distribui suavemente no topo e corpo do nav bar
      const restingYOffset = ((index % 5) * 6) - 8;

      return {
        id: index,
        startXRatio: step,
        driftX: (index % 2 === 0 ? 1 : -1) * (26 + ((index * 9) % 36)),
        width,
        height,
        // Disparos espalhados no primeiro 1.5s
        delay: (index * 85) % 1500,
        // Queda viva e graciosa: 4.6s a 6.0s
        duration: 4600 + (index % 5) * 320,
        rotation: (index * 43) % 360,
        imageType,
        layer,
        settlesOnGround,
        restingAngle,
        restingYOffset,
      };
    });
  }, []);

  const animValues = useRef(Array.from({ length: PETAL_COUNT }, () => new Animated.Value(0))).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    // Reinicia o valor de cada pétala para 0 a cada novo disparo
    animValues.forEach((anim) => anim.setValue(0));
    messageAnim.setValue(0);

    const easingFn = typeof Easing?.out === "function" && typeof Easing?.quad === "function"
      ? Easing.out(Easing.quad)
      : undefined;

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
        // Pouso exatamente sobre a barra de navegação inferior (Tab Bar)
        const navBarHeight = BOTTOM_NAV_HEIGHT + insets.bottom;
        const navBarTop = effectiveHeight - navBarHeight;
        const groundY =
          bottomOffset !== undefined && bottomOffset > 0
            ? Math.max(100, effectiveHeight - bottomOffset - (petal.height * 0.45 + petal.restingYOffset))
            : Math.max(100, navBarTop + 24 + petal.restingYOffset);
        const startX = petal.startXRatio * (screenWidth - 48) + 24;

        // Pouso suave no nav bar, ou voo livre além da tela
        const translateY = petal.settlesOnGround
          ? anim.interpolate({
              inputRange: [0, 0.45, 0.72, 0.78, 0.84, 1],
              outputRange: [-60, groundY * 0.48, groundY - 5, groundY, groundY, groundY],
            })
          : anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-60, effectiveHeight + 60],
            });

        // Oscilação lateral ampla e natural (como brisa no sertão de Piripiri)
        const finalDrift = petal.driftX * 0.55;
        const translateX = petal.settlesOnGround
          ? anim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.76, 1],
              outputRange: [0, petal.driftX, -petal.driftX * 0.35, finalDrift, finalDrift],
            })
          : anim.interpolate({
              inputRange: [0, 0.2, 0.45, 0.7, 0.9, 1],
              outputRange: [
                0,
                petal.driftX,
                -petal.driftX * 0.7,
                petal.driftX * 0.85,
                -petal.driftX * 0.4,
                0,
              ],
            });

        // Giro no próprio eixo; repousa suavemente no ângulo natural ao pousar
        const rotate = petal.settlesOnGround
          ? anim.interpolate({
              inputRange: [0, 0.76, 1],
              outputRange: [`${petal.rotation}deg`, `${petal.restingAngle}deg`, `${petal.restingAngle}deg`],
            })
          : anim.interpolate({
              inputRange: [0, 1],
              outputRange: [`${petal.rotation}deg`, `${petal.rotation + 150}deg`],
            });

        // Efeito 3D sutil de pétala oscilando no ar que se aquieta no nav bar
        const scaleX = petal.settlesOnGround
          ? anim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.76, 1],
              outputRange: [1, 0.7, 0.95, 0.85, 0.85],
            })
          : anim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [1, 0.65, 0.95, 0.7, 0.9],
            });

        const scale = anim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0.85, 1, 1, 0.85],
        });

        // Pétalas no nav bar permanecem 100% visíveis compondo o tapete dourado até desvanecerem no fim
        const opacity = petal.settlesOnGround
          ? anim.interpolate({
              inputRange: [0, 0.05, 0.82, 0.92, 1],
              outputRange: [0, 1, 1, 1, 0],
            })
          : anim.interpolate({
              inputRange: [0, 0.05, 0.90, 1],
              outputRange: [0, 1, 1, 0],
            });

        const imageSource =
          petal.imageType === "blossom"
            ? ipeFlorBlossom
            : petal.imageType === "trumpet"
              ? ipePetala1
              : petal.imageType === "petal"
                ? ipePetala2
                : petal.imageType === "leafGreen"
                  ? ipeFolha1
                  : petal.imageType === "leafPalmate"
                    ? ipeFolha2
                    : ipeFolhaSeca;

        return (
          <Animated.View
            key={petal.id}
            style={[
              styles.petalWrapper,
              {
                left: startX,
                width: petal.width,
                height: petal.height,
                transform: [{ translateY }, { translateX }, { rotate }, { scaleX }, { scale }],
                opacity,
              },
            ]}
          >
            <Image
              source={imageSource}
              resizeMode="contain"
              style={styles.petalImage}
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
