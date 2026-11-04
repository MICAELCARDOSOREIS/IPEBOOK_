# Guia de desenvolvimento

## Backend Supabase (spec 007)

O backend oficial é o Supabase, selecionado com `EXPO_PUBLIC_BACKEND=supabase` (padrão do
[`.env.example`](../.env.example)). O projeto usa tabelas `v2_` para esta versão. As 41 migrações
locais de `supabase/migrations/` já estão aplicadas e verificadas no projeto remoto
(`npm run health:supabase:remote`). Configurar no `.env` a URL do projeto, a chave **publicável** e
`EXPO_PUBLIC_AUTH_REDIRECT_URL`; o endereço de retorno precisa estar na lista de URLs permitidas do
Supabase Auth. Não usar `service_role` no cliente nem registrar segredos no repositório.

Fora dos testes, os adaptadores em memória deixam de ser usados quando `EXPO_PUBLIC_BACKEND=supabase`;
eles permanecem apenas como implementação determinística da suíte automatizada. Validar localmente
com `npm run validate` (inclui `npm run test:sql` via PGlite) e `npm run build:web`; esses comandos
não aplicam migrações remotas nem verificam entrega de e-mail.

### Migrações do banco e reconciliação com Supabase

As migrações SQL oficiais residem em `supabase/migrations/` e são aplicadas cronologicamente:
- **Validação local:** `npm run test:sql` executa todas as migrações e testa políticas RLS usando PostgreSQL em memória via PGlite (`scripts/verificar-migracoes.mjs`).
- **Conferência remota:** `npx supabase migration list --linked` exibe o status de cada versão no repositório local e no banco remoto do Supabase.
- **Aplicação remota:** `npx supabase db push` aplica novas migrações locais de forma reproduzível.
- **Reconciliação de histórico:** Se o histórico remoto divergir devido a migrações legadas órfãs, utiliza-se `npx supabase migration repair --status reverted --linked <versões>` para remover referências órfãs de `schema_migrations`, e `--status applied` para marcar migrações já presentes no banco, garantindo que `db push` continue funcionando sem intervenção manual destrutiva.


## Ambiente

O projeto usa npm e `package-lock.json`. A CI está configurada com Node.js 22. As versões do projeto estão em [package.json](../package.json); o lockfile registra as versões resolvidas. Não atualizar dependências como parte de uma simples instalação.

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
| `npm run lint` | Analisa o código com o Biome e falha apenas em erros |
| `npm run lint:fix` | Aplica as correções seguras do Biome |
| `npm run check:architecture` | Verifica imports entre camadas |
| `npm run check:numbering` | Falha se duas specs ou dois ADRs usarem o mesmo número |
| `npm run test:sql` | Executa migrações e cenários de RLS em PostgreSQL local via PGlite |
| `npm test` | Executa a suíte uma vez |
| `npm run validate` | Executa tipos, lint, arquitetura, SQL e testes, interrompendo em falhas |
| `npm run build:web` | Exporta arquivos estáticos para `dist/` |

Para Android/iOS é necessário preparar o ambiente nativo e um cliente compatível com o SDK utilizado. O simulador iOS local depende de macOS. Nesta entrega não há validação em dispositivo ou emulador; executar o comando não garante que o ambiente nativo esteja preparado.

## Configuração e dados

[app.json](../app.json) define nome, slug, esquema `ipebook`, orientação, plugins e exportação web estática. [tsconfig.json](../tsconfig.json) habilita modo estrito e alias `@/`.

O backend oficial de desenvolvimento e produção é o `supabase`, configurado pelas variáveis descritas
acima e no [`.env.example`](../.env.example). A suíte de testes usa os adaptadores em memória
automaticamente. A presença da URL e da chave publicável no `.env` não aplica migrações: é necessário
configurar `EXPO_PUBLIC_AUTH_REDIRECT_URL` e `EXPO_PUBLIC_BACKEND=supabase`. Arquivos `.env*` são
ignorados pelo Git, exceto `.env.example`.

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

## APK de debug local

`npm run apk:debug` inicia a compilação em segundo plano, desacoplada do terminal (sobrevive ao fechar o terminal ou a sessão de IA). `npm run apk:debug:status` mostra o andamento ou o caminho do APK (`android/app/build/outputs/apk/debug/app-debug.apk`); `bash scripts/gerar-apk-debug.sh esperar` acompanha até o fim. Requer a pasta `android/` (gere com `npx expo prebuild -p android --no-install` após adicionar módulos nativos). O APK de debug carrega o código do Metro (`npx expo start`).

## APK de release local (produção autônoma)

`npm run apk:release` inicia a compilação do APK de release em segundo plano, desacoplada do terminal. Diferente do debug, este APK é 100% autônomo (não necessita do servidor Metro), executa com bytecode pré-compilado pelo motor Hermes, minificação R8/ProGuard e compressão de recursos. O arquivo final é gerado em `android/app/build/outputs/apk/release/app-release.apk`. Para acompanhar o andamento, use `npm run apk:release:status` ou `npm run apk:release:log`.
