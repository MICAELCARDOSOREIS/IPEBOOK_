import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@/view/tokens";

export type InstagramIconProps = {
  size?: number;
  color?: string;
};

/** Logotipo do Instagram (decorativo): o rótulo acessível fica no link que o contém. */
export function InstagramIcon({ size = 24, color = tokens.colors.text }: InstagramIconProps) {
  return (
    <Ionicons
      name="logo-instagram"
      size={size}
      color={color}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default InstagramIcon;
