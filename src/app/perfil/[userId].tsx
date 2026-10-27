import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import { PublicProfile } from "@/view/listings/publicProfile";

export default function PerfilPublico() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return <PublicProfile userId={userId} onBack={() => backOnce()} onReportUser={(id, nome) => pushOnce({ pathname: "/denunciar-pessoa/[userId]", params: { userId: id, nome } } as never)} onReportListing={(id) => pushOnce(`/denunciar/${id}` as never)} onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)} />;
}
