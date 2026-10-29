import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IMeetingDataSource, MeetingUpdate } from "@/model/datasources/iMeetingDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { Meeting, MeetingStatus } from "@/model/entities/meeting";
import { type MeetingChange, meetingNotice } from "@/model/entities/meetingNotice";
import { DataSourceError } from "@/model/errors";

/** Encontros em memória; avisa a outra pessoa como o gatilho `v2_notify_meeting_change` (ADR 0037). */
export class MemoryMeetingDataSource implements IMeetingDataSource {
  private readonly meetings: Meeting[] = [];

  constructor(
    private readonly requests: IBookRequestDataSource,
    private readonly books: IBookDataSource,
    private readonly notifications: INotificationDataSource,
  ) {}

  async findLatestByRequest(requestId: string): Promise<Meeting | null> {
    const found = this.meetings.filter((meeting) => meeting.requestId === requestId);
    return found.length > 0 ? { ...found[found.length - 1] } : null;
  }

  async findById(id: string): Promise<Meeting | null> {
    const found = this.meetings.find((meeting) => meeting.id === id);
    return found ? { ...found } : null;
  }

  async create(meeting: Omit<Meeting, "id" | "status">): Promise<Meeting> {
    if (this.meetings.some((m) => m.requestId === meeting.requestId && m.status !== "cancelled")) {
      throw new DataSourceError("Já existe um encontro ativo para esta negociação.");
    }
    const created: Meeting = {
      ...meeting,
      id: `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: "proposed",
    };
    this.meetings.push(created);
    await this.notifyCounterpart(created, meeting.proposedBy, "proposed");
    return { ...created };
  }

  async update(id: string, patch: MeetingUpdate, expectedStatus: MeetingStatus, actorId: string): Promise<Meeting> {
    const index = this.meetings.findIndex((meeting) => meeting.id === id);
    if (index < 0 || this.meetings[index].status !== expectedStatus) {
      throw new DataSourceError("O encontro mudou enquanto você respondia. Atualize a negociação.");
    }
    const updated: Meeting = { ...this.meetings[index], ...patch };
    this.meetings[index] = updated;
    const change: MeetingChange = patch.status === "proposed" ? "rescheduled" : patch.status;
    await this.notifyCounterpart(updated, actorId, change);
    return { ...updated };
  }

  private async notifyCounterpart(meeting: Meeting, actorId: string, change: MeetingChange): Promise<void> {
    const request = await this.requests.findById(meeting.requestId);
    const book = request ? await this.books.findById(request.listingId) : null;
    if (!request || !book) return;
    const recipient = actorId === request.requesterId ? book.ownerId : request.requesterId;
    await this.notifications.addNotification({
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId: recipient,
      ...meetingNotice(change, meeting.pointName),
      type: "meeting_update",
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/negociacao/${meeting.requestId}`,
    });
  }
}
