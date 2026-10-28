import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { buildDeliveryPayload } from "@/model/entities/delivery";
import { QrCode } from "@/view/components/QrCode";

describe("QrCode (Spec 095)", () => {
  it("desenha o QR do conteúdo da entrega com nome acessível", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<QrCode value={buildDeliveryPayload("3301dadb-0181-4b91-8266-2bd2f363f5f5", "K7M2QXWA")} size={200} />);
    });
    expect(screen.getByLabelText("QR code da entrega")).toBeDefined();
  });
});
