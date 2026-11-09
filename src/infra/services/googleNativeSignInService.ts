import { Platform, TurboModuleRegistry } from "react-native";
import type * as GoogleSignInModule from "@react-native-google-signin/google-signin";
import { AuthError } from "@/model/errors";
import type { INativeGoogleSignIn } from "@/model/services/iNativeGoogleSignIn";

type GoogleApi = Pick<typeof GoogleSignInModule.GoogleSignin, "configure" | "hasPlayServices" | "signIn" | "signOut">;

const DEFAULT_STATUS_CODES = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
} as const;

function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

function isSuccessResponse(response: unknown): response is { type: "success"; data: { idToken: string | null } } {
  return typeof response === "object" && response !== null && (response as { type?: unknown }).type === "success";
}

/**
 * Carrega o SDK nativo sob demanda. No Expo Go (iOS/Android) ou no iOS sem módulo nativo registrado,
 * o TurboModule `RNGoogleSignin` não existe no binário e o import estático quebrava a inicialização do app.
 */
function getGoogleSignInModule(): typeof GoogleSignInModule | null {
  if (Platform.OS !== "android") return null;
  const registry = TurboModuleRegistry as { get?: (name: string) => unknown } | undefined;
  if (typeof registry?.get === "function" && !registry.get("RNGoogleSignin")) {
    return null;
  }
  try {
    return require("@react-native-google-signin/google-signin") as typeof GoogleSignInModule;
  } catch {
    return null;
  }
}

/**
 * Login Google nativo (Spec 106 / ADR 0082): seletor de contas do Android, sem abrir o navegador.
 * O `webClientId` é o cliente "Aplicativo da Web" do Google Cloud, o mesmo cadastrado no provedor Google do
 * Supabase; o idToken sai com esse público e o Supabase o aceita em `signInWithIdToken`.
 */
export class GoogleNativeSignInService implements INativeGoogleSignIn {
  private configured = false;

  constructor(
    private readonly webClientId: string | undefined,
    private readonly api?: GoogleApi,
  ) {}

  private resolveApi(): GoogleApi | null {
    if (this.api) return this.api;
    return getGoogleSignInModule()?.GoogleSignin ?? null;
  }

  isAvailable(): boolean {
    if (!this.webClientId) return false;
    return this.resolveApi() !== null;
  }

  async getIdToken(): Promise<string | null> {
    const api = this.resolveApi();
    if (!this.webClientId || !api) throw new AuthError("Login nativo com Google não configurado.");
    if (!this.configured) {
      api.configure({ webClientId: this.webClientId });
      this.configured = true;
    }
    const statusCodes = getGoogleSignInModule()?.statusCodes ?? DEFAULT_STATUS_CODES;
    try {
      await api.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await api.signIn();
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
    const api = this.resolveApi();
    if (!api) return;
    try {
      await api.signOut();
    } catch {
      // Sair do Google é só para o seletor aparecer de novo; a sessão do app já foi encerrada.
    }
  }
}
