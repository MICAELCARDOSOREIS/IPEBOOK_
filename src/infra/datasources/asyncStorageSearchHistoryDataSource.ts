import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ISearchHistoryDataSource } from "@/model/datasources/iSearchHistoryDataSource";

const MAX_ITEMS = 10;
const keyFor = (ownerKey: string) => `search-history:${ownerKey}`;

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export class AsyncStorageSearchHistoryDataSource implements ISearchHistoryDataSource {
  async list(ownerKey: string) {
    return parse(await AsyncStorage.getItem(keyFor(ownerKey)));
  }

  async add(ownerKey: string, term: string) {
    const current = parse(await AsyncStorage.getItem(keyFor(ownerKey)));
    const next = [term, ...current.filter((entry) => entry !== term)].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(keyFor(ownerKey), JSON.stringify(next));
    return next;
  }

  async clear(ownerKey: string) {
    await AsyncStorage.removeItem(keyFor(ownerKey));
  }
}
