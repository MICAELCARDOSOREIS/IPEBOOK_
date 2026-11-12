import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PermissionKind } from "@/model/entities/permission";
import type { IPermissionAskDataSource } from "@/model/datasources/iPermissionAskDataSource";

/** Chave por permissão no armazenamento do aparelho (Spec 020). */
export function permissionAskKey(permission: PermissionKind): string {
  return `ipebook.permissaoPerguntada.${permission}`;
}

/** Marca no aparelho que a permissão já foi explicada e pedida, para o app não insistir (Spec 020). */
export class AsyncStoragePermissionAskDataSource implements IPermissionAskDataSource {
  private readonly key: string;

  constructor(permission: PermissionKind) {
    this.key = permissionAskKey(permission);
  }

  async hasAsked(): Promise<boolean> {
    return (await AsyncStorage.getItem(this.key)) === "1";
  }

  async markAsked(): Promise<void> {
    await AsyncStorage.setItem(this.key, "1");
  }
}
