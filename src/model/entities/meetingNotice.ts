import type { MeetingStatus } from "@/model/entities/meeting";

export type MeetingChange = "proposed" | "rescheduled" | MeetingStatus;

/**
 * Título e mensagem do aviso de encontro (Spec 052, RN-08). Os mesmos textos estão no gatilho
 * `v2_notify_meeting_change` da migração `202610220001_encontros.sql`.
 */
export function meetingNotice(change: MeetingChange, pointName: string): { title: string; message: string } {
  switch (change) {
    case "rescheduled":
      return { title: "Encontro reagendado", message: `Nova sugestão em ${pointName}. Confirme na negociação.` };
    case "confirmed":
      return { title: "Encontro confirmado", message: `O encontro em ${pointName} está combinado.` };
    case "cancelled":
      return { title: "Encontro cancelado", message: `O encontro em ${pointName} foi cancelado. Vocês podem combinar outro dia.` };
    default:
      return { title: "Convite para encontro", message: `Você recebeu um convite para ${pointName}. Confirme na negociação.` };
  }
}
