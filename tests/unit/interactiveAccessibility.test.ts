import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tokens } from "@/view/tokens";

describe("Auditoria de acessibilidade (TalkBack / VoiceOver)", () => {
  const root = resolve(__dirname, "../../src/view");

  const expectedLabels = [
    { file: "components/ErrorState.tsx", pattern: /accessibilityLabel=\{retryLabel\}/ },
    { file: "components/ErrorState.tsx", pattern: /accessibilityLiveRegion="polite"/ },
    { file: "components/OfflineState.tsx", pattern: /accessibilityLabel=\{retryLabel\}/ },
    { file: "components/OfflineState.tsx", pattern: /accessibilityLiveRegion="polite"/ },
    { file: "components/WebHeader.tsx", pattern: /accessibilityLabel=\{link\.label\}/ },
    { file: "components/NeighborhoodSelectorModal.tsx", pattern: /accessibilityLabel="Buscar bairro em Piripiri"/ },
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

  it("pino do mapa nativo atinge a área mínima de toque com hitSlop (Spec 125 D2)", () => {
    const fonte = readFileSync(resolve(root, "requests/MeetingMap.native.tsx"), "utf-8");
    const tamanho = Number(/const PIN_SIZE = (\d+)/.exec(fonte)?.[1]);
    expect(fonte).toContain("hitSlop={PIN_HIT_SLOP}");
    expect(fonte).toMatch(/const PIN_HIT_SLOP = Math\.max\(0, \(tokens\.accessibility\.touchTarget - PIN_SIZE\) \/ 2\)/);
    expect(tamanho + 2 * ((tokens.accessibility.touchTarget - tamanho) / 2)).toBeGreaterThanOrEqual(
      tokens.accessibility.touchTarget,
    );
  });

  it("pino do mapa web tem área de toque estendida pelo CSS global (Spec 125 D2)", () => {
    const html = readFileSync(resolve(root, "../app/+html.tsx"), "utf-8");
    expect(html).toMatch(/\[data-pino-mapa\]\[aria-pressed="false"\]::after\{content:"";position:absolute;inset:-/);
  });
});
