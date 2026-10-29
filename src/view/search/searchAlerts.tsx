import { useId, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "@/view/components/AppIcon";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { Tag } from "@/view/components/Tag";
import { ALERT_CITY, ALERT_MODALITY_SUMMARY } from "@/view/search/alertLabels";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type SearchAlertsProps = {
  userId: string | null;
  initialQuery?: string;
  onBack: () => void;
  onLogin: () => void;
  /** Abre a busca do catálogo, como o botão "Procurar outro livro" do Figma `02.07`. */
  onSearchBooks?: () => void;
  onManageAlert?: (alertId: string) => void;
};

/**
 * Figma `02.07 · Meus alertas` (`145:2921` / Web `370:17381`),
 * `02.08 · Avisaremos você` (`19:420` / Web `148:968`),
 * `02.09`–`02.13` (`254:4285`–`254:4728` / Web `370:15901`–`370:16061`).
 */
export default function SearchAlerts({ userId, initialQuery = "", onBack, onLogin, onSearchBooks, onManageAlert }: SearchAlertsProps) {
  const [state, actions] = useSearchAlertsViewModel(userId, initialQuery);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const errorId = useId();
  const hasError = Boolean(state.error);
  /**
   * Sem alertas, `02.08` dispensa a manchete da lista cheia. O formulário permanece porque o alerta
   * também nasce aqui (Spec 016), além de `02.06`.
   */
  const showListChrome = state.loading || state.alerts.length > 0;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Meus alertas" onBack={onBack} />
      {!userId ? (
        <View style={styles.centered}>
          <IconBadge icon="bell" tone="action" />
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Entre para criar alertas
          </Text>
          <Text style={styles.bodyCenter}>
            Receba um aviso quando alguém anunciar o livro que você procura em Piripiri.
          </Text>
          <Pressable accessibilityRole="button" onPress={onLogin} style={styles.loginButton}>
            <Text style={styles.link}>Entrar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          {showListChrome ? (
            <View style={styles.heroHeader}>
              <Text style={styles.heroTitle}>O próximo livro pode chegar.</Text>
              <Text style={styles.body}>
                Avisamos quando houver um anúncio que combine com sua busca.
              </Text>
            </View>
          ) : null}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              Avisaremos você
            </Text>
            <Text style={styles.body}>
              Avisaremos na central de notificações quando surgir um livro com este título ou autor.
            </Text>
            <TextInput
              accessibilityLabel="Termo do alerta"
              value={state.query}
              onChangeText={actions.setQuery}
              accessibilityHint={hasError ? state.error ?? undefined : undefined}
              aria-describedby={hasError ? errorId : undefined}
              placeholder="Título ou autor"
              placeholderTextColor={colors.secondaryText}
              style={[styles.input, hasError && styles.inputError]}
              maxLength={100}
            />
            {hasError ? (
              <Text nativeID={errorId} accessibilityRole="alert" style={styles.error}>
                {state.error}
              </Text>
            ) : null}
            {state.message ? (
              <Text accessibilityRole="alert" style={styles.successMessage}>
                {state.message}
              </Text>
            ) : null}
            <FilledButton
              label="Criar alerta"
              onPress={() => void actions.create()}
            />
          </View>

          {state.loading ? (
            <ActivityIndicator color={colors.action} accessibilityLabel="Carregando alertas" />
          ) : (
            <FlatList
              data={state.alerts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text accessibilityRole="header" style={styles.emptyHeadline}>
                    Nenhum alerta criado
                  </Text>
                  <Text style={styles.body}>
                    Busque um título ou tema e ative um alerta para receber novidades.
                  </Text>
                  {/* `02.13`: a ação vem logo depois do texto, não presa ao rodapé (Spec 043, RN-11). */}
                  {onSearchBooks ? <FilledButton label="Procurar um livro" onPress={onSearchBooks} /> : null}
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.alertItem}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Gerenciar alerta ${item.query}`}
                    onPress={() => onManageAlert?.(item.id)}
                    style={styles.row}
                  >
                    <AppIcon name="bell" size={24} color={colors.text} />
                    <View style={styles.rowText}>
                      <Text style={styles.title}>{item.query}</Text>
                      <Text style={styles.metaText}>{`${ALERT_MODALITY_SUMMARY(item.modalities)} · ${ALERT_CITY}`}</Text>
                      {item.active ? null : <Tag variant="paused" label="Pausado" />}
                    </View>
                  </Pressable>
                  {item.active ? (
                    <View style={styles.activeAlertCard}>
                      <Text style={styles.activeAlertTitle}>Alerta ativo</Text>
                      <Text style={styles.body}>
                        {`Você recebe uma notificação quando um novo livro corresponde à busca por ${item.query}.`}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            />
          )}
          {onSearchBooks && showListChrome ? (
            <View style={styles.searchAction}>
              <OutlinedButton label="Procurar outro livro" onPress={onSearchBooks} />
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
  },
  centered: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing[24],
    gap: tokens.spacing[12],
  },
  heroHeader: {
    gap: tokens.spacing[4],
  },
  heroTitle: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  formCard: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  formTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  title: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
    textAlign: "center",
  },
  metaText: {
    ...tokens.typography.labelMedium,
    color: colors.secondaryText,
  },
  body: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  bodyCenter: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    textAlign: "center",
  },
  error: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
  },
  successMessage: {
    ...tokens.typography.bodyMedium,
    color: colors.success,
    fontWeight: "600",
  },
  searchAction: {
    paddingHorizontal: tokens.spacing[16],
    paddingTop: tokens.spacing[8],
  },
  link: {
    ...tokens.typography.bodyMedium,
    color: colors.action,
    fontWeight: "600",
  },
  loginButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[16],
  },
  input: {
    minHeight: tokens.accessibility.touchTarget,
    borderWidth: 1,
    borderColor: colors.m3.outline,
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[12],
    ...tokens.typography.bodyLarge,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  listContent: {
    gap: tokens.spacing[12],
    paddingBottom: tokens.spacing[24],
  },
  emptyBox: {
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[8],
    gap: tokens.spacing[8],
  },
  alertItem: {
    gap: tokens.spacing[12],
  },
  row: {
    minHeight: tokens.accessibility.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.spacing[8],
    gap: tokens.spacing[12],
  },
  activeAlertCard: {
    backgroundColor: colors.badge.sale.background,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  activeAlertTitle: {
    fontSize: tokens.typography.titleMedium.fontSize,
    lineHeight: tokens.typography.titleMedium.lineHeight,
    fontFamily: tokens.typography.titleMedium.fontFamily,
    color: colors.text,
  },
  rowText: {
    flex: 1,
    gap: tokens.spacing[6],
  },
  });
}
