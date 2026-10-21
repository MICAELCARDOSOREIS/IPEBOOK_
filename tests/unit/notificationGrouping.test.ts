import { describe, expect, it } from "vitest";
import type { AppNotification } from "@/model/entities/notification";
import { groupNotificationsByPeriod, periodOf } from "@/viewmodel/notificationGrouping";

// As datas são construídas no fuso local do processo, e não com um deslocamento fixo,
// para que o resultado não mude entre a máquina de quem desenvolve e a CI (que roda em UTC).
const AGORA = new Date(2026, 9, 20, 15, 0, 0);

/** Data no fuso local, `dias` antes de AGORA, no horário indicado. */
function diasAtras(dias: number, hora = 10, minuto = 0): string {
  const data = new Date(
    AGORA.getFullYear(),
    AGORA.getMonth(),
    AGORA.getDate() - dias,
    hora,
    minuto,
  );
  return data.toISOString();
}

function notificacao(id: string, createdAt: string): AppNotification {
  return {
    id,
    userId: "user-1",
    title: `Título ${id}`,
    message: `Mensagem ${id}`,
    type: "system",
    read: false,
    createdAt,
  };
}

describe("periodOf", () => {
  it("classifica como Hoje qualquer horário do dia corrente", () => {
    expect(periodOf(diasAtras(0, 0, 10), AGORA)).toBe("today");
    expect(periodOf(diasAtras(0, 23, 50), AGORA)).toBe("today");
  });

  it("classifica os seis dias anteriores como Esta semana", () => {
    expect(periodOf(diasAtras(1, 22), AGORA)).toBe("week");
    expect(periodOf(diasAtras(6, 8), AGORA)).toBe("week");
  });

  it("classifica o sétimo dia anterior e os mais antigos como Antes", () => {
    expect(periodOf(diasAtras(7, 23), AGORA)).toBe("earlier");
    expect(periodOf(diasAtras(290), AGORA)).toBe("earlier");
  });

  it("trata data inválida como Antes em vez de quebrar a lista", () => {
    expect(periodOf("data-invalida", AGORA)).toBe("earlier");
  });
});

describe("groupNotificationsByPeriod", () => {
  it("agrupa na ordem Hoje, Esta semana e Antes com os títulos do Figma 07.04", () => {
    const secoes = groupNotificationsByPeriod(
      [
        notificacao("antiga", diasAtras(49)),
        notificacao("hoje", diasAtras(0, 9)),
        notificacao("semana", diasAtras(3, 9)),
      ],
      AGORA,
    );

    expect(secoes.map((secao) => secao.title)).toEqual(["Hoje", "Esta semana", "Antes"]);
    expect(secoes[0].data.map((item) => item.id)).toEqual(["hoje"]);
    expect(secoes[1].data.map((item) => item.id)).toEqual(["semana"]);
    expect(secoes[2].data.map((item) => item.id)).toEqual(["antiga"]);
  });

  it("preserva a ordem recebida dentro de cada período", () => {
    const secoes = groupNotificationsByPeriod(
      [
        notificacao("a", diasAtras(0, 8)),
        notificacao("b", diasAtras(0, 12)),
      ],
      AGORA,
    );

    expect(secoes).toHaveLength(1);
    expect(secoes[0].data.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("omite períodos sem notificações", () => {
    const secoes = groupNotificationsByPeriod([notificacao("a", diasAtras(2, 8))], AGORA);

    expect(secoes.map((secao) => secao.period)).toEqual(["week"]);
  });

  it("devolve lista vazia quando não há notificações", () => {
    expect(groupNotificationsByPeriod([], AGORA)).toEqual([]);
  });
});
