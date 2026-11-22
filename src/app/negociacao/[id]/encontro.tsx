import { useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import { RequireAuth } from "@/view/components/RequireAuth";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import ScheduleMeetingScreen from "@/view/requests/scheduleMeeting";

export default function CombinarEncontroRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requireSignIn = () => replaceOnce("/entrar");
  const screen = (
    <ScheduleMeetingScreen
      requestId={id ?? ""}
      onBack={() => backOnce()}
      onRequireSignIn={Platform.OS === "web" ? undefined : requireSignIn}
      onSent={() => backOnce()}
    />
  );
  return Platform.OS === "web" ? <RequireAuth onRequireSignIn={requireSignIn}>{screen}</RequireAuth> : screen;
}
