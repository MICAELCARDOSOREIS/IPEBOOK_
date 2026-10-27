import { useLocalSearchParams } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade, bairro } = useLocalSearchParams<{ modalidade?: string; bairro?: string }>();

  return (
    // Explorar exige conta: sem sessão a rota redireciona para o acesso (Spec 092).
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <Search
        initialModality={parseInitialModality(modalidade)}
        currentNeighborhood={typeof bairro === "string" ? bairro : undefined}
        onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
        onNavigateToAlerts={(term) => pushOnce({ pathname: "/alertas", params: { termo: term } })}
      />
    </RequireAuth>
  );
}
