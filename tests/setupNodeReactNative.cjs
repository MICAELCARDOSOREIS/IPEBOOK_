global.__DEV__ = true;
const path = require("node:path");
const Module = require("node:module");

const orig = Module._resolveFilename;
const mockRnPath = path.resolve(__dirname, "mocks/react-native.cjs");
const mockSafePath = path.resolve(__dirname, "mocks/react-native-safe-area-context.cjs");
const mockSymbolsPath = path.resolve(__dirname, "mocks/expo-symbols.cjs");
const mockVectorIconsPath = path.resolve(__dirname, "mocks/expo-vector-icons.cjs");

Module._resolveFilename = function (req, ...args) {
  if (req === "react-native") {
    return mockRnPath;
  }
  if (req === "react-native-safe-area-context") {
    return mockSafePath;
  }
  if (req === "expo-symbols") {
    return mockSymbolsPath;
  }
  if (req === "@expo/vector-icons") {
    return mockVectorIconsPath;
  }
  return orig.call(this, req, ...args);
};

