import { router, useLocalSearchParams } from "expo-router";
import EditListingScreen from "@/view/listings/editListingScreen";

export default function EditarAnuncioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <EditListingScreen
      bookId={id}
      onSaved={() => router.back()}
      onCancel={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
    />
  );
}
