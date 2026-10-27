import { backOnce } from "@/view/pushOnce";
import { Security } from "@/view/profile/security";

export default function SegurancaRoute() {
  return <Security onBack={() => backOnce()} />;
}
