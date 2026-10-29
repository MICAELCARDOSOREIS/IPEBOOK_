import { router } from "expo-router";
import { InviteFriends } from "@/view/profile/inviteFriends";

export default function ConvidarRoute() {
  return <InviteFriends onBack={() => router.back()} />;
}
