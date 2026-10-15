import { router, useLocalSearchParams, type Href } from "expo-router";
import BookDetail from "@/view/listings/bookDetail";

export default function LivroDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BookDetail
      bookId={id}
      onBack={() => router.back()}
      // "/usuario/[id]" ainda não existe (é da issue #55); já aponta para lá, conforme US5.
      onNavigateToUserProfile={(ownerId) => router.push(`/usuario/${ownerId}` as Href)}
      onNavigateToReport={(bookId) => router.push(`/denunciar/${bookId}` as Href)}
    />
  );
}
