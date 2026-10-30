import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ManageAlertScreen from "@/view/search/manageAlertScreen";

export default function ManageAlertRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ManageAlertScreen
        key={focusKey}
        alertId={id ?? ""}
        onBack={() => backOnce()}
        onEditAlert={(alertId) => pushOnce({ pathname: "/alertas/[id]/editar", params: { id: alertId } })}
        onAlertDeleted={() => replaceOnce("/alertas")}
      />
    </RequireAuth>
  );
}
