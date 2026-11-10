import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ReceivedRatingsScreen from "@/view/profile/receivedRatings";

export default function AvaliacoesRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ReceivedRatingsScreen
        onBack={() => backOnce()}
        onNavigateToSignIn={() => replaceOnce("/entrar")}
      />
    </RequireAuth>
  );
}
