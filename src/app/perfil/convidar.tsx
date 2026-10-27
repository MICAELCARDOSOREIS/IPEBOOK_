import { backOnce } from "@/view/pushOnce";
import { InviteFriends } from "@/view/profile/inviteFriends";

export default function ConvidarRoute() {
  return <InviteFriends onBack={() => backOnce()} />;
}
