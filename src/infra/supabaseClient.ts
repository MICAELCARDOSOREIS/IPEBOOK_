import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { DataSourceError } from "@/model/errors";

const fetchWithBookCachePolicy: typeof fetch = (input, init) => {
  const request = input instanceof Request ? input : undefined;
  const method = init?.method ?? request?.method ?? "GET";
  const url = new URL(request?.url ?? String(input));
  if (method === "GET" && url.pathname === "/rest/v1/v2_books") {
    return fetch(input, { ...init, cache: "no-store" });
  }
  return fetch(input, init);
};

export function createSupabaseAppClient(url: string, publishableKey: string) {
  if (!url.startsWith("https://") || !publishableKey.startsWith("sb_publishable_")) {
    throw new DataSourceError("Configuração do serviço indisponível.");
  }

  if (Platform.OS !== "web") {
    require("react-native-url-polyfill/auto");
  }

  return createClient(url, publishableKey, {
    ...(Platform.OS === "web" ? { global: { fetch: fetchWithBookCachePolicy } } : {}),
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      flowType: Platform.OS === "web" ? "pkce" : "implicit",
      detectSessionInUrl: false,
    },
  });
}

export type SupabaseAppClient = ReturnType<typeof createSupabaseAppClient>;
