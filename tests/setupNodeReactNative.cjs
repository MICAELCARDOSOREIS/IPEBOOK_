global.__DEV__ = true;
const path = require("node:path");
const Module = require("node:module");

const orig = Module._resolveFilename;
const mockRnPath = path.resolve(__dirname, "mocks/react-native.cjs");
const mockSafePath = path.resolve(__dirname, "mocks/react-native-safe-area-context.cjs");
const mockSymbolsPath = path.resolve(__dirname, "mocks/expo-symbols.cjs");
const mockVectorIconsPath = path.resolve(__dirname, "mocks/expo-vector-icons.cjs");
const mockNetInfoPath = path.resolve(__dirname, "mocks/netinfo.cjs");
const mockCameraPath = path.resolve(__dirname, "mocks/expo-camera.cjs");

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
  if (req === "@react-native-community/netinfo") {
    return mockNetInfoPath;
  }
  if (req === "expo-camera") {
    return mockCameraPath;
  }
  return orig.call(this, req, ...args);
};

