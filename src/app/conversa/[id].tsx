import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import ChatScreen from "@/view/conversations/chat";

/** Conversa da negociação em tela cheia (Figma `06.02`, Spec 082). */
export default function ConversaRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const focusKey = useRefocusKey();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ChatScreen
        requestId={id}
        focusKey={focusKey}
        onBack={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onOpenNegotiation={(requestId) => pushOnce(`/negociacao/${requestId}`)}
        onOpenDelivery={(requestId) => pushOnce(`/negociacao/${requestId}/entrega` as never)}
        onScheduleMeeting={(requestId) => pushOnce(`/negociacao/${requestId}/encontro` as never)}
      />
    </RequireAuth>
  );
}
