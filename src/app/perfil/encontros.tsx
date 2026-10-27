import { backOnce, pushOnce } from "@/view/pushOnce";
import MeetingHistory from "@/view/profile/meetingHistory";

export default function EncontrosRoute() {
  return (
    <MeetingHistory
      onBack={() => backOnce()}
      onNavigateToNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}`)}
    />
  );
}
