import { WebHeader, type WebHeaderProps } from "@/view/components/WebHeader";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNavigationBadgesViewModel } from "@/viewmodel/useNavigationBadgesViewModel";

export type ConnectedWebHeaderProps = Omit<WebHeaderProps, "initials" | "badgeCount"> & {
  /** Rota atual: ao mudar de tela os selos são recalculados. */
  pathname: string;
};

function initialsOf(name?: string, email?: string): string {
  const source = (name?.trim() || email?.split("@")[0] || "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

/** Cabeçalho Web com avatar da pessoa logada e selo de propostas em "Conversas". */
export function ConnectedWebHeader({ pathname, ...props }: ConnectedWebHeaderProps) {
  const [auth] = useAuthViewModel();
  const badges = useNavigationBadgesViewModel(auth.user?.id ?? null, pathname);
  return (
    <WebHeader
      {...props}
      initials={initialsOf(auth.user?.name, auth.user?.email)}
      badgeCount={badges.conversations}
    />
  );
}
