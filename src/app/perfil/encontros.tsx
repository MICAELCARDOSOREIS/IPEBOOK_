import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import MeetingHistory from "@/view/profile/meetingHistory";

export default function EncontrosRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <MeetingHistory
        onBack={() => backOnce()}
        onNavigateToNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}`)}
      />
    </RequireAuth>
  );
}
