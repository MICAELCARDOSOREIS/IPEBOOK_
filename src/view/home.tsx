import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { tokens } from "@/view/tokens";
import { AppIcon } from "@/view/components/AppIcon";
import type { BookModality } from "@/model/entities/book";

const modalityTag: Record<BookModality, { background: string; text: string; label: string }> = {
  sale: { background: tokens.colors.badge.sale.background, text: tokens.colors.badge.sale.text, label: "Venda" },
  trade: { background: tokens.colors.badge.trade.background, text: tokens.colors.badge.trade.text, label: "Troca" },
  donation: { background: tokens.colors.badge.donation.background, text: tokens.colors.badge.donation.text, label: "Doação" },
};

export type HomeProps = {
  onNavigateToSignIn?: () => void;
  onNavigateToCreateListing?: () => void;
};

export default function Home({ onNavigateToSignIn, onNavigateToCreateListing }: HomeProps = {}) {
  const [state, actions] = useHomeViewModel();
  const [authState, authActions] = useAuthViewModel();

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <View style={styles.mark} accessible={false} />
          <Text accessibilityRole="header" style={styles.title}>Ipebook</Text>
        </View>
        <Text style={styles.subtitle}>Um lugar para descobrir sua próxima leitura.</Text>
        {authState.loading ? null : authState.user ? (
          <View style={styles.sessionRow}>
            <Text style={styles.sessionText}>Olá, {authState.user.email}</Text>
            <View style={styles.sessionActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onNavigateToCreateListing?.()}
                style={styles.sessionButton}
              >
                <Text style={styles.sessionButtonText}>Anunciar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void authActions.signOut()}
                style={styles.sessionButton}
              >
                <Text style={styles.sessionButtonText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.sessionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onNavigateToSignIn?.()}
              style={styles.sessionButton}
            >
              <Text style={styles.sessionButtonText}>Entrar</Text>
            </Pressable>
          </View>
        )}
        <Text accessibilityRole="header" style={styles.heading}>Livros</Text>
        {state.loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando livros" />
            <Text style={styles.body}>Carregando livros…</Text>
          </View>
        ) : state.error ? (
          <View style={styles.status}>
            <View style={styles.errorRow}>
              <AppIcon name="error" color={tokens.colors.error} />
              <Text accessibilityRole="alert" style={styles.body}>{state.error}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => void actions.reload()} style={styles.button}>
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={state.books}
            keyExtractor={(book) => book.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Ainda não há livros por aqui.</Text>
                <Text style={styles.body}>Quando houver livros disponíveis, eles aparecerão neste espaço.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const tag = modalityTag[item.modality];
              return (
                <View style={styles.book}>
                  <View style={styles.bookHeader}>
                    <Text style={styles.emptyTitle}>{item.title}</Text>
                    <View style={[styles.tag, { backgroundColor: tag.background }]}>
                      <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.body}>{item.author}</Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], paddingTop: tokens.spacing[48] },
  brand: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
  mark: { width: 16, height: 36, backgroundColor: tokens.colors.highlight, borderTopRightRadius: tokens.radius.medium },
  title: { fontSize: tokens.typography.displayLarge.fontSize, fontWeight: tokens.typography.displayLarge.fontWeight, color: tokens.colors.action },
  subtitle: { fontSize: 17, lineHeight: 26, color: tokens.colors.secondaryText, marginTop: 14, marginBottom: tokens.spacing[24] },
  sessionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.spacing[24] },
  sessionText: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText },
  sessionActions: { flexDirection: "row", alignItems: "center" },
  sessionButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[12] },
  sessionButtonText: { color: tokens.colors.action, fontSize: 14, fontWeight: "600" },
  heading: { fontSize: tokens.typography.titleLarge.fontSize, fontWeight: tokens.typography.titleLarge.fontWeight, color: tokens.colors.action, marginBottom: tokens.spacing[24] },
  list: { paddingBottom: tokens.spacing[24] },
  empty: { borderTopWidth: 1, borderTopColor: tokens.colors.border, paddingTop: 28, gap: 10 },
  emptyTitle: { fontSize: 19, fontWeight: "600", color: tokens.colors.action },
  body: { fontSize: tokens.typography.bodyLarge.fontSize, lineHeight: 25, color: tokens.colors.secondaryText },
  status: { gap: 18, alignItems: "flex-start" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
  button: { minHeight: tokens.accessibility.touchTarget, minWidth: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[20], borderRadius: tokens.radius.small, backgroundColor: tokens.colors.action },
  buttonText: { color: tokens.colors.surface, fontSize: 16, fontWeight: "600" },
  book: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: tokens.colors.border, gap: 6 },
  bookHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: tokens.spacing[12] },
  tag: { borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], paddingVertical: tokens.spacing[6] },
  tagText: { fontSize: tokens.typography.labelMedium.fontSize, fontWeight: tokens.typography.labelMedium.fontWeight },
});
