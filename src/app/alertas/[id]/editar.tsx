import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import EditAlertScreen from "@/view/search/editAlertScreen";

export default function EditAlertRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <EditAlertScreen
        alertId={id ?? ""}
        onBack={() => backOnce()}
        onSaved={() => backOnce()}
      />
    </RequireAuth>
  );
}
