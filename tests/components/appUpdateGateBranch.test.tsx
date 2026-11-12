import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { AppUpdateGate } from "@/view/components/AppUpdateGate";
import * as di from "@/di/container";

describe("AppUpdateGate branches", () => {
  it("renderiza modal obrigatorio e aciona openStore", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const openStoreMock = vi.fn(async () => {});
    const dismissMock = vi.fn(async () => {});

    vi.spyOn(di, "makeAppUpdateViewModel").mockReturnValue({
      status: "required",
      policy: {
        platform: "android",
        latestVersion: "0.2.0",
        minSupportedVersion: "0.2.0",
        releaseNotes: "Segurança crítica",
        storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app",
      },
      loading: false,
      dismiss: dismissMock,
      openStore: openStoreMock,
    });

    try {
      let root: renderer.ReactTestRenderer;
      act(() => {
        root = renderer.create(<AppUpdateGate />);
      });

      const dialog = root!.root.findByProps({ title: "Atualização necessária" });
      expect(dialog).toBeTruthy();
      await dialog.props.onConfirm();
      expect(openStoreMock).toHaveBeenCalled();
    } finally {
      Platform.OS = originalOS;
      vi.restoreAllMocks();
    }
  });

  it("renderiza modal opcional e aciona dismiss", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    const openStoreMock = vi.fn(async () => {});
    const dismissMock = vi.fn(async () => {});

    vi.spyOn(di, "makeAppUpdateViewModel").mockReturnValue({
      status: "optional",
      policy: {
        platform: "android",
        latestVersion: "0.2.0",
        minSupportedVersion: "0.1.0",
        releaseNotes: null,
        storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app",
      },
      loading: false,
      dismiss: dismissMock,
      openStore: openStoreMock,
    });

    try {
      let root: renderer.ReactTestRenderer;
      act(() => {
        root = renderer.create(<AppUpdateGate />);
      });

      const dialog = root!.root.findByProps({ title: "Nova versão disponível" });
      expect(dialog).toBeTruthy();
      await dialog.props.onCancel();
      expect(dismissMock).toHaveBeenCalled();
    } finally {
      Platform.OS = originalOS;
      vi.restoreAllMocks();
    }
  });
});
