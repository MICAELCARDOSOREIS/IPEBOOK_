import React from "react";
import { Platform } from "react-native";
import { SymbolView } from "expo-symbols";
import { MaterialIcons } from "@expo/vector-icons";
import { tokens } from "@/view/tokens";
import { FluentIcon, type FluentIconName } from "@/view/components/FluentIcon";

/**
 * Nomes por plataforma (ADR 0014): SF Symbols no iOS, Material Symbols no Android e, na Web,
 * Fluent 2 System Icons quando cobertos (ver `fluentCoverage` abaixo) ou Material Symbols como
 * fallback. Os campos `android`/`web` aqui seguem a nomenclatura Material (ligatures com "_").
 */
const symbols = {
  home: { ios: "house", android: "home", web: "home" },
  search: { ios: "magnifyingglass", android: "search", web: "search" },
  close: { ios: "xmark", android: "close", web: "close" },
  logout: {
    ios: "rectangle.portrait.and.arrow.right",
    android: "logout",
    web: "logout",
  },
  swap: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
  bookmark: { ios: "bookmark", android: "bookmark", web: "bookmark" },
  checkCircle: { ios: "checkmark.circle", android: "check_circle", web: "check_circle" },
  bell: { ios: "bell", android: "notifications", web: "notifications" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
  check: { ios: "checkmark", android: "check", web: "check" },
  chevronRight: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  chevronDown: { ios: "chevron.down", android: "expand_more", web: "expand_more" },
  error: { ios: "exclamationmark.circle", android: "error", web: "error" },
  send: { ios: "paperplane", android: "send", web: "send" },
  chevronLeft: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  add: { ios: "plus", android: "add", web: "add" },
  edit: { ios: "pencil", android: "edit", web: "edit" },
  archive: { ios: "archivebox", android: "archive", web: "archive" },
  unarchive: { ios: "arrow.uturn.up", android: "unarchive", web: "unarchive" },
  delete: { ios: "trash", android: "delete", web: "delete" },
  photo: { ios: "photo", android: "add_photo_alternate", web: "add_photo_alternate" },
  person: { ios: "person", android: "person", web: "person" },
  shelf: { ios: "books.vertical", android: "library_books", web: "library_books" },
  document: { ios: "doc.text", android: "description", web: "description" },
  calendar: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  place: { ios: "mappin.and.ellipse", android: "location_on", web: "location_on" },
  heart: { ios: "heart", android: "favorite_border", web: "favorite_border" },
  heartFill: { ios: "heart.fill", android: "favorite", web: "favorite" },
  info: { ios: "info.circle", android: "info", web: "info" },
  visibility: { ios: "eye", android: "visibility", web: "visibility" },
  chat: { ios: "bubble.left.and.bubble.right", android: "chat_bubble", web: "chat_bubble" },
  tune: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  radioOn: {
    ios: "largecircle.fill.circle",
    android: "radio_button_checked",
    web: "radio_button_checked",
  },
  radioOff: { ios: "circle", android: "radio_button_unchecked", web: "radio_button_unchecked" },
  lock: { ios: "lock", android: "lock", web: "lock" },
  key: { ios: "key", android: "key", web: "key" },
  checkboxOn: { ios: "checkmark.square.fill", android: "check_box", web: "check_box" },
  checkboxOff: {
    ios: "square",
    android: "check_box_outline_blank",
    web: "check_box_outline_blank",
  },
  star: { ios: "star", android: "star", web: "star" },
  flag: { ios: "flag", android: "flag", web: "flag" },
  share: { ios: "square.and.arrow.up", android: "share", web: "share" },
  conservation: { ios: "book.closed", android: "menu_book", web: "menu_book" },
  category: { ios: "tag", android: "sell", web: "sell" },
  more: { ios: "ellipsis", android: "more_horiz", web: "more_horiz" },
  eye: { ios: "eye", android: "visibility", web: "visibility" },
  wifiOff: { ios: "wifi.slash", android: "wifi_off", web: "wifi_off" },
} as const;

export type AppIconName = keyof typeof symbols;

/**
 * Cobertura Fluent 2 (web) por nome do AppIcon, ADR 0014. Só os ícones já usados em telas
 * implementadas (NavigationBar); os demais caem no fallback Material Symbols até serem migrados.
 */
const fluentCoverage: Partial<Record<AppIconName, FluentIconName>> = {
  home: "home",
  search: "search",
  person: "person",
};

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  /** Usa a variante preenchida do ícone (ex. destino ativo da navegação). */
  filled?: boolean;
}

/** Ícone decorativo: o rótulo acessível fica no controle que o contém. */
export function AppIcon({ name, size = 24, color = tokens.colors.text, filled = false }: AppIconProps) {
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={symbols[name].ios}
        size={size}
        tintColor={color}
        style={{ width: size, height: size }}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  if (Platform.OS === "web") {
    const fluentName = fluentCoverage[name];
    if (fluentName) {
      return <FluentIcon name={fluentName} size={size} color={color} filled={filled} />;
    }
    // Fallback: ícone ainda não migrado para o Fluent 2 (ADR 0014) — usa Material Symbols.
  }

  return (
    <MaterialIcons
      name={symbols[name].android.replace(/_/g, "-") as never}
      size={size}
      color={color}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export default AppIcon;
