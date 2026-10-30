import { useLocalSearchParams } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade, bairro, categoria } = useLocalSearchParams<{ modalidade?: string; bairro?: string; categoria?: string }>();

  return (
    // Explorar exige conta: sem sessão a rota redireciona para o acesso (Spec 092).
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <Search
        initialModality={parseInitialModality(modalidade)}
        initialCategory={typeof categoria === "string" && categoria.trim() ? categoria.trim() : undefined}
        currentNeighborhood={typeof bairro === "string" ? bairro : undefined}
        onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
        onNavigateToFavorites={() => pushOnce("/favoritos")}
      />
    </RequireAuth>
  );
}
