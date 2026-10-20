import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "react-native": fileURLToPath(new URL("./tests/mocks/react-native.ts", import.meta.url)),
      "react-native-safe-area-context": fileURLToPath(new URL("./tests/mocks/react-native-safe-area-context.ts", import.meta.url)),
      "@expo/vector-icons": fileURLToPath(new URL("./tests/mocks/expo-vector-icons.cjs", import.meta.url)),
      "expo-symbols": fileURLToPath(new URL("./tests/mocks/expo-symbols.cjs", import.meta.url)),
      "@react-native-community/netinfo": fileURLToPath(new URL("./tests/mocks/netinfo.ts", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    pool: "threads",
    setupFiles: ["./tests/setupNodeReactNative.cjs", "./tests/setupTests.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/app/**", "**/*.d.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
