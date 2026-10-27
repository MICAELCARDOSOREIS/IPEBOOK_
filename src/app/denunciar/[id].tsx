import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import ReportListingScreen from "@/view/listings/reportListingScreen";

export default function DenunciarLivro() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ReportListingScreen
      listingId={id}
      onBack={() => backOnce()}
      onNavigateToLogin={() => pushOnce("/entrar")}
    />
  );
}
