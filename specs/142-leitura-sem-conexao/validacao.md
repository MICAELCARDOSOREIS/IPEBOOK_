# Validação da leitura sem conexão

## Regressões e fluxos automatizados

- Na versão anterior, os testes reproduziram o retorno indevido da primeira página para uma consulta com deslocamento e a perda do detalhe público que estava fora da lista.
- A rodada focada final passou com 327 testes em 26 arquivos. Conferiu persistência, idade da cópia, atualização, renovação com resposta vazia, paginação, isolamento por conta, limpeza, aviso e recarga ao reconectar, fallback das capas, rascunhos, propostas e chat.
- Comando da rodada focada:

  ```sh
  npm test -- --runInBand cachedBookDataSource serviceWorkerLogic homeViewMocked bookCover bookDetailView createListing chatOffline settingsView proposalSheet searchView myListingsView shareAndSupabaseClient asyncStorageLocalCacheDataSource
  ```

- A regressão da proposta falhou antes do ajuste. Na versão final, o botão de envio fica desabilitado durante a desconexão, a pessoa pode fechar a tela e o texto continua disponível para enviar após reconectar.
- `NODE_OPTIONS=--max-old-space-size=2200 npm run test:coverage -- --maxWorkers=1 --workerIdleMemoryLimit=850MB` aprovou 2.347 testes em 317 arquivos. A cobertura foi de 95,31% de linhas e 85,63% de ramificações.
- `npm run typecheck`, `npm run check:architecture`, `npm run check:design-system` `npm run check:numbering` e `npm run check:docs` passaram. O lint passou com avisos.

## Navegador

- `expo export --platform web --max-workers 2` gerou uma build com o adaptador do Supabase e configuração fictícia para o teste. No Chrome por CDP, a pesquisa foi aberta online, a idade das cópias foi adiantada em seis minutos, e o catálogo e um detalhe fora da lista foram reabertos com a rede desativada. A cópia exibiu sua data, a capa ilustrada apareceu quando a foto falhou e a pesquisa se atualizou automaticamente quando a conexão voltou. A tela de pesquisa não apresentou rolagem horizontal a 390 px. As respostas foram simuladas no cliente.
- `npm run test:e2e`, com uma exportação em modo memória, aprovou os 7 cenários, incluindo a faixa offline, a publicação, os favoritos e o ciclo de negociação.

## Verificação em celular físico pendente

O ADB encontrou apenas o ambiente Android Waydroid. Em um celular de teste, entrar na conta, abrir o catálogo e a Estante e consultar um detalhe. Fechar o app, ativar o modo avião, esperar mais de cinco minutos e reabrir. Confirmar a data da cópia, os livros disponíveis, a capa ilustrada se a foto falhar e o bloqueio de envio com preservação do texto. Desativar o modo avião e verificar a atualização. A Estante depende de uma sessão disponível no aparelho.

[Referência para a política de requisições no cliente web](https://supabase.com/docs/reference/javascript/initializing)
