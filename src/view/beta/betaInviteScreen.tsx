import { useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextField } from "@/view/components/TextField";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useBetaSignupViewModel, type BetaSignupActions, type BetaSignupState } from "@/viewmodel/useBetaSignupViewModel";

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.ipebook.app";

const STEPS = [
  "Deixe seu Gmail aqui embaixo. Ele precisa ser a conta Google do seu celular Android.",
  "Quando abrirmos a nova turma, você recebe o convite da Play Store nesse e-mail.",
  "Aceite o convite, instale o IpêBook e use por pelo menos 14 dias: anuncie, troque, converse.",
];

export type BetaInviteScreenProps = {
  state: BetaSignupState;
  actions: BetaSignupActions;
  onOpenStore?: () => void;
};

/** Página pública `/beta` (Spec 108), ligada ao caso de uso real. */
export default function BetaInviteRoute() {
  const [state, actions] = useBetaSignupViewModel();
  return <BetaInviteScreen state={state} actions={actions} />;
}

/** Convite para testar o app Android e cadastro do Gmail. */
export function BetaInviteScreen({
  state,
  actions,
  onOpenStore = () => void Linking.openURL(PLAY_STORE_URL).catch(() => {}),
}: BetaInviteScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Logotipo underline />
          <Manchete texto="Teste o IpêBook" realce="antes de todo mundo." />
          <Text style={styles.body}>
            O app de troca, venda e doação de livros de Piripiri está chegando à Play Store. Precisamos
            de leitores com celular Android para testar e contar o que achou.
          </Text>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>Como funciona</Text>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {state.success ? (
            <View style={styles.card} accessibilityLiveRegion="polite">
              <IconBadge icon="mail" tone="donation" size="large" />
              <Text accessibilityRole="alert" style={styles.cardTitle}>Inscrição recebida!</Text>
              <Text style={styles.stepText}>
                {email.trim() ? `Vamos mandar o convite para ${email.trim().toLowerCase()}.` : "Vamos mandar o convite para seu Gmail."}{" "}
                Fique de olho na caixa de entrada e no spam.
              </Text>
              <OutlinedButton
                label="Inscrever outro e-mail"
                onPress={() => {
                  setEmail("");
                  setName("");
                  actions.reset();
                }}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <TextField
                label="Seu nome (opcional)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!state.loading}
              />
              <TextField
                label="Gmail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!state.loading}
                placeholder="voce@gmail.com"
              />
              {state.error ? (
                <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
              ) : null}
              <FilledButton
                label="Quero testar"
                loading={state.loading}
                loadingLabel="Enviando inscrição"
                onPress={() => void actions.submit(email, name)}
              />
            </View>
          )}

          <OutlinedButton label="Ver o IpêBook na Play Store" onPress={onOpenStore} />
          <Text style={styles.footnote}>
            Usamos seu e-mail só para enviar o convite do teste. Veja a política de privacidade em
            ipebook.app/termos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  const body = {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
  };
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    container: {
      flexGrow: 1,
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[24],
      paddingBottom: tokens.spacing[32],
    },
    content: { width: "100%", maxWidth: 560, alignSelf: "center", gap: tokens.spacing[16] },
    body: { ...body, color: colors.secondaryText },
    card: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.radius.medium,
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    cardTitle: {
      color: colors.text,
      fontSize: tokens.typography.titleMedium.fontSize,
      lineHeight: tokens.typography.titleMedium.lineHeight,
      fontFamily: tokens.typography.titleMedium.fontFamily,
      fontWeight: tokens.typography.titleMedium.fontWeight,
    },
    step: { flexDirection: "row", gap: tokens.spacing[12], alignItems: "flex-start" },
    stepNumber: {
      ...body,
      color: colors.text,
      fontWeight: "700",
      minWidth: 20,
    },
    stepText: {
      flex: 1,
      color: colors.secondaryText,
      fontSize: tokens.typography.bodyMedium.fontSize,
      lineHeight: tokens.typography.bodyMedium.lineHeight,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
    },
    form: { gap: tokens.spacing[16] },
    error: {
      color: colors.error,
      fontSize: tokens.typography.bodyMedium.fontSize,
      fontFamily: tokens.typography.bodyMedium.fontFamily,
    },
    footnote: {
      textAlign: "center",
      color: colors.secondaryText,
      fontSize: tokens.typography.labelMedium.fontSize,
      lineHeight: tokens.typography.labelMedium.lineHeight,
      fontFamily: tokens.typography.labelMedium.fontFamily,
    },
  });
}
