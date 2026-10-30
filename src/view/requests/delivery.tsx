import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { buildDeliveryPayload, normalizeDeliveryCode, parseDeliveryPayload } from "@/model/entities/delivery";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useDeliveryViewModel } from "@/viewmodel/useDeliveryViewModel";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { AppIcon } from "@/view/components/AppIcon";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { LoadingState } from "@/view/components/LoadingState";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { QrCode } from "@/view/components/QrCode";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

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

/**
 * Entrega do livro (Spec 095, ADR 0070): quem anunciou mostra o QR e quem recebeu o lê ou digita o código.
 */
export function Delivery({ requestId, sessionUserId, onBack }: DeliveryProps) {
  const [state, actions] = useDeliveryViewModel(requestId, sessionUserId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const secondsLeft = useSecondsLeft(state.code?.expiresAt ?? null);
  const expired = secondsLeft === 0;

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

  const title = "Entrega do livro";
  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title={title} onBack={() => onBack?.()} />
      {state.loading ? (
        <LoadingState label="Carregando a entrega" />
      ) : state.loadError ? (
        <ErrorState message={state.loadError} onRetry={() => void actions.reload()} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            {state.completed ? (
              <View style={styles.card} accessibilityLiveRegion="polite">
                <IconBadge icon="check" tone="action" />
                <Text accessibilityRole="header" style={styles.headline}>Entrega concluída!</Text>
                <Text style={styles.body}>
                  Vocês confirmaram a entrega do livro. Volte à negociação para avaliar a experiência.
                </Text>
                <FilledButton label="Voltar à negociação" onPress={() => onBack?.()} />
              </View>
            ) : state.role === "giver" ? (
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.headline}>Mostre este QR para quem recebe o livro</Text>
                <Text style={styles.body}>A pessoa lê o QR no app dela e a entrega é concluída para as duas.</Text>
                {state.code ? (
                  <View style={styles.qrBlock}>
                    <QrCode
                      value={buildDeliveryPayload(requestId, state.code.code)}
                      size={248}
                      accessibilityLabel="QR code da entrega. Se preferir, informe o código por voz ou texto."
                    />
                    <Text selectable accessibilityLabel={`Código ${state.code.code.split("").join(" ")}`} style={styles.code}>
                      {groupCode(state.code.code)}
                    </Text>
                    <Text style={[styles.hint, expired && styles.expired]} accessibilityLiveRegion="polite">
                      {expired ? "Código expirado. Gere outro." : `Vale por ${formatClock(secondsLeft ?? 0)}`}
                    </Text>
                  </View>
                ) : null}
                <OutlinedButton
                  label={state.code ? "Gerar novo código" : "Gerar código"}
                  disabled={state.generating}
                  onPress={() => void actions.generate()}
                />
              </View>
            ) : (
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.headline}>Confirme que recebeu o livro</Text>
                <Text style={styles.body}>Aponte a câmera para o QR que a outra pessoa mostra ou digite o código.</Text>
                {permission?.granted ? (
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
            )}
            {scanError || state.error ? (
              <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
                {scanError ?? state.error}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export type DeliveryScreenProps = {
  requestId: string;
  onBack?: () => void;
  onRequireSignIn?: () => void;
};

export default function DeliveryScreen({ requestId, onBack, onRequireSignIn }: DeliveryScreenProps) {
  const [authState] = useAuthViewModel();

  useEffect(() => {
    if (!authState.loading && !authState.user) onRequireSignIn?.();
  }, [authState.loading, authState.user, onRequireSignIn]);

  if (authState.loading || !authState.user) return null;
  return <Delivery requestId={requestId} sessionUserId={authState.user.id} onBack={onBack} />;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.surface },
    scroll: { paddingBottom: tokens.spacing[24] },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: tokens.spacing[16], gap: tokens.spacing[16] },
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
    camera: { height: 280, borderRadius: tokens.radius.large, overflow: "hidden", backgroundColor: "#000000" },
    permission: {
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerHigh,
    },
    error: { ...tokens.typography.bodyMedium, fontFamily: fontFamily.medium, color: colors.error },
  });
}
