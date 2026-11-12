/** Mock de expo-constants para testes (Spec 073, Spec 085): versão do app e ambiente de execução. */
export const ExecutionEnvironment = { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" } as const;

export default {
  appOwnership: null,
  executionEnvironment: ExecutionEnvironment.Standalone,
  experienceUrl: "",
  expoConfig: { version: "0.1.0" },
};
