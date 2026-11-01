export type IpePetalVariant = "entry" | "celebration";

type Listener = (variant: IpePetalVariant) => void;
const listeners = new Set<Listener>();

let hasCelebratedInitialAppLaunch = false;

/** Dispara uma entrada breve ou a florada completa sobre a tela e a barra de navegação. */
export function triggerIpePetals(variant: IpePetalVariant = "celebration") {
  listeners.forEach((listener) => listener(variant));
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
 * Dispara uma queda breve apenas na primeira entrada do aplicativo na sessão.
 * Ao navegar entre abas ("Explorar", "Pesquisa", "Perfil") e retornar para o "Início",
 * a florada não se repete sozinha.
 */
export function checkAndTriggerInitialPetals() {
  if (!hasCelebratedInitialAppLaunch) {
    hasCelebratedInitialAppLaunch = true;
    triggerIpePetals("entry");
  }
}

/**
 * Reinicia o estado da sessão para testes automatizados.
 */
export function resetAppLaunchCelebrationForTesting() {
  hasCelebratedInitialAppLaunch = false;
}
