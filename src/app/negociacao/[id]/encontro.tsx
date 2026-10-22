import { router, useLocalSearchParams } from "expo-router";
import ScheduleMeetingScreen from "@/view/requests/scheduleMeeting";

export default function CombinarEncontroRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScheduleMeetingScreen
      requestId={id ?? ""}
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onSent={() => router.back()}
    />
  );
}
