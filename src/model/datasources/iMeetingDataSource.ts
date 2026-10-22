import type { Meeting, MeetingProposal, MeetingStatus } from "@/model/entities/meeting";

export type MeetingUpdate = Readonly<
  | { status: "confirmed" | "cancelled" }
  | ({ status: "proposed"; proposedBy: string } & MeetingProposal)
>;

export interface IMeetingDataSource {
  /** Último encontro do pedido, inclusive cancelado; `null` se nunca houve convite. */
  findLatestByRequest(requestId: string): Promise<Meeting | null>;
  findById(id: string): Promise<Meeting | null>;
  create(meeting: Omit<Meeting, "id" | "status">): Promise<Meeting>;
  /**
   * Atualiza só se a situação atual for `expectedStatus`, para não sobrescrever mudança concorrente.
   * `actorId` é quem fez a mudança; a outra pessoa da negociação é avisada (Spec 052, RN-08).
   */
  update(id: string, patch: MeetingUpdate, expectedStatus: MeetingStatus, actorId: string): Promise<Meeting>;
}
