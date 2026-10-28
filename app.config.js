const { withGradleProperties } = require("expo/config-plugins");

// Memória da build Android: com muitos núcleos o Gradle abre vários compiladores Kotlin em paralelo e estoura a
// RAM em máquinas de ~12 GB (OutOfMemoryError no :compileReleaseKotlin). Menos tarefas paralelas, Kotlin no mesmo
// processo do Gradle e mais memória para ele. Vale para a build local e para a da nuvem (a pasta android/ é gerada).
const GRADLE_PROPERTIES = {
  "org.gradle.jvmargs": "-Xmx4096m -XX:MaxMetaspaceSize=1024m",
  "org.gradle.workers.max": "4",
  "kotlin.compiler.execution.strategy": "in-process",
};

function withBuildMemory(config) {
  return withGradleProperties(config, (gradle) => {
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      gradle.modResults = gradle.modResults.filter((item) => !(item.type === "property" && item.key === key));
      gradle.modResults.push({ type: "property", key, value });
    }
    return gradle;
  });
}

// Spec 106: o google-services.json não vai para o Git; na build do EAS ele chega pela variável de arquivo
// GOOGLE_SERVICES_JSON (eas env:create --type file). Localmente, usa o arquivo da raiz definido no app.json.
module.exports = ({ config }) =>
  withBuildMemory({
    ...config,
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
    },
  });
