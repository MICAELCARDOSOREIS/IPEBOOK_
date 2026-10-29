import { router, useLocalSearchParams } from "expo-router";
import ReportListingScreen from "@/view/listings/reportListingScreen";

export default function DenunciarLivro() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ReportListingScreen
      listingId={id}
      onBack={() => router.back()}
      onNavigateToLogin={() => router.push("/entrar")}
    />
  );
}
