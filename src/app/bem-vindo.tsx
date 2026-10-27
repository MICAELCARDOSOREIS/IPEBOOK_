import { replaceOnce } from "@/view/pushOnce";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

export default function BemVindo() {
  return <WelcomeRoute onFinish={(destination) => replaceOnce(destination)} />;
}
