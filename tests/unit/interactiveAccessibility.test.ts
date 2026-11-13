import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Auditoria de acessibilidade (TalkBack / VoiceOver)", () => {
  const root = resolve(__dirname, "../../src/view");

  const expectedLabels = [
    { file: "components/ErrorState.tsx", pattern: /accessibilityLabel=\{retryLabel\}/ },
    { file: "components/ErrorState.tsx", pattern: /accessibilityLiveRegion="polite"/ },
    { file: "components/OfflineState.tsx", pattern: /accessibilityLabel=\{retryLabel\}/ },
    { file: "components/OfflineState.tsx", pattern: /accessibilityLiveRegion="polite"/ },
    { file: "components/WebHeader.tsx", pattern: /accessibilityLabel=\{link\.label\}/ },
    { file: "components/NeighborhoodSelectorModal.tsx", pattern: /accessibilityLabel="Buscar ponto de encontro em Piripiri"/ },
    { file: "favorites/favorites.tsx", pattern: /accessibilityLabel="Entrar"/ },
    { file: "legal/termsAndPrivacy.tsx", pattern: /accessibilityLabel="Termos de Uso"/ },
    { file: "legal/termsAndPrivacy.tsx", pattern: /accessibilityLabel="Privacidade \(LGPD\)"/ },
    { file: "listings/publicProfile.tsx", pattern: /accessibilityLabel="Tentar novamente"/ },
    { file: "notifications/notifications.tsx", pattern: /accessibilityLabel=\{`Todas \(\$\{state\.notifications\.length\}\)`\}/ },
    { file: "notifications/notifications.tsx", pattern: /accessibilityLabel=\{`Não lidas \(\$\{state\.unreadCount\}\)`\}/ },
    { file: "requests/sentRequests.tsx", pattern: /accessibilityLabel="Ver detalhes do encontro"/ },
    { file: "requests/requestDetail.tsx", pattern: /accessibilityLabel="Tentar novamente"/ },
    { file: "search/searchAlerts.tsx", pattern: /accessibilityLabel="Entrar"/ },
    { file: "conversations/chat.tsx", pattern: /accessibilityLabel="Reenviar mensagem"/ },
    { file: "moderation/moderation.tsx", pattern: /accessibilityLabel="Tentar de novo"/ },
  ];

  it.each(expectedLabels)(
    "arquivo $file possui rótulo de acessibilidade esperado",
    ({ file, pattern }) => {
      const fullPath = resolve(root, file);
      const content = readFileSync(fullPath, "utf-8");
      expect(content).toMatch(pattern);
    },
  );
});
