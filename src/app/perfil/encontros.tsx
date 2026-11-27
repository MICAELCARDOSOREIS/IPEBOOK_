import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import MeetingHistory from "@/view/profile/meetingHistory";

export default function EncontrosRoute() {
  const focusKey = useRefocusKey();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <MeetingHistory
        focusKey={focusKey}
        onBack={() => backOnce()}
        onNavigateToNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}`)}
      />
    </RequireAuth>
  );
}
