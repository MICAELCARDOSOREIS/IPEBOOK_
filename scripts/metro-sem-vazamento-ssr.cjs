// Contorno para vazamento de heap no SSR de desenvolvimento com Node 24+:
// A cada render SSR, o @expo/cli chama evalModule(..., { cache: false, sourceMap }).
// No Node 24, findSourceMap(compileFilename) retém o SourceMap decodificado (~180 MB)
// no moduleSourceMapCache mesmo com cache: false, levando o Metro ao OOM após poucas navegações.
// Em dev, omitir sourceMap nessas execuções descartáveis mantém o heap estável.
// Defina EXPO_SSR_SOURCEMAPS=1 para reativar os mapas SSR temporariamente ao depurar erros no servidor.
"use strict";

if (!process.env.JEST_WORKER_ID && process.env.EXPO_SSR_SOURCEMAPS !== "1") {
  try {
    const caminhoModulo = require.resolve("@expo/require-utils");
    const exportsOriginais = require(caminhoModulo);
    const entradaCache = require.cache[caminhoModulo];

    if (entradaCache && typeof exportsOriginais?.evalModule === "function") {
      const evalModuleOriginal = exportsOriginais.evalModule;
      const descritores = Object.getOwnPropertyDescriptors(exportsOriginais);
      delete descritores.evalModule;
      const exportsEnvolvidos = Object.create(
        Object.getPrototypeOf(exportsOriginais),
        descritores,
      );

      Object.defineProperty(exportsEnvolvidos, "evalModule", {
        enumerable: true,
        configurable: true,
        value: function evalModuleSemVazamentoSsr(code, filename, opts = {}, format) {
          if (opts && opts.cache === false && opts.sourceMap) {
            const { sourceMap: _ignorado, ...restoOpts } = opts;
            return evalModuleOriginal.call(this, code, filename, restoOpts, format);
          }
          return evalModuleOriginal.call(this, code, filename, opts, format);
        },
      });

      entradaCache.exports = exportsEnvolvidos;
    }
  } catch {
    // Se @expo/require-utils não estiver resolvível neste processo, segue inicialização normal.
  }
}
