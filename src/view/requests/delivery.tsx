import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { buildDeliveryPayload, normalizeDeliveryCode, parseDeliveryPayload } from "@/model/entities/delivery";
import type { Book } from "@/model/entities/book";
import {
  makeAuthViewModel,
  makeDeliveryViewModel,
  makeNegotiationRatingViewModel,
  makeRequestDetailViewModel,
} from "@/di/container";
import { NegotiationRatingModal } from "@/view/requests/NegotiationRatingModal";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { BookCover } from "@/view/components/BookCover";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { formatPrice } from "@/view/formatPrice";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { QrCode } from "@/view/components/QrCode";
import { Tag } from "@/view/components/Tag";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useHydratedWindowWidth, useIsWideWeb } from "@/view/useIsWideWeb";
import { WEB_MAX_WIDTH } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

export type DeliveryProps = {
  requestId: string;
  sessionUserId: string;
  onBack?: () => void;
};

/** "K7M2QXWA" vira "K7M2 QXWA": mais fácil de ler em voz alta e de digitar. */
function groupCode(code: string): string {
  return `${code.slice(0, 4)} ${code.slice(4)}`;
}

/** Segundos que faltam até `expiresAt`, atualizados a cada segundo. */
function useSecondsLeft(expiresAt: string | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000)) : null;
}

function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export type DeliveryBookSummaryProps = {
  book: Book;
  counterpartName: string | null;
  counterpartPhotoUrl?: string | null;
  role: "giver" | "receiver" | null;
};

