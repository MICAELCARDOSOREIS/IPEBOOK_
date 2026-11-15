import { Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade, bairro, categoria, q } = useLocalSearchParams<{ modalidade?: string; bairro?: string; categoria?: string; q?: string }>();
  const focusKey = useRefocusKey();

  const searchContent = (
    <Search
      focusKey={focusKey}
      initialModality={parseInitialModality(modalidade)}
      initialCategory={typeof categoria === "string" && categoria.trim() ? categoria.trim() : undefined}
      initialTerm={typeof q === "string" && q.trim() ? q.trim() : undefined}
      currentNeighborhood={typeof bairro === "string" ? bairro : undefined}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToFavorites={() => pushOnce("/favoritos")}
    />
  );

  // Na Web, a busca e catálogo são abertos para consulta pública.
  if (Platform.OS === "web") {
    return searchContent;
  }

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      {searchContent}
    </RequireAuth>
  );
}
