# Spec 037 — Pontos de encontro comunitários com direções no mapa (Figma fluxo 06)

**Responsável:** Maria Clara (`pessoa:maria-clara`)
**Data:** 21 de outubro de 2026
**Issue:** #142
**Telas no Figma:** `06.05 · Ponto de encontro`, `06.06 · Local no mapa`.

## Problema

Em `/negociacao/[id]` (tela "Acompanhar encontro"), o cartão "Encontro seguro em Piripiri" lista
apenas o nome de cada ponto seguro (`safeMeetingPoints: readonly string[]`), sem endereço, horário
recomendado nem forma de chegar até lá. A pessoa usuária precisa buscar o endereço por conta
própria em outro aplicativo.

## Escopo

- Enriquecer cada ponto seguro com endereço e horário recomendado, substituindo a lista de nomes
  por uma lista estruturada (`MeetingPoint`).
- Exibir, para cada ponto, um cartão com nome, endereço e horário recomendado.
- Botão acessível "Como chegar" em cada cartão, abrindo o app de mapas padrão do sistema
  (`Linking.openURL` com URL universal do Google Maps) com o endereço do ponto.
- Fallback visível quando o dispositivo não conseguir abrir o app de mapas (`Linking.canOpenURL`
  falha ou rejeita): mensagem de erro inline, sem travar a tela.
- Fica fora do escopo: foto/ilustração de cada ponto (Figma `06.06`) e seleção de ponto preferido
  pela pessoa usuária — tratados em entrega futura por não serem bloqueantes para a navegação até
  o local.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Dados do ponto):** cada ponto seguro retornado por `getRequestDetail` tem nome,
  endereço completo e horário recomendado.
- **RN-02 (Abertura do mapa):** ao tocar em "Como chegar", o app tenta abrir a URL universal de
  busca do Google Maps (`https://www.google.com/maps/search/?api=1&query=<endereço>`), que o
  sistema operacional resolve para o app de mapas instalado (Google Maps, Apple Maps ou outro).
- **RN-03 (Fallback seguro):** se a abertura falhar (rejeição da Promise ou indisponibilidade),
  a tela exibe mensagem de erro acessível sem interromper a navegação nem lançar exceção não
  tratada.
- **RN-04 (Acessibilidade):** o botão "Como chegar" tem `accessibilityRole="button"` e
  `accessibilityLabel` descritivo, incluindo o nome do ponto (ex.: "Como chegar à Praça da
  Bandeira").

## Critérios de Aceite

1. Cada ponto seguro exibido mostra nome, endereço e horário recomendado.
2. Tocar em "Como chegar" aciona `Linking.openURL` com a URL de busca do Google Maps contendo o
   endereço do ponto.
3. Quando a abertura do mapa falha, a tela mostra mensagem de erro acessível referente àquele
   ponto, sem quebrar a renderização dos demais pontos.
4. Cada botão "Como chegar" tem rótulo de acessibilidade que identifica o ponto correspondente.
5. `npm run validate` passa.

## Validação

- Teste unitário do caso de uso cobrindo a nova estrutura de `safeMeetingPoints`.
- Teste de componente cobrindo o toque em "Como chegar" (sucesso e falha/fallback).
- `npm run validate`.
