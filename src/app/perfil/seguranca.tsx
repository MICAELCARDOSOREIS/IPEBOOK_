import { router } from "expo-router";
import { Security } from "@/view/profile/security";

export default function SegurancaRoute() {
  return <Security onBack={() => router.back()} />;
}
