// Mock do @sentry/react-native nos testes (Spec 104): o SDK real carrega módulos nativos do React Native.
export const init = (): void => {};
export const captureException = (): string => "";
