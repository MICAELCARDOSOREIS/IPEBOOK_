/** Plugin Babel para transformar `import()` dinâmico e `import.meta` em CommonJS no Jest. */
module.exports = function babelJestEsmCompat({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.type !== "Import" || path.node.arguments.length === 0) {
          return;
        }
        const arg = path.node.arguments[0];
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.callExpression(t.memberExpression(t.identifier("Promise"), t.identifier("resolve")), []),
              t.identifier("then"),
            ),
            [t.arrowFunctionExpression([], t.callExpression(t.identifier("require"), [arg]))],
          ),
        );
      },
      MetaProperty(path) {
        if (path.node.meta.name !== "import" || path.node.property.name !== "meta") {
          return;
        }
        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier("url"),
              t.memberExpression(
                t.callExpression(
                  t.memberExpression(
                    t.callExpression(t.identifier("require"), [t.stringLiteral("node:url")]),
                    t.identifier("pathToFileURL"),
                  ),
                  [t.identifier("__filename")],
                ),
                t.identifier("href"),
              ),
            ),
          ]),
        );
      },
    },
  };
};
