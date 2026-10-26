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
      onNavigateToMeetingHistory={() => router.push("/perfil/encontros")}
      onNavigateToFavorites={() => router.push("/favoritos")}
      onNavigateToNotifications={() => router.push("/notificacoes")}
      onNavigateToSecurity={() => router.push("/perfil/seguranca")}
      onNavigateToInviteFriends={() => router.push("/perfil/convidar")}
      onNavigateToSettings={() => router.push("/perfil/configuracoes" as never)}
      onSignedOut={() => router.replace("/entrar")}
    />
  );
}
