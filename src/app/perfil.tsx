import { router } from "expo-router";
import ProfileHub from "@/view/profile/profileHub";

export default function Perfil() {
  return (
    <ProfileHub
      requireAuth={false}
      onNavigateToSignIn={() => router.push("/entrar")}
      onNavigateToEditProfile={() => router.push("/perfil/editar")}
      onNavigateToMyListings={() => router.push("/meus-anuncios")}
      onNavigateToRatings={() => router.push("/perfil/avaliacoes")}
      onNavigateToFavorites={() => router.push("/favoritos")}
      onNavigateToNotifications={() => router.push("/notificacoes")}
      onNavigateToSecurity={() => router.push("/perfil/seguranca")}
      onNavigateToPrivacy={() => router.push("/excluir-conta")}
      onNavigateToBlockedUsers={() => router.push("/perfil/bloqueados")}
      onNavigateToInviteFriends={() => router.push("/perfil/convidar")}
      onNavigateToTerms={() => router.push("/termos")}
      onNavigateToHelp={() => router.push("/ajuda")}
      onSignedOut={() => router.replace("/entrar")}
    />
  );
}
