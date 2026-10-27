import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import ChatScreen from "@/view/conversations/chat";

/** Conversa da negociação em tela cheia (Figma `06.02`, Spec 082). */
export default function ConversaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ChatScreen
      requestId={id}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onOpenNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}`)}
    />
  );
}
