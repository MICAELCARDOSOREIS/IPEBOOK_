import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog } from "@/view/components/Dialog";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

export type SearchAlertsProps = { userId: string | null; initialQuery?: string; onBack: () => void; onLogin: () => void };

export default function SearchAlerts({ userId, initialQuery = "", onBack, onLogin }: SearchAlertsProps) {
  const [state, actions] = useSearchAlertsViewModel(userId, initialQuery);
  const [alertToDelete, setAlertToDelete] = useState<{ id: string; query: string } | null>(null);
  return <SafeAreaView style={styles.page}>
    <TopAppBar title="Meus alertas" onBack={onBack} />
    {!userId ? <View style={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>Entre para criar alertas</Text>
      <Pressable accessibilityRole="button" onPress={onLogin}><Text style={styles.link}>Entrar</Text></Pressable>
    </View> : <View style={styles.content}>
      <Text style={styles.body}>Avisaremos na central de notificações quando surgir um livro com este título ou autor.</Text>
      <TextInput accessibilityLabel="Termo do alerta" value={state.query} onChangeText={actions.setQuery}
        placeholder="Título ou autor" style={styles.input} maxLength={100} />
      <Pressable accessibilityRole="button" onPress={() => void actions.create()} style={styles.action}>
        <Text style={styles.actionText}>Criar alerta</Text>
      </Pressable>
      {state.message ? <Text accessibilityRole="alert" style={styles.body}>{state.message}</Text> : null}
      {state.error ? <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text> : null}
      {state.loading ? <ActivityIndicator accessibilityLabel="Carregando alertas" /> :
        <FlatList data={state.alerts} keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text accessibilityRole="header" style={styles.body}>Você ainda não criou alertas.</Text>}
          renderItem={({ item }) => <View style={styles.row}>
            <View style={styles.rowText}><Text style={styles.title}>{item.query}</Text><Text style={styles.body}>{item.active ? "Ativo" : "Pausado"}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel={item.active ? `Pausar alerta ${item.query}` : `Retomar alerta ${item.query}`}
              onPress={() => void actions.setActive(item.id, !item.active)} style={styles.smallAction}><Text style={styles.link}>{item.active ? "Pausar" : "Retomar"}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Excluir alerta ${item.query}`}
              onPress={() => setAlertToDelete({ id: item.id, query: item.query })} style={styles.smallAction}><Text style={styles.error}>Excluir</Text></Pressable>
          </View>} />}
      <Dialog
        visible={alertToDelete !== null}
        title="Excluir este alerta?"
        message={alertToDelete ? `Tem certeza de que deseja excluir o alerta de busca para "${alertToDelete.query}"?` : ""}
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
    </View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, padding: tokens.spacing[24], gap: tokens.spacing[16] },
  title: { fontSize: 17, color: tokens.colors.action, fontWeight: "600" },
  body: { color: tokens.colors.secondaryText, fontSize: 15 },
  error: { color: tokens.colors.error, fontSize: 15 },
  link: { color: tokens.colors.action, fontWeight: "600" },
  input: { minHeight: tokens.accessibility.touchTarget, borderWidth: 1, borderColor: tokens.colors.border, backgroundColor: tokens.colors.surface, borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12] },
  action: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center", borderRadius: tokens.radius.small, backgroundColor: tokens.colors.action },
  actionText: { color: tokens.colors.surface, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: tokens.colors.border, paddingVertical: tokens.spacing[12] },
  rowText: { flex: 1 }, smallAction: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", paddingHorizontal: tokens.spacing[8] },
});
