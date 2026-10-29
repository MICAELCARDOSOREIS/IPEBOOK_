import { router, useLocalSearchParams, type Href } from "expo-router";
import BookDetail from "@/view/listings/bookDetail";

export default function LivroDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BookDetail
      bookId={id}
      onBack={() => router.back()}
      // Perfil público (somente leitura) de quem anuncia — Spec 018/Issue #73. Distinto da
      // futura rota de edição do próprio perfil (fluxo 07, issues #55/#56).
      onNavigateToUserProfile={(ownerId) => router.push(`/perfil/${ownerId}` as Href)}
      onNavigateToReport={(bookId) => router.push(`/denunciar/${bookId}` as Href)}
    />
  );
}
