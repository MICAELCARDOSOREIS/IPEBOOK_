import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import DeliveryScreen from "@/view/requests/delivery";

export default function EntregaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <DeliveryScreen
      requestId={id ?? ""}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
    />
  );
}
