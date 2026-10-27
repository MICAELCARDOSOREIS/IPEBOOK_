import { useLocalSearchParams } from "expo-router";
import { backOnce } from "@/view/pushOnce";
import EditAlertScreen from "@/view/search/editAlertScreen";

export default function EditAlertRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <EditAlertScreen
      alertId={id ?? ""}
      onBack={() => backOnce()}
      onSaved={() => backOnce()}
    />
  );
}
