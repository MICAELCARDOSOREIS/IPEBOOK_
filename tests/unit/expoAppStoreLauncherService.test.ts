import * as Linking from "expo-linking";
import { describe, expect, it, vi } from "vitest";
import { ExpoAppStoreLauncherService } from "@/infra/services/expoAppStoreLauncherService";

describe("ExpoAppStoreLauncherService", () => {
  it("abre a URL HTTPS quando executado fora do Android", async () => {
    const openURL = vi.spyOn(Linking, "openURL").mockResolvedValue(undefined as never);
    await new ExpoAppStoreLauncherService().openStore("https://play.google.com/store/apps/details?id=com.ipebook.app");
    expect(openURL).toHaveBeenCalledWith("https://play.google.com/store/apps/details?id=com.ipebook.app");
    openURL.mockRestore();
  });
});
