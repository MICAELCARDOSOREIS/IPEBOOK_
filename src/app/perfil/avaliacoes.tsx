import { backOnce, replaceOnce } from "@/view/pushOnce";
import ReceivedRatingsScreen from "@/view/profile/receivedRatings";

export default function AvaliacoesRoute() {
  return (
    <ReceivedRatingsScreen
      onBack={() => backOnce()}
      onNavigateToSignIn={() => replaceOnce("/entrar")}
    />
  );
}
