import { router, useLocalSearchParams } from "expo-router";
import ChatScreen from "@/view/conversations/chat";

/** Conversa da negociação em tela cheia (Figma `06.02`, Spec 082). */
export default function ConversaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ChatScreen
      requestId={id}
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onOpenNegotiation={(requestId) => router.push(`/negociacao/${requestId}`)}
    />
  );
}
