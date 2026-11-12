import { Platform } from "react-native";
import { makeAppUpdateViewModel } from "@/di/container";
import { Dialog } from "@/view/components/Dialog";

export function AppUpdateGate() {
  const { status, policy, loading, dismiss, openStore } = makeAppUpdateViewModel();
  if (Platform.OS === "web" || loading || !policy || status === "up_to_date") return null;
  const required = status === "required";
  const notes = policy.releaseNotes ? `\n\nNovidades: ${policy.releaseNotes}` : "";
  return (
    <Dialog
      visible
      title={required ? "Atualização necessária" : "Nova versão disponível"}
      message={
        required
          ? `Atualize o IpêBook para continuar usando o aplicativo.${notes}`
          : `Uma nova versão do IpêBook está disponível na Google Play.${notes}`
      }
      confirmLabel={required ? "Atualizar na Google Play" : "Atualizar agora"}
      cancelLabel={required ? undefined : "Agora não"}
      showCancel={!required}
      onConfirm={() => void openStore()}
      onCancel={() => void dismiss()}
    />
  );
}
