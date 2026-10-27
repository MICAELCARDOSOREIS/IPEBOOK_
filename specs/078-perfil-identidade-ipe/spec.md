# Spec 078 — Meu perfil e Editar perfil com a identidade Ipê + livro

**Data:** 26 de outubro de 2026
**Telas afetadas:** `src/view/profile/profileHub.tsx` (Meu perfil) e `src/view/profile/profile.tsx` (Editar perfil).

## Problema

As duas telas usam cartões neutros e não remetem à marca — o ipê amarelo de Piripiri brotando de um livro
aberto (`assets/logo-clean.png`). O perfil parece genérico, e a edição não mostra como o perfil vai ficar.

## Escopo

1. **Tokens `ipe`** nos temas claro e escuro: fundo do cartão, texto sobre ele, flor (âmbar), flor profunda
   (laranja) e tronco (marrom da marca).
2. **`IpeMark`**: medalhão do ipê brotando do livro em papel recortado (`src/view/assets/ipe-medalhao.png`, arte
   enviada pelo usuário e recortada em círculo com fundo transparente), decorativo e invisível para leitores
   de tela. A primeira versão, desenhada com `View`, foi rejeitada pelo usuário por ficar feia.
3. **`ReaderCard` — "cartão de leitor"**: fundo `ipe.container`, lombada marrom à esquerda como capa de livro,
   avatar com anel âmbar, nome em serifa, linha de avaliação e bairro, e o `IpeMark` no canto.
4. **Meu perfil**: o cartão de identidade vira `ReaderCard`; números em serifa marrom; rótulos de seção com
   uma flor de ipê.
5. **Editar perfil**: o avatar solto vira a **pré-visualização ao vivo** do `ReaderCard` ("Assim seu cartão
   aparece"), atualizada conforme nome, bairro e foto.

## Fora do escopo

Campos, validação, salvamento e navegação continuam iguais.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | `ReaderCard` mostra nome, linha de apoio e rótulo acessível "Cartão de leitor de <nome>" | teste de componente |
| CA2 | `IpeMark` é decorativo (fora da árvore de acessibilidade) | teste de componente |
| CA3 | Meu perfil usa o cartão; textos e métricas existentes continuam | testes existentes |
| CA4 | Editar perfil mostra a pré-visualização e ela muda ao digitar o nome | teste de componente |
| CA5 | Conferência no Galaxy A16 nos temas claro e escuro | captura via ADB |
