import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, PanResponder, StyleSheet, Text, View } from "react-native";
import { BookCover, coverBackground } from "@/view/components/BookCover";
import { normalizeAngle, projectBookFaces, type BookFace } from "@/view/book3dGeometry";
import { fontFamily } from "@/view/tokens";

export type Book3DProps = {
  id: string;
  title: string;
  author?: string;
  photoUrl?: string;
  /** Toque sem arrastar (por exemplo, abrir as fotos); sem isso, o toque volta o livro para a capa. */
  onPress?: () => void;
  /** Gira um pouco ao aparecer, para mostrar que é um livro. Desligado nos testes. */
  intro?: boolean;
  /** Tamanho do livro em relação ao padrão (136 x 218 dp); ocupa o espaço que mostra, ao contrário de `transform: scale`. */
  scale?: number;
  /** Ângulo inicial em graus; 0 mostra a capa. */
  startAngle?: number;
};

const BASE_WIDTH = 136;
const BASE_HEIGHT = 218;
const BASE_DEPTH = 28;
const GOLD = "#D9A93A";
const PAGE = "#F1E9D6";
/** Graus por dp arrastado. */
const DRAG_GAIN = 0.7;
const TAP_SLOP = 6;
const STEP = 45;

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/**
 * Livro que gira com o dedo (ou o mouse): capa, lombada com o título, corte das páginas e contracapa, em projeção
 * ortogonal feita só com `View` e `scaleX`, sem biblioteca 3D (ver `book3dGeometry.ts`). Solta o dedo, o giro
 * continua e desacelera. Quem pede menos movimento recebe o livro parado, com giro só pelas ações de acessibilidade.
 */
export function Book3D({ id, title, author, photoUrl, onPress, intro = true, scale = 1, startAngle = 0 }: Book3DProps) {
  const WIDTH = BASE_WIDTH * scale;
  const HEIGHT = BASE_HEIGHT * scale;
  const DEPTH = BASE_DEPTH * scale;
  const [angle, setAngle] = useState(normalizeAngle(startAngle));
  const angleRef = useRef(normalizeAngle(startAngle));
  const reduceMotion = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const press = useRef(onPress);
  press.current = onPress;
  const base = useMemo(() => coverBackground(id), [id]);

  const apply = (value: number) => {
    angleRef.current = normalizeAngle(value);
    setAngle(angleRef.current);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  /** Anima até `target` (ângulo equivalente mais próximo), com desaceleração. */
  const animateTo = (target: number) => {
    stop();
    if (reduceMotion.current) return apply(target);
    const delta = normalizeAngle(target - angleRef.current);
    const from = angleRef.current;
    const start = Date.now();
    timer.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 500);
      apply(from + delta * (1 - Math.pow(1 - t, 3)));
      if (t >= 1) stop();
    }, 16);
  };
  const coast = (velocity: number) => {
    stop();
    if (reduceMotion.current) return;
    let v = velocity;
    timer.current = setInterval(() => {
      apply(angleRef.current + v * 16 * DRAG_GAIN);
      v *= 0.94;
      if (Math.abs(v) < 0.02) stop();
    }, 16);
  };

  useEffect(() => {
    let active = true;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((reduced) => {
        if (!active) return;
        reduceMotion.current = Boolean(reduced);
        if (intro && !reduced) {
          apply(38);
          animateTo(0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      stop();
    };
    // Só na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dragFrom = useRef(0);
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          stop();
          dragFrom.current = angleRef.current;
        },
        onPanResponderMove: (_event, g) => apply(dragFrom.current + g.dx * DRAG_GAIN),
        onPanResponderRelease: (_event, g) => {
          if (Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP) {
            if (press.current) press.current();
            else animateTo(0);
            return;
          }
          coast(g.vx);
        },
        onPanResponderTerminate: () => stop(),
      }),
    // Os callbacks usam só refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const faces = projectBookFaces(angle, WIDTH, DEPTH);
  const total = WIDTH + DEPTH * 2;
  const shadowWidth = Math.max(DEPTH, ...faces.map((f) => Math.abs(f.center) + f.width / 2)) * 1.6;

  return (
    <View
      {...pan.panHandlers}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Capa de ${title}, em 3D. Use as ações para girar o livro.`}
      accessibilityActions={[
        { name: "increment", label: "Girar para a esquerda" },
        { name: "decrement", label: "Girar para a direita" },
        { name: "activate", label: "Voltar para a capa" },
      ]}
      onAccessibilityAction={(event) => {
        const action = event.nativeEvent.actionName;
        if (action === "increment") animateTo(angleRef.current + STEP);
        else if (action === "decrement") animateTo(angleRef.current - STEP);
        else animateTo(0);
      }}
      style={[styles.stage, { width: total, height: HEIGHT + 16 }]}
    >
      {/* Sombra no chão: duas elipses, a de dentro mais escura; acompanha a largura do livro girado. */}
      <View pointerEvents="none" style={[styles.ground, { width: shadowWidth * 1.15, opacity: 0.1 }]} />
      <View pointerEvents="none" style={[styles.ground, { width: shadowWidth * 0.85, opacity: 0.18 }]} />
      {faces.map(({ face, center, width, shade }) => {
        const size = face === "front" || face === "back" ? WIDTH : DEPTH;
        return (
          <View
            key={face}
            testID={`book3d-face-${face}`}
            style={[
              styles.face,
              { left: total / 2 - size / 2, width: size, height: HEIGHT, transform: [{ translateX: center }, { scaleX: width / size }] },
            ]}
          >
            <FaceContent face={face} id={id} title={title} author={author} photoUrl={photoUrl} base={base} width={WIDTH} height={HEIGHT} depth={DEPTH} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${shade.toFixed(3)})` }]} />
          </View>
        );
      })}
    </View>
  );
}

