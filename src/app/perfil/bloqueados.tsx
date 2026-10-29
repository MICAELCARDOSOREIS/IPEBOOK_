import { router } from "expo-router";
import { BlockedUsers } from "@/view/profile/blockedUsers";

export default function BloqueadosRoute() {
  return <BlockedUsers onBack={() => router.back()} />;
}
