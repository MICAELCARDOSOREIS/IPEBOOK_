import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/view/theme/ThemeProvider";

export type InstagramIconProps = {
  size?: number;
  color?: string;
};

/** Logotipo do Instagram (decorativo): o rótulo acessível fica no link que o contém. */
export function InstagramIcon({ size = 24, color }: InstagramIconProps) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name="logo-instagram"
      size={size}
      color={color ?? colors.text}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default InstagramIcon;
