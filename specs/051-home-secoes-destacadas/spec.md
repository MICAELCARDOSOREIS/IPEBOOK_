# Spec 051 — Seções destacadas na Home: recém-adicionados e doações (Figma fluxo 02)

**Responsável:** Maria Clara (`pessoa:maria-clara`)
**Data:** 21 de outubro de 2026
**Issue:** #146
**Telas no Figma:** `02.01 · Início`, `02.02 · Explorar por seção`.

## Problema

A Home exibia só uma lista vertical única com todo o catálogo, sem as seções destacadas de
descoberta do Figma ("Recém-adicionados" e "Doações disponíveis na comunidade").

## Escopo

- Duas seções em carrossel horizontal acima da lista vertical existente (que permanece
  inalterada): "Recém-adicionados" (catálogo na ordem já devolvida pelo backend — `created_at`
  descendente, ver `supabaseBookDataSource.ts`) e "Doações disponíveis na comunidade" (modalidade
  doação e status disponível).
- Cada seção só aparece quando tem pelo menos um item; limitada a 8 itens por seção.
- Botão "Ver mais" por seção, levando à tela de Pesquisa (`/pesquisa`) com o filtro de modalidade
  pré-aplicado quando pertinente (doações) ou sem filtro (recém-adicionados, já que "recentes" é a
  ordenação padrão da Pesquisa).
- Navegação acessível por botões "Anterior"/"Próximo" (Tab + Enter/clique), mesmo padrão já usado
  em `PhotoGallery` — não depende de gestos de swipe nem de atalhos de teclado específicos de
  carrossel, que teriam suporte de leitor de tela menos previsível.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Recém-adicionados):** mostra os primeiros 8 itens do catálogo carregado pela Home, na
  ordem em que o backend os devolve (mais recentes primeiro).
- **RN-02 (Doações disponíveis):** mostra até 8 itens com `modality === "donation"` e
  `status === "available"`; itens reservados ou pausados não aparecem nessa seção (continuam na
  lista vertical geral).
- **RN-03 (Ver mais):** o botão da seção de doações navega para `/pesquisa?modalidade=donation`,
  que pré-seleciona o chip "Doação" na tela de Pesquisa; o de recém-adicionados navega para
  `/pesquisa` sem parâmetros.
- **RN-04 (Sem duplicar card):** cada carrossel exibe cartão compacto (capa, título, modalidade);
  a lista vertical abaixo continua completa, podendo repetir itens já exibidos nos carrosséis —
  comportamento normal de apps com seções de destaque sobre um catálogo único.

## Critérios de Aceite

1. Cada carrossel tem cabeçalho acessível (`accessibilityRole="header"`) e botões
   "Anterior"/"Próximo" com rótulo descritivo e estado desabilitado nos limites.
2. "Ver mais" de "Doações disponíveis" abre a Pesquisa com o filtro "Doação" já selecionado.
3. "Ver mais" de "Recém-adicionados" abre a Pesquisa sem filtro.
4. A seção de doações só aparece quando há pelo menos uma doação disponível.
5. `npm run validate` passa.

## Validação

- Teste de componente da Home cobrindo as duas seções, os botões de navegação do carrossel e o
  "Ver mais" de cada uma.
- Teste de componente da Pesquisa cobrindo o novo prop `initialModality`.
- `npm run validate`.
