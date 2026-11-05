import { makeAuthViewModel, makePushRegistration } from "@/di/container";

export type PushRegistrationProps = {
  /** Abre a rota do aviso tocado (por exemplo, `/negociacao/<id>`). */
  onOpenRoute: (route: string) => void;
};

/** Liga o push do aparelho à conta logada (Spec 096); não desenha nada. */
export function PushRegistration({ onOpenRoute }: PushRegistrationProps) {
  const [authState] = makeAuthViewModel();
  makePushRegistration(authState.user?.id ?? null, onOpenRoute);
  return null;
}
