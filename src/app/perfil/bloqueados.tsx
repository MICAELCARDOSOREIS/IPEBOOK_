import { backOnce } from "@/view/pushOnce";
import { BlockedUsers } from "@/view/profile/blockedUsers";

export default function BloqueadosRoute() {
  return <BlockedUsers onBack={() => backOnce()} />;
}
