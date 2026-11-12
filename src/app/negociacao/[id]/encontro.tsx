import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import ScheduleMeetingScreen from "@/view/requests/scheduleMeeting";

export default function CombinarEncontroRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScheduleMeetingScreen
      requestId={id ?? ""}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onSent={() => backOnce()}
    />
  );
}
