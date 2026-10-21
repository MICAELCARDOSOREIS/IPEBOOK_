# 0034 — Cache progressivo, resiliência de timeout e retry em capas de livros

Data: 2026-10-21. Status: aceito.

## Contexto

O IpêBook é uma plataforma de circulação comunitária de livros físicos em Piripiri (Piauí). Em ambientes de redes móveis periféricas (3G/4G sujeitas a instabilidade e alta latência), a experiência de navegação em listas de livros (telas de Início, Busca, Meus Anúncios e Favoritos) depende criticamente da exibição fluida das capas dos livros.

Anteriormente, o componente `BookCover` (`src/view/components/BookCover.tsx`) renderizava imagens remotas diretamente por meio da tag nativa `Image` com um simples `onError` binário:
1. Não havia cache em memória das URLs validadas, gerando revalidações visuais ou recarregamentos desnecessários durante a rolagem rápida de listas virtuais (`FlatList`);
2. Erros temporários de rede ou latências prolongadas não contavam com timeout programado nem retentativas automáticas (*retries*), levando ao descarte prematuro da foto do anúncio e exibição precoce do fallback;
3. Enquanto a imagem era carregada pela rede, o componente ficava em branco sem uma indicação visual suave (*skeleton* / *placeholder* progressivo);
4. O leitor de tela recebia informações incompletas de acessibilidade durante o estado transitório de carregamento.

## Decisão

1. **Camada de ViewModel e Gerenciador de Cache em Memória:**
   - Criar `src/viewmodel/bookCoverCache.ts` contendo um cache em memória leve (`BookCoverCache`) com limitação de tamanho (política LRU/FIFO com capacidade de 300 entradas), armazenando o estado de resolução das URLs (`loaded`, `error`).
   - URLs resolvidas com sucesso são recuperadas de forma síncrona/imediata pelo componente, permitindo renderização instantânea durante rolagens e transições sem repetição do estado de carregamento.

2. **Hook de Ciclo de Vida e Resiliência (`useBookCoverImage`):**
   - Criar `src/viewmodel/useBookCoverImage.ts` gerenciando:
     - Detecção imediata de acertos no cache (*cache hit*);
     - Timeout de carregamento configurável (padrão de 5.000 ms);
     - Mecanismo de até 2 retries automáticos com *backoff* exponencial suave (ex.: 500 ms, 1.000 ms) em caso de erro de rede transitório ou expiração de timeout;
     - Limpeza rigorosa de temporizadores (*cleanup*) ao desmontar o componente ou alterar a URL, prevenindo vazamentos de memória;
     - Registro do status final de falha no cache após esgotamento das tentativas, evitando sobrecarregar a rede em itens comprovadamente indisponíveis.

3. **Placeholder Progressivo e Acessibilidade no Componente `BookCover`:**
   - Aprimorar `src/view/components/BookCover.tsx`:
     - Exibir um *placeholder* progressivo (*skeleton*) com animação suave de pulso durante o carregamento de novas imagens;
     - Transição suave para a imagem quando concluído o carregamento;
     - Preservação estrita do fallback determinístico baseado no ID do livro e na paleta institucional de 5 cores do Design System do IpêBook quando a foto for inexistente ou falhar após os retries;
     - Atributos semânticos completos de acessibilidade em todos os estados (`accessibilityRole="image"` e rótulos contextuais: `"Foto da capa de..."`, `"Carregando capa de..."` e `"Capa ilustrativa de..."`).

## Alternativas consideradas

- **Adotar `react-native-fast-image` ou bibliotecas com código nativo externo:** rejeitado por introduzir dependências nativas incompatíveis com o fluxo de release web e requisições Expo Managed sem prebuild nativo complexo. A solução em TypeScript puro é universal, leve e opera perfeitamente em Web, Android e iOS.
- **Cache persistente em disco (SQLite / FileSystem) para cada imagem:** rejeitado nesta fase da beta por complexidade desproporcional de expiração de arquivos e espaço em disco no cliente. O cache em memória supre as necessidades de rolagem e sessão sem custo de armazenamento local persistente.
- **Falha imediata sem retry:** descartado devido à frequência de falhas transitórias em conexões móveis reais em Piripiri.

## Consequências

- Rolagem de listas muito mais rápida e sem *flicker* para imagens já carregadas na sessão ativa.
- Maior resiliência a oscilações momentâneas de rede antes de recorrer ao fallback.
- Feedback visual elegante e acessível com *skeleton* durante o carregamento.
- Arquitetura MVVM preservada, com a lógica de apresentação e resiliência desacoplada da visualização.

Vínculos: [Spec 040](../../specs/040-cache-progressivo-capas-livro/spec.md), [ADR 0004](0004-design-system-e-tokens-ihc.md), [ADR 0019](0019-alinhamento-design-system-e-componentes.md), [ADR 0027](0027-resiliencia-seguranca-e-verificacao-release.md).
