import type { IMeetingDataSource, MeetingUpdate } from "@/model/datasources/iMeetingDataSource";
import type { Meeting, MeetingStatus } from "@/model/entities/meeting";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type MeetingRow = {
  id: string;
  request_id: string;
  point_name: string;
  scheduled_at: string;
  proposed_by: string;
  status: MeetingStatus;
};

const columns = "id,request_id,point_name,scheduled_at,proposed_by,status";

function mapMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    requestId: row.request_id,
    pointName: row.point_name,
    scheduledAt: row.scheduled_at,
    proposedBy: row.proposed_by,
    status: row.status,
  };
}

/** Encontros em `v2_meetings`; os avisos vêm do gatilho `v2_notify_meeting_change` (ADR 0037). */
export class SupabaseMeetingDataSource implements IMeetingDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async findLatestByRequest(requestId: string): Promise<Meeting | null> {
    const { data, error } = await this.client.from("v2_meetings").select(columns)
      .eq("request_id", requestId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível carregar o encontro.");
    return data ? mapMeeting(data as MeetingRow) : null;
  }

  async findById(id: string): Promise<Meeting | null> {
    const { data, error } = await this.client.from("v2_meetings").select(columns).eq("id", id).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível carregar o encontro.");
    return data ? mapMeeting(data as MeetingRow) : null;
  }

  async create(meeting: Omit<Meeting, "id" | "status">): Promise<Meeting> {
    const { data, error } = await this.client.from("v2_meetings").insert({
      request_id: meeting.requestId,
      point_name: meeting.pointName,
      scheduled_at: meeting.scheduledAt,
      proposed_by: meeting.proposedBy,
    }).select(columns).single();
    if (error?.code === "23505") throw new DataSourceError("Já existe um encontro ativo para esta negociação.");
    if (error || !data) throw new DataSourceError("Não foi possível enviar o convite.");
    return mapMeeting(data as MeetingRow);
  }

  // `actorId` não é enviado: o gatilho identifica quem mudou pela sessão (`auth.uid()`).
  async update(id: string, patch: MeetingUpdate, expectedStatus: MeetingStatus, _actorId?: string): Promise<Meeting> {
    const row = patch.status === "proposed"
      ? { status: patch.status, proposed_by: patch.proposedBy, point_name: patch.pointName, scheduled_at: patch.scheduledAt }
      : { status: patch.status };
    const { data, error } = await this.client.from("v2_meetings").update(row)
      .eq("id", id).eq("status", expectedStatus).select(columns).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível atualizar o encontro.");
    if (!data) throw new DataSourceError("O encontro mudou enquanto você respondia. Atualize a negociação.");
    return mapMeeting(data as MeetingRow);
  }
}
