import { describe, expect, it, vi } from "vitest";
import { SupabaseNotificationDataSource } from "@/infra/datasources/supabaseNotificationDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient() {
  const channel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() };
  const client = { channel: vi.fn(() => channel), removeChannel: vi.fn() } as unknown as SupabaseAppClient;
  return { client, channel };
}

describe("SupabaseNotificationDataSource.subscribeToChanges (Spec 091)", () => {
  it("usa um tópico novo a cada assinatura: reusar o tópico depois de subscribe() lança erro do Realtime", () => {
    const { client } = fakeClient();
    const ds = new SupabaseNotificationDataSource(client);
    const off1 = ds.subscribeToChanges("u1", () => {});
    const off2 = ds.subscribeToChanges("u1", () => {});
    const topics = vi.mocked(client.channel).mock.calls.map((call) => call[0]);
    expect(topics[0]).not.toBe(topics[1]);
    off1();
    off2();
    expect(client.removeChannel).toHaveBeenCalledTimes(2);
  });
});
