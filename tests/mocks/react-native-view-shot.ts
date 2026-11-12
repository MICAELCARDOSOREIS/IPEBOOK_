/** Mock de react-native-view-shot para testes (Spec 092): não há tela real para capturar; devolve um arquivo fixo. */
export async function captureRef(): Promise<string> {
  return "file:///tmp/captura.png";
}

export default { captureRef };
