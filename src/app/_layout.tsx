import { Stack } from "expo-router";
import { useIpebookFonts } from "@/view/useIpebookFonts";

export default function RootLayout() {
  const [fontsLoaded] = useIpebookFonts();

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
