import { backOnce, pushOnce } from "@/view/pushOnce";
import HelpAndFaq from "@/view/help/helpAndFaq";

export default function AjudaRoute() {
  return <HelpAndFaq onBack={() => backOnce()} onOpenConversations={() => pushOnce("/meus-pedidos")} />;
}
