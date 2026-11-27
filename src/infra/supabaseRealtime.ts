import type { SupabaseAppClient } from "@/infra/supabaseClient";

export type RealtimeChannelStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR";

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

type SubscribePostgresOptions<Row> = {
  channelPrefix: string;
  table: string;
  event?: PostgresEvent;
  filter?: string;
  onPayload: (payload: { new?: Row; old?: Row }) => void;
  onStatus?: (status: RealtimeChannelStatus) => void;
};

/** Sequência para nomes de canal únicos: o mesmo tópico não aceita novos `.on()` depois de `subscribe()`. */
let channelSeq = 0;

/**
 * Assina eventos `postgres_changes` no Supabase Realtime garantindo que o socket possua
 * o JWT autenticado atual da sessão (evitando descarte silencioso por RLS em reconexões mobile).
 */
export function subscribePostgresChanges<Row = Record<string, unknown>>(
  client: SupabaseAppClient,
  options: SubscribePostgresOptions<Row>,
): () => void {
  const { channelPrefix, table, event = "*", filter, onPayload, onStatus } = options;

  // Garante autenticação explícita no Realtime se a sessão já estiver hidratada.
  const maybeAuth = (client as unknown as {
    auth?: { getSession?: () => Promise<{ data?: { session?: { access_token?: string } | null } }> };
    realtime?: { setAuth?: (token?: string) => void };
  });
  if (typeof maybeAuth.auth?.getSession === "function" && typeof maybeAuth.realtime?.setAuth === "function") {
    void maybeAuth.auth
      .getSession()
      .then((res) => {
        const token = res?.data?.session?.access_token;
        if (token) maybeAuth.realtime?.setAuth?.(token);
      })
      .catch(() => {});
  }

  const changeFilter: Record<string, string> = {
    event,
    schema: "public",
    table,
    ...(filter ? { filter } : {}),
  };

  const channel = client
    .channel(`${channelPrefix}:${++channelSeq}`)
    .on("postgres_changes" as any, changeFilter, (payload: { new?: Row; old?: Row }) => {
      onPayload(payload ?? {});
    })
    .subscribe((status: string) => {
      if (
        status === "SUBSCRIBED" ||
        status === "TIMED_OUT" ||
        status === "CLOSED" ||
        status === "CHANNEL_ERROR"
      ) {
        onStatus?.(status);
      }
    });

  return () => {
    client.removeChannel(channel);
  };
}
