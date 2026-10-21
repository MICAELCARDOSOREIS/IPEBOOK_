import { useId, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog } from "@/view/components/Dialog";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { Tag } from "@/view/components/Tag";
import { TextButton } from "@/view/components/TextButton";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type SearchAlertsProps = {
  userId: string | null;
  initialQuery?: string;
  onBack: () => void;
  onLogin: () => void;
  /** Abre a busca do catálogo, como o botão "Procurar outro livro" do Figma `02.07`. */
  onSearchBooks?: () => void;
};

/**
 * Figma `02.07 · Meus alertas` (`145:2921` / Web `370:17381`),
 * `02.08 · Avisaremos você` (`19:420` / Web `148:968`),
 * `02.09`–`02.13` (`254:4285`–`254:4728` / Web `370:15901`–`370:16061`).
 */
export default function SearchAlerts({ userId, initialQuery = "", onBack, onLogin, onSearchBooks }: SearchAlertsProps) {
  const [state, actions] = useSearchAlertsViewModel(userId, initialQuery);
  const [alertToDelete, setAlertToDelete] = useState<{ id: string; query: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const errorId = useId();
  const hasError = Boolean(state.error);
  /**
   * Sem alertas, `02.08` dispensa a manchete da lista cheia. O formulário permanece porque o alerta
   * também nasce aqui (Spec 016), além de `02.06`.
   */
  const showListChrome = state.loading || state.alerts.length > 0 || editingId !== null;
  const cancelEdit = () => {
    setEditingId(null);
    actions.setQuery("");
  };
  const saveEdit = async () => {
    if (!editingId) {
      await actions.create();
      return;
    }
    if (await actions.update(editingId, state.query)) setEditingId(null);
  };

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
              {editingId ? "Editar alerta de busca" : "Avisaremos você"}
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
              placeholderTextColor={tokens.colors.secondaryText}
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
              label={editingId ? "Salvar edição" : "Criar alerta"}
              onPress={() => void saveEdit()}
            />
            {editingId ? (
              <TextButton label="Cancelar edição" onPress={cancelEdit} />
            ) : null}
          </View>

          {state.loading ? (
            <ActivityIndicator color={tokens.colors.action} accessibilityLabel="Carregando alertas" />
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
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.title}>{item.query}</Text>
                    <Text style={styles.metaText}>Venda, troca e doação · Piripiri, PI</Text>
                    <Tag
                      variant={item.active ? "available" : "paused"}
                      label={item.active ? "Ativo" : "Pausado"}
                    />
                    <View style={item.active ? styles.statusCard : styles.statusCardPaused}>
                      <Text style={styles.statusTitle}>
                        {item.active ? "Alerta ativo" : "Alerta pausado"}
                      </Text>
                      <Text style={styles.body}>
                        {item.active
                          ? `Você recebe uma notificação quando um novo livro corresponde à busca por ${item.query}.`
                          : `Retome o alerta para voltar a receber avisos sobre ${item.query}.`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Editar alerta ${item.query}`}
                      onPress={() => {
                        setEditingId(item.id);
                        actions.setQuery(item.query);
                      }}
                      style={styles.smallAction}
                    >
                      <Text style={styles.link}>Editar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        item.active ? `Pausar alerta ${item.query}` : `Retomar alerta ${item.query}`
                      }
                      onPress={() => void actions.setActive(item.id, !item.active)}
                      style={styles.smallAction}
                    >
                      <Text style={styles.link}>{item.active ? "Pausar" : "Retomar"}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir alerta ${item.query}`}
                      onPress={() => setAlertToDelete({ id: item.id, query: item.query })}
                      style={styles.smallAction}
                    >
                      <Text style={styles.deleteText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
          {onSearchBooks ? (
            <View style={styles.searchAction}>
              {showListChrome ? (
                <OutlinedButton label="Procurar outro livro" onPress={onSearchBooks} />
              ) : (
                <FilledButton label="Procurar um livro" onPress={onSearchBooks} />
              )}
            </View>
          ) : null}
          <Dialog
            visible={alertToDelete !== null}
            title="Excluir este alerta?"
            message={
              alertToDelete
                ? `Tem certeza de que deseja excluir o alerta de busca para "${alertToDelete.query}"?`
                : ""
            }
            confirmLabel="Confirmar exclusão"
            cancelLabel="Cancelar"
            destructive
            onCancel={() => setAlertToDelete(null)}
            onConfirm={() => {
              if (alertToDelete) {
                const id = alertToDelete.id;
                setAlertToDelete(null);
                void actions.remove(id);
              }
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
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
    color: tokens.colors.text,
  },
  formCard: {
    backgroundColor: tokens.colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  formTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  title: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  emptyHeadline: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  emptyTitle: {
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
    textAlign: "center",
  },
  metaText: {
    ...tokens.typography.labelMedium,
    color: tokens.colors.secondaryText,
  },
  body: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
  },
  bodyCenter: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.secondaryText,
    textAlign: "center",
  },
  error: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
  },
  successMessage: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.success,
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: tokens.colors.m3.secondaryContainer,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusCardPaused: {
    backgroundColor: tokens.colors.m3.surfaceContainerHigh,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    gap: tokens.spacing[4],
  },
  statusTitle: {
    ...tokens.typography.titleMedium,
    color: tokens.colors.text,
  },
  searchAction: {
    paddingHorizontal: tokens.spacing[16],
    paddingTop: tokens.spacing[8],
  },
  link: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.action,
    fontWeight: "600",
  },
  deleteText: {
    ...tokens.typography.bodyMedium,
    color: tokens.colors.error,
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
    borderColor: tokens.colors.m3.outline,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.small,
    paddingHorizontal: tokens.spacing[12],
    ...tokens.typography.bodyLarge,
    color: tokens.colors.text,
  },
  inputError: {
    borderColor: tokens.colors.error,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  rowText: {
    flex: 1,
    gap: tokens.spacing[6],
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
  },
  smallAction: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[8],
  },
});
