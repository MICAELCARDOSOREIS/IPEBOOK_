# Spec 074 — Detalhe do livro no padrão Figma `03 · Livro e comunidade` com Material 3

**Data:** 26 de outubro de 2026
**Telas no Figma:** `03.01 · O Pequeno Príncipe — venda`, `03.02 · Dom Casmurro — troca`, `03.03 · A hora da estrela — doação`.
**Tela afetada:** `src/view/listings/bookDetail.tsx` (rota `/livro/[id]`).

## Problema

O detalhe do livro usa barra superior "Detalhes", capa em cartão neutro, linha de metadados em texto
corrido, botão verde do WhatsApp fora do padrão Material 3 e uma ação única "Solicitar negociação"
igual para as três modalidades. O Figma mostra uma tela mais rica e com a cor da modalidade.

## Escopo

1. **Capa em destaque (hero) de borda a borda**, com fundo na cor de contêiner da modalidade
   (`badge.sale|trade|donation.background`, que já tem versão no tema escuro), indo até a barra de status.
2. **Botões de ícone tonais circulares** sobre a capa: Voltar à esquerda; Compartilhar e Favoritar à direita
   (48 dp de área de toque). Pontos de paginação quando há mais de uma foto.
3. **Título em serifa da marca, autor, valor e etiqueta da modalidade** (`R$ 25,00 · Venda`,
   `Por outro livro · Troca`, `Gratuito · Doação`).
4. **Cartão da modalidade**: troca mostra "Aceita em troca" com a orientação de troca; doação mostra
   "Doação para quem vai ler". Venda não tem cartão.
5. **Lista de detalhes** em cartão `surface-container-low` com ícone, rótulo e valor: Conservação,
   Categoria e Retirada (bairro).
6. **Linha do anunciante** com avatar, nome, "★ nota · n trocas" e seta.
7. **Barra inferior fixa com duas ações**: "Compartilhar" (botão tonal, compartilha no WhatsApp) e a ação
   principal por modalidade — "Tenho interesse" (venda), "Propor troca" (troca), "Quero receber"
   (doação) — que solicita a negociação como antes.

## Fora do escopo / desvios registrados

- O Figma mostra "Conversar" como ação secundária. O chat só existe dentro de uma negociação
  (Spec 061), então não há conversa antes do pedido; a secundária vira "Compartilhar" (WhatsApp),
  que já existia na tela. O pedido de negociação é a forma de abrir a conversa.
- O campo "aceita em troca" com gêneros desejados não existe no modelo `Book`; o cartão de troca usa
  texto de orientação, sem dados inventados.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Ação principal muda por modalidade e solicita negociação | teste de componente |
| CA2 | Sem sessão ou no próprio anúncio não há ação principal; compartilhar continua disponível | teste de componente |
| CA3 | Valor/etiqueta por modalidade; "R$" só em venda | teste de componente |
| CA4 | Cartão "Aceita em troca" só em troca; "Doação para quem vai ler" só em doação | teste de componente |
| CA5 | Lista mostra Conservação, Categoria e Retirada | teste de componente |
| CA6 | Voltar, favoritar, compartilhar, galeria, denúncia e perfil do anunciante seguem funcionando | testes existentes |
| CA7 | Aparência conferida no Android (Galaxy A16) nas três modalidades, temas claro e escuro | captura via ADB |
