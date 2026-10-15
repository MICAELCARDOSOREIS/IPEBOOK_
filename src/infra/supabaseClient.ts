import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { DataSourceError } from "@/model/errors";

export function createSupabaseAppClient(url: string, publishableKey: string) {
  if (!url.startsWith("https://") || !publishableKey.startsWith("sb_publishable_")) {
    throw new DataSourceError("Configuração do serviço indisponível.");
  }

  if (Platform.OS !== "web") {
    require("react-native-url-polyfill/auto");
  }

  return createClient(url, publishableKey, {
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export type SupabaseAppClient = ReturnType<typeof createSupabaseAppClient>;
