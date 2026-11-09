# 0103 — Esqueletos de carregamento (Skeleton Loading) e revalidação sem bloqueio (Stale-While-Revalidate)

- **Data:** 2026-11-09
- **Status:** Aceito

## Contexto

Ao navegar entre as abas e telas do IpêBook (como *Meu Perfil*, *Início*, *Explorar*, *Estante* e *Conversas*), o aplicativo apresentava dois comportamentos que causavam forte sensação de lentidão:
1. **Spinners em tela branca:** enquanto os dados carregavam pela primeira vez, a tela inteira ficava vazia com apenas um pequeno `ActivityIndicator` girando no centro (ex.: em `ProfileHub` e em telas secundárias), sem nenhuma estrutura visual que antecipasse o formato do conteúdo.
2. **Re-carregamento destrutivo ao trocar de aba:** toda vez que um componente como `ProfileHub`, `Home` ou `MyListings` montava novamente, os ViewModels iniciavam com `loading: true` e `profile: null` / `books: []`, fazendo o usuário esperar uma nova requisição de rede ao Supabase mesmo tendo acabado de visitar aquela tela segundos antes.

## Decisão

1. **Esqueletos visuais pulsantes (`SkeletonLoading` / `LoadingState`):**
   - Transformar o componente universal `LoadingState` e criar variantes estruturais de esqueleto ("caixinhas" pulsantes com opacidade animada entre `0.45` e `0.9` usando `colors.m3.surfaceContainerHighest` e `colors.m3.surfaceContainerHigh`), sem exibir textos soltos no lugar dos componentes, mas preservando rigorosamente a acessibilidade para leitores de tela (`accessibilityLabel={label}` e texto oculto visualmente para compatibilidade com a suíte de testes e TalkBack/VoiceOver).
   - Criar 10 variantes de layout de esqueleto em `LoadingSkeletonVariants.tsx` (`variant?: "list" | "profile" | "publicProfile" | "catalog" | "homeCarousel" | "shelf" | "conversations" | "detail" | "manage" | "form"`), garantindo que cada tela exiba sombras/caixinhas idênticas à sua anatomia real (ex.: 3 caixinhas de resumo + abas + chips + card agrupador na *Estante*; barra de contagem/ordenação + cards horizontais no *Explorar*; carrossel de cards verticais de `168px` no *Início*; avatar circular centralizado no *Perfil Público*; lista com avatar circular em *Conversas*).
   - Substituir os `ActivityIndicator` isolados de carregamento de tela (`profileHub.tsx`, `publicProfile.tsx`, `editListing.tsx`, `receivedRatings.tsx`, `blockedUsers.tsx`, `requestDetail.tsx`, `editAlert.tsx`, `manageAlert.tsx`, `moderation.tsx` e `chat.tsx`) pelo `LoadingState` com esqueleto visual.

2. **Cache em memória de sessão com Stale-While-Revalidate nos ViewModels principais:**
   - Em `useProfileViewModel`, `useHomeViewModel` e `useMyListingsViewModel`, manter um cache leve em memória indexado por usuário/catálogo durante a sessão ativa.
   - Quando a tela já possuir dados em cache na memória da sessão, inicializar o estado imediatamente com os dados em cache e `loading: false`, disparando a atualização em segundo plano de forma silenciosa (sem exibir esqueleto nem apagar a tela).
   - Expor função de limpeza de cache para testes automatizados quando necessário, garantindo isolamento determinístico em `NODE_ENV === "test"`.

## Consequências

- **Positivas:**
  - Na primeira abertura de qualquer tela, o usuário vê imediatamente o esqueleto estruturado ("caixinhas" pulsantes no formato real da tela) em vez de uma tela vazia com spinner.
  - A partir da segunda visita à aba (*Início*, *Explorar*, *Estante*, *Meu Perfil*), a abertura é **instantânea (0 ms)**, exibindo os dados já carregados enquanto sincroniza silenciosamente em segundo plano.
  - Preserva 100% dos contratos de acessibilidade e dos testes existentes.
- **Negativas / Trade-offs:**
  - Em ambiente de teste (`NODE_ENV === "test"`), o cache de módulo entre testes diferentes precisaria ser limpo se ativado globalmente; por isso, o cache em memória de módulo opera automaticamente em execução normal do app e pode ser inspecionado/testado explicitamente sem interferir nos mocks unitários.
