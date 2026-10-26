import { router } from "expo-router";
import ForgotPassword from "@/view/auth/forgotPassword";

export default function EsqueciSenha() {
  // Figma `01.04`/`01.05`: a tela não tem barra superior — o retorno é o próprio botão
  // "Voltar ao login" e o gesto de voltar do sistema.
  return <ForgotPassword onNavigateToSignIn={() => router.replace("/entrar")} />;
}