export function DeliveryBookSummaryCard({
  book,
  counterpartName,
  counterpartPhotoUrl,
  role,
}: DeliveryBookSummaryProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createSummaryStyles(colors), [colors]);
  const roleLabel = role === "giver" ? "Entregando para" : "Recebendo de";

  return (
    <View style={styles.card} accessibilityLabel={`Livro da entrega: ${book.title}, ${roleLabel} ${counterpartName ?? "pessoa da comunidade"}`}>
      <View style={styles.coverWrapper}>
        <BookCover id={book.id} title={book.title} photoUrl={book.photoUrl} variant="list" width={64} />
      </View>
      <View style={styles.detailsCol}>
        <View style={styles.metaRow}>
          <Tag variant={book.modality} />
          {book.price ? <Text style={styles.price}>{formatPrice(book.price)}</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={styles.author}>
          {book.author}
        </Text>
        <View style={styles.counterpartRow}>
          <Avatar size={22} name={counterpartName ?? "Pessoa da comunidade"} photoUrl={counterpartPhotoUrl || undefined} />
          <Text numberOfLines={1} style={styles.counterpartText}>
            {roleLabel} <Text style={styles.counterpartName}>{counterpartName ?? "Pessoa da comunidade"}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

function DeliveryTipsCard({ colors }: { colors: ColorPalette }) {
  const styles = useMemo(() => createTipsStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppIcon name="info" size={20} color={colors.nature.foliage} />
        <Text style={styles.title}>Dicas para a Entrega Presencial</Text>
      </View>
      <Text style={styles.body}>
        • Realizem a troca em um dos 4 pontos públicos e seguros de Piripiri.
        {"\n\n"}
        • Confira o estado do livro, páginas e conservação antes de confirmar a entrega.
        {"\n\n"}
        • A leitura do QR code ou digitação do código conclui a negociação e permite a avaliação mútua.
      </Text>
    </View>
  );
}

/**
 * Entrega do livro (Spec 095, Spec 115, ADR 0070, ADR 0089): quem anunciou mostra o QR e quem recebeu o lê ou digita o código.
 */
export function Delivery({ requestId, sessionUserId, onBack }: DeliveryProps) {
  const guardedBack = useGuardedPress(onBack);
  const [state, actions] = makeDeliveryViewModel(requestId, sessionUserId);
  const [detailState] = makeRequestDetailViewModel(requestId, sessionUserId);
  const counterpartId = detailState.detail?.counterpartId ?? "";
  const counterpartName = detailState.detail?.counterpartName ?? "Pessoa da comunidade";
  const [ratingState, ratingActions] = makeNegotiationRatingViewModel(
    requestId,
    sessionUserId,
    counterpartId,
  );
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const previouslyCompleted = useRef(state.completed);

  useEffect(() => {
    if (!previouslyCompleted.current && state.completed && !ratingState.userRating) {
      setRatingModalVisible(true);
    }
    previouslyCompleted.current = state.completed;
  }, [state.completed, ratingState.userRating]);

  const wide = useIsWideWeb();
  // As colunas pedem 360 e 440 px; abaixo disso elas empilham em vez de estourar a janela.
  const stackColumns = useHydratedWindowWidth() < 1100;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const secondsLeft = useSecondsLeft(state.code?.expiresAt ?? null);
  const expired = secondsLeft === 0;
  const isExpiringSoon = !expired && secondsLeft !== null && secondsLeft <= 30;

  const [permission, requestPermission] = useCameraPermissions();
  const [typed, setTyped] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const scanLock = useRef(false);

  function handleScanned(result: BarcodeScanningResult) {
    if (scanLock.current || state.confirming) return;
    const parsed = parseDeliveryPayload(result.data ?? "");
    if (!parsed) {
      setScanError("Este QR não é de uma entrega do IpêBook.");
      return;
    }
    if (parsed.requestId !== requestId.toLowerCase()) {
      setScanError("Este QR é de outra negociação.");
      return;
    }
    scanLock.current = true;
    setScanError(null);
    void actions.confirm(parsed.code).finally(() => {
      scanLock.current = false;
    });
  }

  const detail = detailState.detail;
  const bookSummary = detail?.book ? (
    <DeliveryBookSummaryCard
      book={detail.book}
      counterpartName={counterpartName}
      counterpartPhotoUrl={detail.counterpartPhotoUrl}
      role={state.role}
    />
  ) : null;

  function renderActionCard() {
    if (state.completed) {
      return (
        <View style={styles.card} accessibilityLiveRegion="polite">
          <IconBadge icon="check" tone="action" />
          <Text accessibilityRole="header" style={styles.headline}>Entrega concluída!</Text>
          <Text style={styles.body}>
            Vocês confirmaram a entrega do livro em Piripiri. Conte como foi sua experiência na negociação.
          </Text>
          <FilledButton
            label={ratingState.userRating ? "Avaliação já enviada" : "Avaliar negociação"}
            disabled={Boolean(ratingState.userRating)}
            onPress={() => setRatingModalVisible(true)}
          />
          <OutlinedButton label="Voltar à negociação" onPress={() => onBack?.()} />
        </View>
      );
    }

    if (state.role === "giver") {
      return (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.headline}>Mostre este QR para quem recebe o livro</Text>
          <Text style={styles.body}>A pessoa lê o QR no app dela e a entrega é concluída para as duas.</Text>
          {state.code ? (
            <View style={styles.qrBlock}>
              <QrCode
                value={buildDeliveryPayload(requestId, state.code.code)}
                size={wide ? 260 : 248}
                accessibilityLabel="QR code da entrega. Se preferir, informe o código por voz ou texto."
              />
              <Text selectable accessibilityLabel={`Código ${state.code.code.split("").join(" ")}`} style={styles.code}>
                {groupCode(state.code.code)}
              </Text>
              <Text
                style={[
                  styles.hint,
                  expired && styles.expired,
                  isExpiringSoon && styles.expiringSoon,
                ]}
                accessibilityLiveRegion="polite"
              >
                {expired
                  ? "Código expirado. Gere outro."
                  : isExpiringSoon
                    ? `Expira em breve (${secondsLeft}s). Gere outro se precisar.`
                    : `Vale por ${formatClock(secondsLeft ?? 0)}`}
              </Text>
            </View>
          ) : null}
          <OutlinedButton
            label={state.code ? "Gerar novo código" : "Gerar código"}
            disabled={state.generating}
            onPress={() => void actions.generate()}
          />
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.headline}>Confirme que recebeu o livro</Text>
        <Text style={styles.body}>Aponte a câmera para o QR que a outra pessoa mostra ou digite o código.</Text>
        {Platform.OS !== "web" ? (
          permission?.granted ? (
            <View style={styles.camera}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleScanned}
              />
            </View>
          ) : (
            <View style={styles.permission}>
              <AppIcon name="camera" size={32} color={colors.m3.primary} />
              <Text style={styles.body}>Permita a câmera para ler o QR ou digite o código abaixo.</Text>
              <OutlinedButton label="Permitir câmera" onPress={() => void requestPermission()} />
            </View>
          )
        ) : (
          <View style={styles.webNoticeBlock}>
            <AppIcon name="info" size={20} color={colors.m3.primary} />
            <Text style={styles.webNoticeText}>
              Na versão web, digite o código de 8 caracteres exibido no celular de quem entrega.
            </Text>
          </View>
        )}
        <TextField
          label="Código da entrega"
          value={typed}
          onChangeText={(value) => setTyped(normalizeDeliveryCode(value).slice(0, 8))}
          autoCapitalize="characters"
          maxLength={8}
          helperText="8 caracteres, como K7M2QXWA"
          returnKeyType="done"
          onSubmitEditing={() => void actions.confirm(typed)}
        />
        <FilledButton
          label="Confirmar entrega"
          loading={state.confirming}
          loadingLabel="Confirmando"
          disabled={typed.length !== 8}
          onPress={() => void actions.confirm(typed)}
        />
      </View>
    );
  }

  const title = "Entrega do livro";
  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={wide ? WEB_MAX_WIDTH : 560} title={title} onBack={guardedBack} />
      {state.loading ? (
        <View style={styles.loadingContainer}>
          <LoadingState label="Carregando a entrega" variant="detail" />
        </View>
      ) : state.loadError ? (
        <View style={styles.loadingContainer}>
          <ErrorState message={state.loadError} onRetry={() => void actions.reload()} />
        </View>
      ) : (
        <ScrollView {...standardVerticalScrollProps} contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}>
          <View style={[styles.content, wide && styles.contentWide]}>
            {wide ? (
              <View style={[styles.wideGrid, stackColumns && styles.wideGridStacked]}>
                <View style={[styles.wideSideCol, stackColumns && styles.wideColFull]}>
                  {bookSummary}
                  <DeliveryTipsCard colors={colors} />
                </View>
                <View style={[styles.wideMainCol, stackColumns && styles.wideColFull]}>
                  {renderActionCard()}
                  {scanError || state.error ? (
                    <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                      {scanError ?? state.error}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <>
                {bookSummary}
                {renderActionCard()}
                {scanError || state.error ? (
                  <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                    {scanError ?? state.error}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        </ScrollView>
      )}
      <NegotiationRatingModal
        visible={ratingModalVisible}
        counterpartName={counterpartName}
        selectedScore={ratingState.selectedScore}
        onSelectScore={ratingActions.setSelectedScore}
        onSubmit={ratingActions.submitRating}
        onClose={() => setRatingModalVisible(false)}
        isSubmitting={ratingState.isSubmitting}
        submitError={ratingState.submitError}
        isSuccess={ratingState.isSuccess}
      />
    </SafeAreaView>
  );
}

export type DeliveryScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
};

export default function DeliveryScreen({ requestId, onBack, onRequireSignIn }: DeliveryScreenProps) {
  const [authState] = makeAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <Delivery requestId={requestId} sessionUserId={authState.user.id} onBack={onBack} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, minHeight: 0, backgroundColor: colors.surface },
    loadingContainer: {
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
      paddingHorizontal: tokens.spacing[16],
      paddingTop: tokens.spacing[16],
    },
    scroll: { paddingBottom: tokens.spacing[24] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: tokens.spacing[16], gap: tokens.spacing[16] },
    contentWide: { maxWidth: WEB_MAX_WIDTH, paddingHorizontal: tokens.spacing[24] },
    wideGrid: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[24],
      width: "100%",
    },
    wideGridStacked: { flexDirection: "column" },
    wideColFull: { width: "100%", maxWidth: "100%", minWidth: 0 },
    wideSideCol: {
      flex: 1,
      minWidth: 360,
      maxWidth: 460,
      gap: tokens.spacing[16],
    },
    wideMainCol: {
      flex: 1.3,
      minWidth: 440,
      gap: tokens.spacing[16],
    },
    card: {
      gap: tokens.spacing[16],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.extraLarge,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    headline: { ...tokens.typography.titleLarge, fontFamily: fontFamily.brand, color: colors.m3.onSurface },
    body: { ...tokens.typography.bodyLarge, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    qrBlock: { alignItems: "center", gap: tokens.spacing[12] },
    code: { ...tokens.typography.brandSection, letterSpacing: tokens.letterSpacing.code, color: colors.m3.onSurface },
    hint: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.regular, color: colors.m3.onSurfaceVariant },
    expired: { color: colors.error, fontFamily: fontFamily.semiBold },
    expiringSoon: { color: colors.ipe.bloomDeep, fontFamily: fontFamily.semiBold },
    camera: { height: 280, borderRadius: tokens.radius.large, overflow: "hidden", backgroundColor: "#000000" },
    permission: {
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    webNoticeBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[10],
      padding: tokens.spacing[12],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    webNoticeText: {
      flex: 1,
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurface,
    },
    error: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.medium, color: colors.error },
  });
}

function createSummaryStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: "row",
      gap: tokens.spacing[12],
      padding: tokens.spacing[14],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      alignItems: "center",
    },
    coverWrapper: {
      borderRadius: tokens.radius.small,
      overflow: "hidden",
    },
    detailsCol: {
      flex: 1,
      gap: tokens.spacing[4],
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    price: {
      ...tokens.typography.labelMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.m3.primary,
    },
    title: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.brand,
      color: colors.m3.onSurface,
    },
    author: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    counterpartRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[6],
      marginTop: tokens.spacing[2],
    },
    counterpartText: {
      ...tokens.typography.footnote,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
    },
    counterpartName: {
      fontFamily: fontFamily.semiBold,
      color: colors.m3.onSurface,
    },
  });
}

function createTipsStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      gap: tokens.spacing[10],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
    },
    title: {
      ...tokens.typography.titleMedium,
      fontFamily: fontFamily.semiBold,
      color: colors.nature.foliage,
    },
    body: {
      ...tokens.typography.bodyMedium,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
      lineHeight: 20,
    },
  });
}
