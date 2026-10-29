import { router, useLocalSearchParams } from "expo-router";
import EditAlertScreen from "@/view/search/editAlertScreen";

export default function EditAlertRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <EditAlertScreen
      alertId={id ?? ""}
      onBack={() => router.back()}
      onSaved={() => router.back()}
    />
  );
}
