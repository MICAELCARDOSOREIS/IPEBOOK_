import { router } from "expo-router";
import HelpAndFaq from "@/view/help/helpAndFaq";

export default function AjudaRoute() {
  return <HelpAndFaq onBack={() => router.back()} />;
}
