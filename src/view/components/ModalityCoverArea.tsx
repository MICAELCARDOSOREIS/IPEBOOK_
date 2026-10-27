import { useMemo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { BookModality } from "@/model/entities/book";
import { tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ModalityCoverAreaProps = {
  modality: BookModality;
  children: ReactNode;
};

/** Fundo da capa na cor da modalidade (verde Venda, amarelo Troca, terracota Doação), como no topo do detalhe. */
export function ModalityCoverArea({ modality, children }: ModalityCoverAreaProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        area: {
          padding: tokens.spacing[8],
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        },
      }),
    [],
  );
  return <View style={[styles.area, { backgroundColor: colors.badge[modality].background }]}>{children}</View>;
}

export default ModalityCoverArea;