function FaceContent({ face, id, title, author, photoUrl, base, width, height, depth }: { face: BookFace } & Pick<Book3DProps, "id" | "title" | "author" | "photoUrl"> & { base: string; width: number; height: number; depth: number }) {
  if (face === "front") {
    return <BookCover id={id} title={title} author={author} photoUrl={photoUrl} variant="detail" width={width} />;
  }
  if (face === "back") {
    return (
      <View style={[styles.fill, { backgroundColor: darken(base, 0.1) }]}>
        <View style={styles.backFrame} />
      </View>
    );
  }
  if (face === "left") {
    // Lombada: título na vertical, entre filetes dourados.
    return (
      <View style={[styles.fill, { backgroundColor: darken(base, 0.25) }]}>
        {[0.05, 0.08, 0.92, 0.95].map((at) => (
          <View key={at} style={[styles.band, { top: height * at }]} />
        ))}
        <View style={{ position: "absolute", left: (depth - height * 0.7) / 2, top: (height - depth) / 2, width: height * 0.7, height: depth, justifyContent: "center", transform: [{ rotate: "-90deg" }] }}>
          <Text numberOfLines={1} style={[styles.spineText, { fontSize: depth * 0.43 }]}>
            {title}
          </Text>
        </View>
      </View>
    );
  }
  // Corte das páginas: linhas finas paralelas à lombada.
  return (
    <View style={[styles.fill, { backgroundColor: PAGE }]}>
      {Array.from({ length: Math.floor(depth / 2.5) }, (_, i) => (
        <View key={i} style={[styles.pageLine, { left: 2 + i * 2.5 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: "center", justifyContent: "center" },
  ground: { position: "absolute", bottom: 0, alignSelf: "center", height: 12, borderRadius: 12, backgroundColor: "#000" },
  face: { position: "absolute", top: 0, overflow: "hidden", borderRadius: 2 },
  fill: { flex: 1 },
  backFrame: { position: "absolute", left: 12, right: 12, top: 12, bottom: 12, borderWidth: 1, borderColor: GOLD, opacity: 0.7 },
  band: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: GOLD },
  spineText: { color: "#F5EFE8", fontFamily: fontFamily.brand, fontSize: 12, textAlign: "center" },
  pageLine: { position: "absolute", top: 0, bottom: 0, width: 0.7, backgroundColor: "rgba(0,0,0,0.14)" },
});

export default Book3D;
