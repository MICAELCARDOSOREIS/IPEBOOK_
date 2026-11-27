import { type ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { webFocusRing, withPress } from "@/view/pressFeedback";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";

type Props = {
  label: string;
  buttonText?: string;
  actions: ReadonlyArray<{ label: string; icon: AppIconName; onPress?: () => void; destructive?: boolean }>;
};

export function ChatWebOptions({ label, buttonText, actions }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const groupRef = useRef<ComponentRef<typeof View>>(null);
  const triggerRef = useRef<ComponentRef<typeof Pressable>>(null);
  const close = useCallback(() => {
    triggerRef.current?.focus();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onOutside = (event: PointerEvent) => {
      const group = groupRef.current as unknown as HTMLElement | null;
      if (!group?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, close]);

  return (
    <View ref={groupRef} style={styles.anchor}>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={withPress([styles.trigger, buttonText && styles.labeledTrigger], colors.m3.focusRing)}
      >
        {buttonText ? <Text style={styles.label}>{buttonText}</Text> : null}
        <AppIcon name={buttonText ? "chevronDown" : "more"} size={18} color={colors.m3.onSurfaceVariant} />
      </Pressable>
      {open ? (
        <View style={styles.panel}>
          {actions.map(({ label, icon, onPress, destructive }) => onPress ? (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => {
                close();
                onPress();
              }}
              style={({ hovered, pressed, focused }: { hovered?: boolean; pressed: boolean; focused?: boolean }) => [
                styles.action,
                (hovered || pressed) && styles.actionActive,
                focused && webFocusRing(colors.m3.focusRing),
              ]}
            >
              <AppIcon name={icon} size={18} color={destructive ? colors.error : colors.m3.onSurfaceVariant} />
              <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
            </Pressable>
          ) : null)}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    anchor: { position: "relative", flexShrink: 0 },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 44,
      minHeight: 44,
      gap: tokens.spacing[6],
      borderRadius: tokens.radius.full,
    },
    labeledTrigger: {
      paddingHorizontal: tokens.spacing[10],
      backgroundColor: colors.surface,
      borderColor: colors.book.paperEdge,
      borderWidth: 1,
    },
    label: { ...tokens.typography.labelMedium, color: colors.m3.onSurface },
    destructive: { color: colors.error },
    panel: {
      position: "absolute",
      top: "100%",
      right: 0,
      width: 200,
      marginTop: tokens.spacing[4],
      padding: tokens.spacing[4],
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
      backgroundColor: colors.surface,
      boxShadow: "0 4px 18px rgb(0 0 0 / 14%)",
      zIndex: 50,
    },
    action: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 44,
      paddingHorizontal: tokens.spacing[10],
      gap: tokens.spacing[8],
      borderRadius: tokens.radius.small,
    },
    actionActive: { backgroundColor: colors.m3.surfaceContainerLow },
  });
}
