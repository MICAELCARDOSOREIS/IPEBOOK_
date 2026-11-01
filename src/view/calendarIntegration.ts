import * as Linking from "expo-linking";

export type CalendarEventOptions = {
  title: string;
  details?: string;
  location?: string;
  scheduledAt: string | Date;
  durationMinutes?: number;
};

/**
 * Converte data para o formato aceito pelo Google Calendar (YYYYMMDDTHHmmssZ).
 */
export function formatToGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Monta o link web para adicionar o evento ao Google Calendar.
 */
export function buildGoogleCalendarUrl(options: CalendarEventOptions): string {
  const start = typeof options.scheduledAt === "string" ? new Date(options.scheduledAt) : options.scheduledAt;
  const duration = options.durationMinutes ?? 30;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const startStr = formatToGoogleCalendarDate(start);
  const endStr = formatToGoogleCalendarDate(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: options.title,
    dates: `${startStr}/${endStr}`,
  });

  if (options.details) {
    params.set("details", options.details);
  }
  if (options.location) {
    params.set("location", options.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Abre o calendário padrão/Google Calendar para agendar o encontro em Piripiri.
 */
export async function addMeetingToCalendar(options: CalendarEventOptions): Promise<boolean> {
  const url = buildGoogleCalendarUrl(options);
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
