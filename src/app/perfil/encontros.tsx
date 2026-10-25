import { router } from "expo-router";
import MeetingHistory from "@/view/profile/meetingHistory";

export default function EncontrosRoute() {
  return (
    <MeetingHistory
      onBack={() => router.back()}
      onNavigateToNegotiation={(requestId) => router.push(`/negociacao/${requestId}`)}
    />
  );
}
