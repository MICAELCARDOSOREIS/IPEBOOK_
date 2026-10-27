import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import ReportUser from "@/view/listings/reportUser";

export default function DenunciarPessoa() {
  const { userId, nome } = useLocalSearchParams<{ userId: string; nome?: string }>();
  return <ReportUser userId={userId} userName={nome} onBack={() => backOnce()} onNavigateToLogin={() => pushOnce("/entrar")} />;
}
