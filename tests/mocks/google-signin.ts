// Mock do @react-native-google-signin/google-signin nos testes (Spec 106): o SDK real é nativo.
export const statusCodes = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  SIGN_IN_REQUIRED: "SIGN_IN_REQUIRED",
};
export const isErrorWithCode = (error: unknown): error is { code: string } =>
  typeof error === "object" && error !== null && "code" in error;
export const isSuccessResponse = (response: { type: string }): boolean => response.type === "success";
export const GoogleSignin = {
  configure: (): void => {},
  hasPlayServices: async (): Promise<boolean> => true,
  signIn: async (): Promise<{ type: string; data: null }> => ({ type: "cancelled", data: null }),
  signOut: async (): Promise<null> => null,
};
