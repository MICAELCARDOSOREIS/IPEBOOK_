import { router } from "expo-router";
import CreateListingScreen from "@/view/listings/createListingScreen";

export default function AnunciarRoute() {
  return (
    <CreateListingScreen
      onCreated={() => router.back()}
      onCancel={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
    />
  );
}
