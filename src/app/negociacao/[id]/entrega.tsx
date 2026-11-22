import { useLocalSearchParams } from "expo-router";
import { Platform } from "react-native";
import { RequireAuth } from "@/view/components/RequireAuth";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import DeliveryScreen from "@/view/requests/delivery";

export default function EntregaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requireSignIn = () => replaceOnce("/entrar");
  const screen = (
    <DeliveryScreen
      requestId={id ?? ""}
      onBack={() => backOnce()}
      onRequireSignIn={Platform.OS === "web" ? undefined : requireSignIn}
    />
  );
  return Platform.OS === "web" ? <RequireAuth onRequireSignIn={requireSignIn}>{screen}</RequireAuth> : screen;
}
