import { useLocalSearchParams, type Href } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import BookDetail from "@/view/listings/bookDetail";

export default function LivroDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BookDetail
      bookId={id}
      onBack={() => backOnce()}
      // Perfil público (somente leitura) de quem anuncia — Spec 018/Issue #73. Distinto da
      // futura rota de edição do próprio perfil (fluxo 07, issues #55/#56).
      onNavigateToUserProfile={(ownerId) => pushOnce(`/perfil/${ownerId}` as Href)}
      onNavigateToReport={(bookId) => pushOnce(`/denunciar/${bookId}` as Href)}
      onNavigateToSignIn={() => pushOnce("/entrar")}
      onNavigateToManageListing={(bookId) => pushOnce(`/gerenciar-anuncio/${bookId}` as Href)}
      onNavigateToMyRequests={() => pushOnce("/meus-pedidos")}
      onNavigateToNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}` as Href)}
      onNavigateToCategorySearch={(category) => pushOnce({ pathname: "/pesquisa", params: { categoria: category } } as never)}
    />
  );
}
