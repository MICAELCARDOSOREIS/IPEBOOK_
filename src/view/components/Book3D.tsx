import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Image, PanResponder, Platform, StyleSheet, Text, View, type ViewProps } from "react-native";
import { BookCover, coverBackground } from "@/view/components/BookCover";
import { bookDepthFromPages, faceContentOpacity, normalizeAngle, projectBookFaces, snapBookAngle, type BookFace } from "@/view/book3dGeometry";
import { fontFamily, tokens } from "@/view/tokens";

export type Book3DProps = {
  id: string;
  title: string;
  author?: string;
  /** Sinopse (ou, sem ela, a descrição do anúncio), mostrada na contracapa. */
  description?: string;
  /** Editora, mostrada no pé da contracapa. */
  publisher?: string;
  /** Quantidade de páginas, usada para ajustar a espessura da lombada e do corte das folhas. */
  pageCount?: number;
  photoUrl?: string;
  /** Foto real da lombada do livro, exibida na face lateral esquerda do livro 3D quando disponível. */
  spinePhotoUrl?: string;
  /** Foto real do verso (contracapa) do livro, exibida na face traseira do livro 3D quando disponível. */
  backPhotoUrl?: string;
  /** Toque sem arrastar (por exemplo, abrir as fotos); sem isso, o toque alterna entre capa e contracapa. */
  onPress?: () => void;
  /** Gira um pouco ao aparecer, para mostrar que é um livro. Desligado nos testes. */
  intro?: boolean;
  /** Tamanho do livro em relação ao padrão (136 x 218 dp); ocupa o espaço que mostra, ao contrário de `transform: scale`. */
  scale?: number;
  /** Ângulo inicial em graus; 0 mostra a capa. */
  startAngle?: number;
  /** Rótulo de acessibilidade personalizado (ex.: para ver fotos em tela cheia). */
  accessibilityLabel?: string;
  /** Papel de acessibilidade personalizado. */
  accessibilityRole?: "image" | "button";
};

