type Listener = () => void;
const listeners = new Set<Listener>();

let hasCelebratedInitialAppLaunch = false;

/**
 * Dispara a florada comemorativa de flores e folhas de Ipê sobre toda a aplicação
 * (cobrindo a tela e a barra de navegação inferior).
 */
export function triggerIpePetals() {
  listeners.forEach((listener) => listener());
}

/**
 * Inscreve um componente para reagir aos disparos da florada de Ipê.
 */
export function subscribeIpePetals(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dispara a florada automaticamente apenas na primeira entrada do aplicativo na sessão.
 * Ao navegar entre abas ("Explorar", "Pesquisa", "Perfil") e retornar para o "Início",
 * a florada não se repete sozinha.
 */
export function checkAndTriggerInitialPetals() {
  if (!hasCelebratedInitialAppLaunch) {
    hasCelebratedInitialAppLaunch = true;
    triggerIpePetals();
  }
}

/**
 * Reinicia o estado da sessão para testes automatizados.
 */
export function resetAppLaunchCelebrationForTesting() {
  hasCelebratedInitialAppLaunch = false;
}
