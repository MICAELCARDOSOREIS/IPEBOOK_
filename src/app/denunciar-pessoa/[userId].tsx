import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ReportUser from "@/view/listings/reportUser";

export default function DenunciarPessoa() {
  const { userId, nome } = useLocalSearchParams<{ userId: string; nome?: string }>();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ReportUser userId={userId} userName={nome} onBack={() => backOnce()} onNavigateToLogin={() => pushOnce("/entrar")} />
    </RequireAuth>
  );
}
