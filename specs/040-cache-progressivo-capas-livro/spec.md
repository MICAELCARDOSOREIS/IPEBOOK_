# Spec 040 — Otimização, cache progressivo e retry em capas de livros

**Responsável:** Agente Especialista (`pessoa:agente-especialista`)
**Data:** 21 de outubro de 2026
**Issue:** #178
**Componente:** `src/view/components/BookCover.tsx`, `src/viewmodel/useBookCoverImage.ts`, `src/viewmodel/bookCoverCache.ts`.

## Problema

Nas telas de listagem de livros (Início, Pesquisa, Meus Anúncios, Favoritos e Pedidos), o componente de capa de livro (`BookCover`) renderizava imagens remotas diretamente via componente `Image` do React Native, sem camadas de resiliência. Esse comportamento apresentava três deficiências críticas:
1. **Falta de cache em memória de URLs validadas:** durante rolagens rápidas ou transições de tela, imagens já baixadas sofriam novos disparos de renderização ou pisques visuais (*flicker*).
2. **Ausência de timeout e retry automático:** sob conexões móveis instáveis ou lentas (comum no contexto comunitário da beta em Piripiri), uma falha transitória ou latência prolongada deixava o componente travado ou falhava imediatamente para o fallback, sem nova tentativa.
3. **Ausência de placeholder progressivo e acessibilidade inconsistente:** enquanto a imagem era carregada pela rede, o usuário via um espaço vazio sem feedback visual (*skeleton*), e a árvore de acessibilidade não informava o papel semântico de imagem (`accessibilityRole="image"`) nem o estado de carregamento em andamento.

## Escopo

- Implementar gerenciador de cache em memória leve (`bookCoverCache`) com política LRU/limite de capacidade para memorizar URLs de capas já resolvidas com sucesso ou que falharam definitivamente.
- Implementar hook especializado `useBookCoverImage` na camada de ViewModel, gerenciando o ciclo de vida do carregamento, timeout de 5 segundos e até 2 retries automáticos com backoff progressivo suave antes de desistir para a capa padrão.
- Aprimorar o componente `BookCover` para exibir *placeholder* progressivo suave (*skeleton* com animação suave de pulso) durante o estado de carregamento.
- Garantir acessibilidade semântica integral em todos os estados da capa (`accessibilityRole="image"`, `accessibilityLabel` descritivo baseado no título do livro).
- Preservar o fallback determinístico do Design System do IpêBook baseado nas 5 cores institucionais e tipografia quando a foto não existir ou falhar após os retries.
- Fora do escopo: persistência em disco de imagens binárias no dispositivo (fora do escopo da beta leve web/managed Expo).

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Cache em Memória Imediato):** quando uma URL de capa já foi resolvida com sucesso anteriormente, seu estado é recuperado instantaneamente do cache em memória, evitando novo estado de loading e eliminando *flicker* na rolagem de listas.
- **RN-02 (Timeout de Carregamento):** o carregamento de uma capa possui timeout padrão de 5.000 ms (5 segundos). Se a imagem remota não disparar evento de sucesso dentro da janela, a tentativa atual é considerada falha transitória.
- **RN-03 (Mecanismo de Retry com Backoff):** ocorrendo erro de rede transitório (`onError`) ou expiração do timeout, o componente realiza até 2 tentativas adicionais de retry com intervalo suave (backoff exponencial progressivo: ex. 500 ms, 1.000 ms).
- **RN-04 (Fallback Gracioso Determinístico):** se todas as tentativas de carregamento falharem ou se o anúncio não possuir foto (`photoUrl` nulo ou vazio), o componente renderiza a capa ilustrativa padronizada em tons do Design System do IpêBook (Azul, Marrom, Verde, Vinho ou Mostarda), determinística pelo ID do livro.
- **RN-05 (Placeholder Progressivo / Skeleton):** durante o estado de carregamento (`loading`), é exibido um placeholder suave nas proporções canônicas da capa com animação sutil de pulso, informando visualmente que o conteúdo está sendo recuperado.
- **RN-06 (Acessibilidade Semântica):** todos os estados da capa devem conter `accessibilityRole="image"`. O `accessibilityLabel` deve ser explícito e contextualizado:
  - Foto carregada: `"Foto da capa de <Título>"`
  - Em carregamento: `"Carregando capa de <Título>"`
  - Capa ilustrativa: `"Capa ilustrativa de <Título>"`

## Critérios de Aceite

1. O componente `BookCover` exibe a imagem real com `accessibilityRole="image"` e `accessibilityLabel="Foto da capa de <Título>"` quando o carregamento é bem-sucedido.
2. Em rolagens repetidas de itens com a mesma URL de foto, o cache em memória entrega o status de carregado imediatamente, sem reexibir loading/skeleton.
3. Se a requisição da imagem falhar por erro de rede ou estourar o timeout de 5 segundos, são realizadas até 2 novas tentativas com intervalo progressivo antes de declarar falha.
4. Esgotadas as tentativas de retry, o componente apresenta a capa ilustrativa determinística com as cores do Design System, sem quebrar a interface nem deixar buraco visual.
5. Durante o carregamento inicial de foto não em cache, o placeholder/skeleton com animação suave de pulso é apresentado.
6. A árvore de componentes e acessibilidade expõe os rótulos e papéis acessíveis de acordo com cada estado da capa.
7. Desmontar o componente durante o carregamento cancela timers e timeouts pendentes, prevenindo vazamentos de memória.
8. `npm run validate` é executado com sucesso (100% dos testes passando e sem violações de arquitetura de camadas).

## Validação

- Testes unitários do cache em memória e do hook `useBookCoverImage` cobrindo sucesso imediato, hit de cache, timeout, retries sucessivos, esgotamento e descarte no unmount.
- Testes de componente do `BookCover` cobrindo renderização imediata, skeleton em loading, transição de sucesso, fallback determinístico após retries e atributos de acessibilidade.
- Execução de `npm run check:architecture` e `npm run test:coverage`.
