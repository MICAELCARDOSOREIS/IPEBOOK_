import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";

type ModalGlassSurfaceProps = ViewProps & {
  radius: number;
  sheet?: boolean;
};

export function ModalGlassSurface({ children, radius, sheet, style, ...props }: ModalGlassSurfaceProps) {
  const opaqueIos = useOpaqueIosSurfaces();
  const glass = Platform.OS === "ios" && !opaqueIos;
  const shape = sheet
    ? { borderTopLeftRadius: radius, borderTopRightRadius: radius }
    : { borderRadius: radius };

  return (
    <View {...props} style={[style, glass && styles.transparent]}>
      {glass ? <IosGlassBackdrop testID="modal-ios-glass" style={shape} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  transparent: { backgroundColor: "transparent", borderColor: "transparent", borderCurve: "continuous" },
});
