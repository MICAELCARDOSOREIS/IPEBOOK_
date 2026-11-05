import { makePwaViewModel } from "@/di/container";
import type { UsePwaViewModelOptions } from "@/viewmodel/usePwaViewModel";

export interface PwaRegisterProps extends Partial<UsePwaViewModelOptions> {}

/**
 * Componente não intrusivo para disparo e acompanhamento do Service Worker na Web (Spec 041, ADR 0035).
 * Não renderiza elementos visuais na árvore de componentes.
 */
export function PwaRegister(props: PwaRegisterProps = {}) {
  makePwaViewModel(props);
  return null;
}
