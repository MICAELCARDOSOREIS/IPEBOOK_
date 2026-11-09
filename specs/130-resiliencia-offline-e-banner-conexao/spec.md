# Especificação 130 — Banner global de conectividade, cache offline da estante e blindagem de ações offline

**Estado:** Especificada em 2026-11-09  
**ADR:** [0101](../../docs/adr/0101-banner-de-conexao-e-cache-da-estante.md)

## Objetivo e escopo

Aprimorar a resiliência do aplicativo diante de perdas momentâneas de sinal de internet, comuns nas áreas periféricas de Piripiri, PI:
1. Exibir um banner global sutil e acessível no topo do app informando que o aparelho está sem conexão com a internet, sumindo automaticamente quando a conexão voltar.
2. Garantir que a pessoa usuária consiga consultar seus próprios livros cadastrados ("Minha Estante") mesmo offline, usando cache local transparente em `CachedBookDataSource`.
3. Prevenir tentativas frustrantes de envio de mensagens no chat quando o aparelho estiver offline, desabilitando o botão e exibindo aviso acessível.

## Regras de negócio

- **RN-01 (Banner global de conectividade):** Quando `isOnline` for `false`, o app deve exibir no topo um aviso discreto contendo ícone `wifiOff`, texto em português (*"Sem conexão com a internet"*) e propriedades semânticas acessíveis (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`). Quando `isOnline` voltar a `true`, o banner não deve ser renderizado.
- **RN-02 (Cache offline da estante):** O `CachedBookDataSource` deve armazenar em `AsyncStorage` a listagem de livros do anunciante autenticado (`listByOwner(ownerId)`). Em caso de falha de rede (`networkError`), se houver cópia local válida, deve devolvê-la em vez de estourar erro imediato.
- **RN-03 (Invalidação da estante):** Ações de escrita (`create`, `update`, `updateStatus`, `delete`) devem invalidar tanto o cache geral do catálogo quanto o cache do anunciante (`ownerId`).
- **RN-04 (Blindagem do envio no chat):** Na tela de conversa/chat, se `!isOnline`, o botão de envio de mensagem deve ficar desabilitado (`accessibilityState={{ disabled: true }}`) com aviso explicativo, prevenindo timeouts de rede inúteis.
- **RN-05 (Conformidade arquitetural e de testes):** Sem quebra da separação em camadas MVVM de 7 níveis nem regressão em qualquer um dos 2.159 testes existentes.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Componente `ConnectionStatusBanner` implementado no design system e integrado ao layout do app. | `src/view/components/ConnectionStatusBanner.tsx`, `tests/components/connectionStatusBanner.test.tsx` |
| CA2 | `CachedBookDataSource.listByOwner` armazena e recupera livros em cache local em caso de desconexão. | `src/infra/datasources/cachedBookDataSource.ts`, `tests/unit/cachedBookDataSource.test.ts` |
| CA3 | Invalidação consistente do cache do proprietário nas mutações de livro. | `tests/unit/cachedBookDataSource.test.ts` |
| CA4 | Botão de envio no chat desabilitado com acessibilidade quando offline. | `src/view/conversations/chat.tsx`, `tests/components/chatOffline.test.tsx` |
| CA5 | Pipeline `npm run validate` (tipos, linter, arquitetura, design system, testes e docs) aprovado com 0 erros. | `npm run validate` |
