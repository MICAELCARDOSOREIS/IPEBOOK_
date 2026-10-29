import { router, useLocalSearchParams } from "expo-router";
import { PublicProfile } from "@/view/listings/publicProfile";

export default function PerfilPublico() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return <PublicProfile userId={userId} onBack={() => router.back()} />;
}
