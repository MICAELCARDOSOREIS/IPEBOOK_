import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import ManageAlertScreen from "@/view/search/manageAlertScreen";

export default function ManageAlertRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));
  return (
    <ManageAlertScreen
      key={focusKey}
      alertId={id ?? ""}
      onBack={() => router.back()}
      onEditAlert={(alertId) => router.push({ pathname: "/alertas/[id]/editar", params: { id: alertId } })}
      onAlertDeleted={() => router.replace("/alertas")}
    />
  );
}
