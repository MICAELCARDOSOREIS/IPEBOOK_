/**
 * Permissões do aparelho que o app explica antes do prompt nativo (Spec 020).
 * "photos" cobre câmera e galeria: o seletor decide qual acesso usar.
 */
export type PermissionKind = "notifications" | "photos";