const BASE_WIDTH = 136;
const BASE_HEIGHT = 218;
const BASE_DEPTH = 28;
/** Ângulo final da animação de entrada: leve perspectiva (-16°) que deixa visível o corte das páginas ao lado da capa. */
const INTRO_REST_ANGLE = -16;
const GOLD = tokens.colors.cover.gold;
const PAGE = tokens.colors.cover.page;
const COVER_TEXT = tokens.colors.cover.text;
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
export function Book3D({
  id,
  title,
  author,
  description,
  publisher,
  pageCount,
  photoUrl,
  spinePhotoUrl,
  backPhotoUrl,
  onPress,
  intro = true,
  scale = 1,
  startAngle,
  accessibilityLabel,
  accessibilityRole,
}: Book3DProps) {
  const WIDTH = BASE_WIDTH * scale;
  const HEIGHT = BASE_HEIGHT * scale;
  const DEPTH = bookDepthFromPages(pageCount, BASE_DEPTH) * scale;
  const defaultRestAngle = startAngle !== undefined ? startAngle : intro ? INTRO_REST_ANGLE : 0;
  const [angle, setAngle] = useState(normalizeAngle(defaultRestAngle));
  const angleRef = useRef(normalizeAngle(defaultRestAngle));
  const reduceMotion = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const flipping = useRef(false);
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
    flipping.current = false;
  };
  /** Anima até `target` (ângulo equivalente mais próximo), com desaceleração. */
  const animateTo = (target: number, flip = false) => {
    stop();
    if (reduceMotion.current) return apply(target);
    flipping.current = flip;
    const delta = normalizeAngle(target - angleRef.current);
    const from = angleRef.current;
    const start = Date.now();
    timer.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 500);
      apply(from + delta * (1 - (1 - t) ** 3));
      if (t >= 1) stop();
    }, 16);
  };
  const coast = (velocity: number) => {
    stop();
    if (reduceMotion.current) {
      apply(snapBookAngle(angleRef.current, defaultRestAngle));
      return;
    }
    let v = velocity;
    timer.current = setInterval(() => {
      apply(angleRef.current + v * 16 * DRAG_GAIN);
      v *= 0.92;
      if (Math.abs(v) < 0.04) {
        animateTo(snapBookAngle(angleRef.current, defaultRestAngle));
      }
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
          animateTo(defaultRestAngle);
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

  const activate = () => {
    if (press.current) {
      press.current();
      return;
    }
    if (flipping.current) return;
    const atFront = Math.abs(normalizeAngle(angleRef.current - defaultRestAngle)) < 5;
    animateTo(atFront ? 180 : defaultRestAngle, true);
  };
  const activateRef = useRef(activate);
  activateRef.current = activate;
  const dragFrom = useRef<number | null>(null);
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_event, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 4,
        onPanResponderTerminationRequest: () => dragFrom.current === null,
        onPanResponderGrant: () => {
          dragFrom.current = null;
        },
        onPanResponderMove: (_event, g) => {
          if (dragFrom.current === null) {
            if (Math.abs(g.dx) < TAP_SLOP || Math.abs(g.dx) <= Math.abs(g.dy)) return;
            stop();
            dragFrom.current = angleRef.current;
          }
          apply(dragFrom.current + g.dx * DRAG_GAIN);
        },
        onPanResponderRelease: (_event, g) => {
          if (dragFrom.current !== null) {
            coast(g.vx);
          } else if (Math.abs(g.dx) < TAP_SLOP && Math.abs(g.dy) < TAP_SLOP) {
            activateRef.current();
          }
        },
        onPanResponderTerminate: () => {
          if (dragFrom.current !== null) animateTo(snapBookAngle(angleRef.current, defaultRestAngle));
        },
      }),
    // Os callbacks usam só refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const faces = projectBookFaces(angle, WIDTH, DEPTH);
  const total = WIDTH + DEPTH * 2;
  const silhouetteWidth = faces.reduce((sum, face) => sum + face.width, 0);

  return (
    <View
      {...pan.panHandlers}
      {...(Platform.OS === "web" ? {
        tabIndex: 0 as const,
        onKeyDown: ((event) => {
          const { key, repeat } = event as typeof event & Pick<KeyboardEvent, "key" | "repeat">;
          if (key !== "Enter" && key !== " ") return;
          event.preventDefault();
          if (!repeat) activate();
        }) satisfies NonNullable<ViewProps["onKeyDown"]>,
      } : {})}
      accessible
      accessibilityRole={accessibilityRole ?? (onPress || Platform.OS === "web" ? "button" : "image")}
      accessibilityLabel={
        accessibilityLabel ??
        (onPress
          ? `Ver fotos do anúncio em tela cheia. Capa de ${title}.`
          : `Capa de ${title}, em 3D. Use as ações para girar o livro.`)
      }
      accessibilityActions={[
        { name: "increment", label: "Girar para a esquerda" },
        { name: "decrement", label: "Girar para a direita" },
        { name: "activate", label: onPress ? "Ver fotos" : "Virar o livro" },
      ]}
      onAccessibilityAction={(event) => {
        const action = event.nativeEvent.actionName;
        if (action === "activate") {
          activate();
        } else if (action === "increment") {
          animateTo(angleRef.current + STEP);
        } else if (action === "decrement") {
          animateTo(angleRef.current - STEP);
        } else {
          animateTo(defaultRestAngle);
        }
      }}
      style={[styles.stage, { width: total, height: HEIGHT }]}
    >
      <View pointerEvents="none" style={[styles.groundShadow, { width: silhouetteWidth * 0.9, height: 12 * scale, bottom: -7 * scale }]} />
      {faces.map(({ face, center, width, shade }) => {
        const size = face === "front" || face === "back" ? WIDTH : DEPTH;
        const fade = faceContentOpacity(face, width / size);
        // No corte das páginas (face "right"), a altura é levemente menor que a capa dura (degrau de encadernação).
        const isPageBlock = face === "right";
        const faceTop = isPageBlock ? Math.max(3, Math.round(5 * scale)) : 0;
        const faceHeight = isPageBlock ? HEIGHT - faceTop * 2 : HEIGHT;
        return (
          <View
            key={face}
            testID={`book3d-face-${face}`}
            style={[
              styles.face,
              !isPageBlock && styles.coverShadow,
              {
                top: faceTop,
                left: total / 2 - size / 2,
                width: size,
                height: faceHeight,
                backgroundColor: face === "front" || face === "back" ? darken(base, 0.1) : undefined,
                transform: [{ translateX: center }, { scaleX: width / size }],
              },
            ]}
          >
            <FaceContent
              face={face}
              id={id}
              title={title}
              author={author}
              description={description}
              publisher={publisher}
              photoUrl={photoUrl}
              spinePhotoUrl={spinePhotoUrl}
              backPhotoUrl={backPhotoUrl}
              base={base}
              width={WIDTH}
              height={faceHeight}
              depth={DEPTH}
              fade={fade}
            />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${(isPageBlock ? shade * 0.35 : shade).toFixed(3)})` }]} />
          </View>
        );
      })}
    </View>
  );
}

function BookSidePhoto({
  uri,
  accessibilityLabel,
  fallback,
}: {
  uri: string;
  accessibilityLabel: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [uri]);
  if (failed) return <>{fallback}</>;
  return (
    <Image
      source={{ uri }}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      resizeMode="cover"
      onError={() => setFailed(true)}
      style={StyleSheet.absoluteFill}
    />
  );
}

function FaceContent({
  face,
  id,
  title,
  author,
  description,
  publisher,
  photoUrl,
  spinePhotoUrl,
  backPhotoUrl,
  base,
  width,
  height,
  depth,
  fade,
}: { face: BookFace } & Pick<
  Book3DProps,
  "id" | "title" | "author" | "description" | "publisher" | "photoUrl" | "spinePhotoUrl" | "backPhotoUrl"
> & { base: string; width: number; height: number; depth: number; fade: number }) {
  if (face === "front") {
    return (
      <View style={[styles.fill, { opacity: fade }]}>
        <BookCover id={id} title={title} author={author} photoUrl={photoUrl} variant="detail" width={width} showSpine={false} />
        {/* Vinco de encadernação junto à lombada (luz + sulco escuro). */}
        <View pointerEvents="none" style={styles.hingeShadow} />
        <View pointerEvents="none" style={styles.hingeHighlight} />
      </View>
    );
  }
  if (face === "back") {
    const illustratedBack = (
      <>
        <View style={[styles.backFrame, { opacity: 0.7 * fade }]} />
        {/* Contracapa: título, autor e a descrição do anúncio, como numa orelha de livro. */}
        <View style={[styles.backText, { padding: width * 0.14, opacity: fade }]}>
          <Text numberOfLines={3} style={[styles.backTitle, { fontSize: width * 0.1 }]}>
            {title}
          </Text>
          {author ? (
            <Text numberOfLines={2} style={[styles.backAuthor, { fontSize: width * 0.075 }]}>
              {author}
            </Text>
          ) : null}
          {description ? (
            <>
              <View style={styles.backRule} />
              <Text numberOfLines={publisher ? 8 : 9} style={[styles.backDescription, { fontSize: width * 0.062, lineHeight: width * 0.09 }]}>
                {description}
              </Text>
            </>
          ) : null}
          {publisher ? (
            <Text numberOfLines={1} style={[styles.backPublisher, { fontSize: width * 0.055 }]}>
              {publisher}
            </Text>
          ) : null}
        </View>
      </>
    );
    return (
      <View style={[styles.fill, { backgroundColor: darken(base, 0.1), opacity: fade }]}>
        {backPhotoUrl ? (
          <BookSidePhoto
            uri={backPhotoUrl}
            accessibilityLabel={`Foto do verso de ${title}`}
            fallback={illustratedBack}
          />
        ) : (
          illustratedBack
        )}
      </View>
    );
  }
  if (face === "left") {
    const illustratedSpine = (
      <>
        {[0.05, 0.08, 0.92, 0.95].map((at) => (
          <View key={at} style={[styles.band, { top: height * at }]} />
        ))}
        <View style={{ position: "absolute", left: (depth - height * 0.7) / 2, top: (height - depth) / 2, width: height * 0.7, height: depth, justifyContent: "center", opacity: fade, transform: [{ rotate: "-90deg" }] }}>
          <Text numberOfLines={1} style={[styles.spineText, { fontSize: depth * (author ? 0.34 : 0.43) }]}>
            {title}
          </Text>
          {author ? (
            <Text numberOfLines={1} style={[styles.spineAuthor, { fontSize: depth * 0.26 }]}>
              {author}
            </Text>
          ) : null}
        </View>
      </>
    );
    // Lombada: foto real quando enviada; senão título na vertical entre filetes dourados.
    return (
      <View style={[styles.fill, { backgroundColor: darken(base, 0.25), opacity: fade }]}>
        {spinePhotoUrl ? (
          <BookSidePhoto
            uri={spinePhotoUrl}
            accessibilityLabel={`Foto da lombada de ${title}`}
            fallback={illustratedSpine}
          />
        ) : (
          illustratedSpine
        )}
      </View>
    );
  }
  // Corte das páginas: linhas finas paralelas à lombada + sombreamento interno junto às capas.
  return (
    <View style={[styles.fill, { backgroundColor: PAGE }]}>
      {Array.from({ length: Math.floor(depth / 2.2) }, (_, i) => (
        <View key={i} style={[styles.pageLine, { left: 2 + i * 2.2 }]} />
      ))}
      <View pointerEvents="none" style={styles.pageInnerShadowLeft} />
      <View pointerEvents="none" style={styles.pageInnerShadowRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: "center", justifyContent: "center" },
  groundShadow: {
    position: "absolute",
    borderRadius: tokens.radius.full,
    backgroundColor: "rgba(32, 22, 10, 0.12)",
    boxShadow: "0px 2px 9px rgba(32, 22, 10, 0.2)",
  },
  face: { position: "absolute", top: 0, overflow: "hidden", borderRadius: tokens.radius.micro },
  coverShadow: {
    elevation: 6,
    shadowColor: tokens.colors.m3.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  fill: { flex: 1 },
  hingeShadow: { position: "absolute", left: 4, top: 0, bottom: 0, width: 2, backgroundColor: "rgba(0,0,0,0.28)" },
  hingeHighlight: { position: "absolute", left: 6, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.16)" },
  pageInnerShadowLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: "rgba(84, 59, 29, 0.18)" },
  pageInnerShadowRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: 2, backgroundColor: "rgba(84, 59, 29, 0.1)" },
  backFrame: { position: "absolute", left: 12, right: 12, top: 12, bottom: 12, borderWidth: 1, borderColor: GOLD },
  band: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: GOLD },
  backText: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center", gap: tokens.spacing[6] },
  backTitle: { color: COVER_TEXT, fontFamily: fontFamily.brand, textAlign: "center" },
  backAuthor: { color: GOLD, fontFamily: fontFamily.regular, textAlign: "center" },
  backPublisher: { color: GOLD, fontFamily: fontFamily.semiBold, textAlign: "center", marginTop: tokens.spacing[4], letterSpacing: tokens.letterSpacing.publisher },
  backRule: { width: 28, height: 1, backgroundColor: GOLD, opacity: 0.8, marginVertical: tokens.spacing[4] },
  backDescription: { color: COVER_TEXT, opacity: 0.85, fontFamily: fontFamily.regular, textAlign: "center" },
  spineAuthor: { color: COVER_TEXT, opacity: 0.8, fontFamily: fontFamily.regular, textAlign: "center" },
  spineText: { color: COVER_TEXT, ...tokens.typography.spineText, textAlign: "center" },
  pageLine: { position: "absolute", top: 0, bottom: 0, width: 0.7, backgroundColor: "rgba(84, 59, 29, 0.16)" },
});

export default Book3D;
