# Especificação 017: Rascunhos de Anúncio

## 1. Contexto e Problema

O fluxo de anunciar um livro (spec 003) tem várias etapas (identificar o livro, fotos,
condição, categoria, bairro, revisão). Se a pessoa for interrompida no meio — sem internet,
sem achar o ISBN, sem decidir o preço — hoje ela perde o progresso e precisa recomeçar do zero.
Isso é um risco real de abandono num fluxo já mais longo que o de login.

Telas correspondentes no Figma (fluxo 04 · Publicação): `04.11 · Rascunhos`,
`04.12 · Retomar rascunho`, `04.13 · Salvar para depois?`, `04.14 · Rascunho salvo`,
`04.15 · Descartar rascunho?`, `04.16 · Rascunhos · vazio`.

## 2. Escopo e Restrições

- **O que faz parte:**
  - Salvar o progresso do anúncio em qualquer etapa como rascunho (status `"draft"` no anúncio).
  - Tela "Rascunhos" listando os rascunhos do usuário, com estado vazio.
  - Retomar um rascunho de onde parou (reabrir o fluxo de anunciar com os dados preenchidos).
  - Descartar um rascunho, com confirmação.
- **O que NÃO faz parte:**
  - Salvar automaticamente a cada campo digitado (autosave) — o rascunho é salvo por ação
    explícita do usuário ("Salvar para depois").
  - Sincronizar rascunho entre dispositivos diferentes sem estar autenticado.
  - Qualquer campo novo de anúncio que não exista hoje na entidade `Book` — se o fluxo de
    etapas 2/3 do Figma (conservação, categoria, bairro) usar campos que a entidade `Book` não
    tem ainda, isso é uma lacuna de modelo de dados a registrar, não a resolver dentro desta spec.

## 3. Critérios de Aceite

- [ ] O usuário pode sair do fluxo de anunciar em qualquer etapa e escolher "Salvar para
  depois", confirmando que o progresso não será perdido.
- [ ] O rascunho salvo aparece na tela "Rascunhos", com o título (ou "Sem título" se ainda não
  preenchido) e a etapa em que parou.
- [ ] A tela "Rascunhos" mostra um estado vazio acessível quando não há rascunhos.
- [ ] Ao tocar em "Retomar rascunho", o fluxo de anunciar reabre na etapa salva com os campos já
  preenchidos.
- [ ] O usuário pode descartar um rascunho, com uma confirmação antes de excluir de fato.
- [ ] Um anúncio publicado a partir de um rascunho deixa de aparecer na lista de rascunhos.
- [ ] Usuário não autenticado não acessa rascunhos — redirecionado para login mantendo o
  contexto.
- [ ] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
