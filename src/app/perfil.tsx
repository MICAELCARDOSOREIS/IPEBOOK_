import { pushOnce, replaceOnce } from "@/view/pushOnce";
import ProfileHub from "@/view/profile/profileHub";

export default function Perfil() {
  return (
    <ProfileHub
      onNavigateToSignIn={() => replaceOnce("/entrar")}
      onNavigateToEditProfile={() => pushOnce("/perfil/editar")}
      onNavigateToMyListings={() => pushOnce("/meus-anuncios")}
      onNavigateToRatings={() => pushOnce("/perfil/avaliacoes")}
      onNavigateToMeetingHistory={() => pushOnce("/perfil/encontros")}
      onNavigateToFavorites={() => pushOnce("/favoritos")}
      onNavigateToNotifications={() => pushOnce("/notificacoes")}
      onNavigateToSecurity={() => pushOnce("/perfil/seguranca")}
      onNavigateToInviteFriends={() => pushOnce("/perfil/convidar")}
      onNavigateToSettings={() => pushOnce("/perfil/configuracoes" as never)}
      onSignedOut={() => replaceOnce("/entrar")}
    />
  );
}
