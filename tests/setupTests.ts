import Module from "node:module";
import path from "node:path";
import type { ReactNode } from "react";

jest.mock("expo-symbols", () => ({
  SymbolView: (props: any) => null,
}));

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
  useIsFocused: () => true,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  },
  useFocusEffect: (cb: () => void | (() => void)) => {
    void cb;
  },
  usePathname: () => "/",
  useLocalSearchParams: () => ({}),
}));

const mockPath = path.resolve(__dirname, "mocks/react-native.cjs");

// Redireciona qualquer require('react-native') feito pelo RNTL para o mock nativo
// @ts-expect-error interceptando resolução de módulo do Node
const origResolve = Module._resolveFilename;
// @ts-expect-error interceptando resolução de módulo do Node
Module._resolveFilename = function (req: string, ...args: any[]) {
  if (req === "react-native") {
    return mockPath;
  }
  return origResolve.call(this, req, ...args);
};

