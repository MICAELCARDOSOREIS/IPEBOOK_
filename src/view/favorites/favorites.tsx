import { useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookCover } from "@/view/components/BookCover";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";

export type FavoritesProps = { userId: string | null; focusKey?: number; onBack: () => void; onLogin: () => void; onBook: (id: string) => void };

export default function Favorites({ userId, focusKey = 0, onBack, onLogin, onBook }: FavoritesProps) {
  const [state, actions] = useFavoritesViewModel(userId);
  const firstFocus = useRef(true);
  useEffect(() => {
    if (firstFocus.current) { firstFocus.current = false; return; }
    void actions.reload();
  }, [focusKey]);
  return <SafeAreaView style={styles.page}>
    <TopAppBar title="Favoritos" onBack={onBack} />
    {!userId ? <View style={styles.status}>
      <Text accessibilityRole="header" style={styles.title}>Entre para ver seus favoritos</Text>
      <Pressable accessibilityRole="button" onPress={onLogin}><Text style={styles.link}>Entrar</Text></Pressable>
    </View> : state.loading ? <ActivityIndicator accessibilityLabel="Carregando favoritos" />
      : state.error ? <View style={styles.status}><Text accessibilityRole="alert">{state.error}</Text>
        <Pressable accessibilityRole="button" onPress={() => void actions.reload()}><Text style={styles.link}>Tentar novamente</Text></Pressable></View>
      : <FlatList data={state.books} keyExtractor={(book) => book.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.status}><Text accessibilityRole="header" style={styles.title}>Nenhum favorito ainda</Text><Text>Toque no coração de um anúncio para guardá-lo aqui.</Text></View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${item.title}`} onPress={() => onBook(item.id)} style={styles.row}>
          <BookCover id={item.id} title={item.title} photoUrl={item.photoUrl} variant="list" />
          <View><Text style={styles.title}>{item.title}</Text><Text>{item.author}</Text></View>
        </Pressable>} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  list: { padding: tokens.spacing[24] },
  status: { alignItems: "center", gap: tokens.spacing[12], padding: tokens.spacing[24] },
  title: { fontSize: 18, fontWeight: "600", color: tokens.colors.action },
  link: { color: tokens.colors.action, fontWeight: "600", padding: tokens.spacing[12] },
  row: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], minHeight: tokens.accessibility.touchTarget, borderBottomWidth: 1, borderBottomColor: tokens.colors.border, paddingVertical: tokens.spacing[12] },
});
