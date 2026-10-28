import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AuthError } from "@/model/errors";
import type { INativeGoogleSignIn } from "@/model/services/iNativeGoogleSignIn";

type GoogleApi = Pick<typeof GoogleSignin, "configure" | "hasPlayServices" | "signIn" | "signOut">;

/**
 * Login Google nativo (Spec 106 / ADR 0082): seletor de contas do Android, sem abrir o navegador.
 * O `webClientId` é o cliente "Aplicativo da Web" do Google Cloud, o mesmo cadastrado no provedor Google do
 * Supabase; o idToken sai com esse público e o Supabase o aceita em `signInWithIdToken`.
 */
export class GoogleNativeSignInService implements INativeGoogleSignIn {
  private configured = false;

  constructor(
    private readonly webClientId: string | undefined,
    private readonly api: GoogleApi = GoogleSignin,
  ) {}

  isAvailable(): boolean {
    return Boolean(this.webClientId);
  }

  async getIdToken(): Promise<string | null> {
    if (!this.webClientId) throw new AuthError("Login nativo com Google não configurado.");
    if (!this.configured) {
      this.api.configure({ webClientId: this.webClientId });
      this.configured = true;
    }
    try {
      await this.api.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await this.api.signIn();
      if (!isSuccessResponse(response)) return null;
      if (!response.data.idToken) throw new AuthError("O Google não devolveu a identificação da conta.");
      return response.data.idToken;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
        if (error.code === statusCodes.IN_PROGRESS) throw new AuthError("O login com Google já está em andamento.");
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new AuthError("Atualize o Google Play Services para entrar com Google.");
        }
      }
      throw new AuthError("Não foi possível autenticar com o Google. Tente novamente.");
    }
  }

  async signOut(): Promise<void> {
    if (!this.configured) return;
    try {
      await this.api.signOut();
    } catch {
      // Sair do Google é só para o seletor aparecer de novo; a sessão do app já foi encerrada.
    }
  }
}
