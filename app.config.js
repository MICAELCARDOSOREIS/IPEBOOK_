// Spec 106: o google-services.json não vai para o Git; na build do EAS ele chega pela variável de arquivo
// GOOGLE_SERVICES_JSON (eas env:create --type file). Localmente, usa o arquivo da raiz definido no app.json.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
