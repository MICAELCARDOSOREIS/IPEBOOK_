import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import qrcode from "qrcode-generator";

export type QrCodeProps = {
  /** Texto codificado no QR. */
  value: string;
  /** Lado do QR em dp, incluindo a margem. */
  size?: number;
  /** Texto para leitor de tela; o QR em si não é lido. */
  accessibilityLabel?: string;
};

const QUIET_ZONE = 2;

/** Sequências de módulos escuros de cada linha, `[início, tamanho]`: poucas views em vez de uma por módulo. */
function darkRuns(value: string): { count: number; rows: [number, number][][] } {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const rows: [number, number][][] = [];
  for (let row = 0; row < count; row += 1) {
    const runs: [number, number][] = [];
    let start = -1;
    for (let col = 0; col <= count; col += 1) {
      const dark = col < count && qr.isDark(row, col);
      if (dark && start < 0) start = col;
      if (!dark && start >= 0) {
        runs.push([start, col - start]);
        start = -1;
      }
    }
    rows.push(runs);
  }
  return { count, rows };
}

/** QR code desenhado com views, sem `react-native-svg`; sempre preto sobre branco para a câmera ler (ADR 0070). */
export function QrCode({ value, size = 240, accessibilityLabel = "QR code da entrega" }: QrCodeProps) {
  const { count, rows } = useMemo(() => darkRuns(value), [value]);
  const cell = size / (count + QUIET_ZONE * 2);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.frame, { width: size, height: size }]}
    >
      {rows.map((runs, row) =>
        runs.map(([start, length]) => (
          <View
            key={`${row}-${start}`}
            style={[
              styles.module,
              {
                left: (start + QUIET_ZONE) * cell,
                top: (row + QUIET_ZONE) * cell,
                width: length * cell,
                height: cell,
              },
            ]}
          />
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { backgroundColor: "#FFFFFF", borderRadius: 12, overflow: "hidden" },
  module: { position: "absolute", backgroundColor: "#000000" },
});
