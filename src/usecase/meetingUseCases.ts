import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IMeetingDataSource } from "@/model/datasources/iMeetingDataSource";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { Meeting, MeetingProposal } from "@/model/entities/meeting";
import { AuthError, ValidationError } from "@/model/errors";
import { validateMeetingProposal } from "@/model/validators/meetingValidator";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";

function requireSession(sessionUserId: string | null): string {
  if (!sessionUserId) throw new AuthError("Sessão obrigatória para combinar o encontro.");
  return sessionUserId;
}

/** Encontro da negociação aceita (Spec 052). */
export class MeetingUseCases implements IMeetingUseCases {
  constructor(
    private readonly meetings: IMeetingDataSource,
    private readonly requests: IBookRequestDataSource,
    private readonly books: IBookDataSource,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getMeeting(requestId: string, sessionUserId: string | null): Promise<Meeting | null> {
    await this.requireParticipant(requestId, requireSession(sessionUserId));
    return this.meetings.findLatestByRequest(requestId);
  }

  async propose(requestId: string, proposal: MeetingProposal, sessionUserId: string | null): Promise<Meeting> {
    const userId = requireSession(sessionUserId);
    await this.requireParticipant(requestId, userId);
    this.requireValidProposal(proposal);
    const latest = await this.meetings.findLatestByRequest(requestId);
    if (latest && latest.status !== "cancelled") {
      throw new ValidationError("Já existe um encontro combinado para esta negociação.");
    }
    return this.meetings.create({ requestId, ...proposal, proposedBy: userId });
  }

  async confirm(meetingId: string, sessionUserId: string | null): Promise<Meeting> {
    const userId = requireSession(sessionUserId);
    const meeting = await this.requireMeeting(meetingId, userId);
    if (meeting.status !== "proposed") {
      throw new ValidationError("Não há convite aguardando confirmação.");
    }
    if (meeting.proposedBy === userId) {
      throw new ValidationError("Quem enviou o convite não pode confirmá-lo.");
    }
    return this.meetings.update(meeting.id, { status: "confirmed" }, "proposed", userId);
  }

  async reschedule(meetingId: string, proposal: MeetingProposal, sessionUserId: string | null): Promise<Meeting> {
    const userId = requireSession(sessionUserId);
    const meeting = await this.requireMeeting(meetingId, userId);
    if (meeting.status === "cancelled") {
      throw new ValidationError("Este encontro foi cancelado. Combine um novo encontro.");
    }
    this.requireValidProposal(proposal);
    return this.meetings.update(meeting.id, { status: "proposed", proposedBy: userId, ...proposal }, meeting.status, userId);
  }

  async cancel(meetingId: string, sessionUserId: string | null): Promise<Meeting> {
    const userId = requireSession(sessionUserId);
    const meeting = await this.requireMeeting(meetingId, userId);
    if (meeting.status === "cancelled") {
      throw new ValidationError("Este encontro já foi cancelado.");
    }
    return this.meetings.update(meeting.id, { status: "cancelled" }, meeting.status, userId);
  }

  private requireValidProposal(proposal: MeetingProposal): void {
    const problem = validateMeetingProposal(proposal, this.now());
    if (problem) throw new ValidationError(problem);
  }

  private async requireMeeting(meetingId: string, userId: string): Promise<Meeting> {
    const meeting = await this.meetings.findById(meetingId);
    if (!meeting) throw new ValidationError("Encontro não encontrado.");
    await this.requireParticipant(meeting.requestId, userId);
    return meeting;
  }

  /** RN-01: só quem anunciou ou quem pediu, num pedido aceito. */
  private async requireParticipant(requestId: string, userId: string): Promise<BookRequest> {
    const request = await this.requests.findById(requestId);
    if (!request) throw new ValidationError("Negociação não encontrada.");
    const book = await this.books.findById(request.listingId);
    if (request.requesterId !== userId && book?.ownerId !== userId) {
      throw new AuthError("Você não participa desta negociação.");
    }
    if (request.status !== "accepted") {
      throw new ValidationError("O encontro só pode ser combinado depois que o pedido for aceito.");
    }
    return request;
  }
}
