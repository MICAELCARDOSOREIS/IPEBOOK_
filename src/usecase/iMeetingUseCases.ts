import type { Meeting, MeetingProposal } from "@/model/entities/meeting";

export interface IMeetingUseCases {
  /** Último encontro do pedido aceito, inclusive cancelado; `null` sem convite (Spec 052, RN-01). */
  getMeeting(requestId: string, sessionUserId: string | null): Promise<Meeting | null>;
  /** Envia convite (`06.04`); recusado se já houver encontro ativo (RN-04). */
  propose(requestId: string, proposal: MeetingProposal, sessionUserId: string | null): Promise<Meeting>;
  /** Confirma o convite da outra pessoa (`06.05`, RN-05). */
  confirm(meetingId: string, sessionUserId: string | null): Promise<Meeting>;
  /** Sugere novo local, dia e horário e volta a aguardar confirmação (`06.13`, RN-06). */
  reschedule(meetingId: string, proposal: MeetingProposal, sessionUserId: string | null): Promise<Meeting>;
  /** Cancela o encontro ativo (`06.11`/`06.12`, RN-07). */
  cancel(meetingId: string, sessionUserId: string | null): Promise<Meeting>;
}
