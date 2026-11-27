const originais = new Map<string, PropertyDescriptor | undefined>();

/** Substitui temporariamente uma propriedade em `globalThis`, preservando o descritor original. */
export function stubGlobal(nome: string, valor: unknown): void {
  if (!originais.has(nome)) {
    originais.set(nome, Object.getOwnPropertyDescriptor(globalThis, nome));
  }
  Object.defineProperty(globalThis, nome, {
    value: valor,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

/** Restaura todas as propriedades substituídas por `stubGlobal`. */
export function unstubAllGlobals(): void {
  for (const [nome, descritor] of originais.entries()) {
    if (descritor === undefined) {
      delete (globalThis as Record<string, unknown>)[nome];
    } else {
      Object.defineProperty(globalThis, nome, descritor);
    }
  }
  originais.clear();
}
