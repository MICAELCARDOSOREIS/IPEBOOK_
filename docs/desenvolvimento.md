# Guia de desenvolvimento

## Ambiente

O projeto usa npm e `package-lock.json`. A CI está configurada com Node.js 24; a primeira validação local usou Node.js 26.8.2. As versões do projeto estão em [package.json](../package.json); o lockfile registra as versões resolvidas. Não atualizar dependências como parte de uma simples instalação.

## Instalar e executar

Dentro da pasta clonada, ou nesta instalação local:

```bash
cd /home/usermicael/IPEBOOK_
npm ci
npm run web
```

Em outra máquina, substituir apenas o caminho pelo diretório do clone. `npm ci` reinstala dependências a partir do lockfile e exige acesso ao registro npm; não precisa de credenciais de banco. Usar a URL exibida pelo Expo no terminal. Para encerrar o servidor, pressionar `Ctrl+C` no mesmo terminal.

| Comando | Resultado |
| --- | --- |
| `npm start` | Inicia servidor de desenvolvimento Expo |
| `npm run web` | Inicia o fluxo web do Expo |
| `npm run android` | Solicita abertura no ambiente Android disponível |
| `npm run ios` | Solicita abertura no simulador iOS disponível |
| `npm run typecheck` | Verifica tipos sem emitir arquivos |
| `npm run check:architecture` | Verifica imports entre camadas |
| `npm test` | Executa a suíte uma vez |
| `npm run validate` | Executa tipos, arquitetura e testes, interrompendo em falhas |
| `npm run build:web` | Exporta arquivos estáticos para `dist/` |

Para Android/iOS é necessário preparar o ambiente nativo e um cliente compatível com o SDK utilizado. O simulador iOS local depende de macOS. Nesta entrega não há validação em dispositivo ou emulador; executar o comando não garante que o ambiente nativo esteja preparado.

## Configuração e dados

[app.json](../app.json) define nome, slug, esquema `ipebook`, orientação, plugins e exportação web estática. [tsconfig.json](../tsconfig.json) habilita modo estrito e alias `@/`.

O código atual não exige variáveis de ambiente, login, API ou banco. A existência de `.env.example` não significa que suas chaves sejam consumidas pelo aplicativo. Esse arquivo foi encontrado como trabalho local do usuário e não foi alterado nesta revisão. Antes de implementar uma integração, definir e documentar cada variável sem valores secretos. Arquivos `.env*` são ignorados pelo Git, exceto `.env.example`.

## Conferir a exportação local

```bash
npm run build:web
python3 -m http.server 8089 --bind 127.0.0.1 --directory dist
```

Python 3 é necessário somente para este servidor de conferência. Abrir `http://127.0.0.1:8089`. Servir arquivos localmente não publica o aplicativo. Os estados esperados estão no [guia de uso](uso.md).

## Fluxo de contribuição

1. Conferir `git status --short --branch` e preservar alterações existentes.
2. Usar `develop` como base; para trabalho isolado, criar branch com nome descritivo a partir dela.
3. Para funcionalidade nova, definir objetivo, escopo, critérios de aceite, plano e tarefas em `specs/` antes de implementar.
4. Aplicar Superpowers pertinente e os [ADRs](adr/README.md), sem duplicar planos fora do Spec Kit.
5. Implementar uma entrega por vez, executar verificações pertinentes e revisar o diff completo.
6. Atualizar guias e evidências. Commits devem ter mensagens em português; nunca fazer commits diretamente em `main`.
7. Quando envio remoto estiver autorizado, usar PR da branch de trabalho para `develop`. Publicação e promoção para `main` exigem o escopo autorizado correspondente.

## Problemas comuns

| Sintoma | Conferência e encaminhamento |
| --- | --- |
| Catálogo sem livros | É o estado intencional do datasource padrão; não é falha de conexão |
| Erro de alias `@/` | Conferir `tsconfig.json`, caminho e capitalização do import |
| Rota nova não reconhecida pelo TypeScript | `npm run typecheck` regenera os tipos ignorados em `.expo/types/` antes de verificar; não editar esses tipos manualmente |
| Violação de arquitetura | Ler o arquivo e import apontados; corrigir a dependência, sem desabilitar o verificador |
| Falha de instalação por DNS/rede | Verificar conectividade e acesso ao registro; não modificar versões ou apagar lockfile para esconder a falha |
| Dependências incompatíveis com Expo | Conferir versões com `npx expo install --check`; revisar o lockfile antes de alterar dependências |
| Porta ocupada | Encerrar somente o servidor próprio ou usar outra porta, como `npm run web -- --port 8090` |
| Emulador não inicia | Preparar ambiente da plataforma; não interpretar build web como teste nativo |
| Push recusado por falta de `workflow` | A autenticação precisa autorizar alteração do arquivo de CI; seguir o fluxo de autenticação da ferramenta Git usada |

Nenhum segredo deve aparecer em exemplos, capturas, logs compartilhados ou commits.
