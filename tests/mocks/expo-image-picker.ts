/** Mock de expo-image-picker para testes (ADR 0065): sem permissão e sem seleção por padrão. */
export const requestCameraPermissionsAsync = async () => ({ granted: false });
export const requestMediaLibraryPermissionsAsync = async () => ({ granted: false });
export const launchCameraAsync = async () => ({ canceled: true, assets: null });
export const launchImageLibraryAsync = async () => ({ canceled: true, assets: null });
