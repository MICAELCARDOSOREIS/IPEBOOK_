import { router } from "expo-router";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

export default function BemVindo() {
  return <WelcomeRoute onFinish={(destination) => router.replace(destination)} />;
}
