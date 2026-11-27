# 0110. Atalho do WhatsApp abre o aplicativo, sem a folha de compartilhamento do sistema

- **Status:** Aceito
- **Data:** 2026-11-13
- **Contexto:** UX / Compartilhamento / Android e iOS / Spec 118
- **Decisores:** Equipe IpêBook
- **Substitui em parte:** [0092 — Compartilhamento Rápido no WhatsApp e Grupos de Piripiri](0092-compartilhamento-rapido-whatsapp.md)

## Contexto

O detalhe do livro (`src/view/listings/bookDetail.tsx`) oferece dois botões vizinhos na barra superior do Hero:
um com o ícone do WhatsApp e outro com o ícone genérico de compartilhamento. Os dois deveriam levar a
resultados diferentes: o primeiro, à conversa no WhatsApp; o segundo, ao menu do sistema com a arte do anúncio.

O ADR 0092 decidiu que, havendo captura do cartão do livro (`ListingShareCard`), o atalho do WhatsApp enviaria a
imagem com a legenda formatada pela folha do sistema. Como `ACTION_SEND` sem pacote definido sempre abre o
seletor de aplicativos, os dois botões acabavam exibindo exatamente a mesma folha — o botão do WhatsApp nunca
chegava a abrir o WhatsApp. O atalho de 1 toque deixava de existir na prática.

Somam-se duas restrições técnicas verificadas:

1. O `expo-intent-launcher` só consegue direcionar a intenção a um aplicativo específico quando recebe
   `packageName` **com** `className` (monta um `ComponentName`); não há `Intent.setPackage`. Depender do nome
   interno da activity de compartilhamento do WhatsApp (`com.whatsapp/.contact.ui.picker.ExternalShareAlias`
   nesta versão) seria frágil entre versões do aplicativo.
2. O esquema `whatsapp://send?text=...` foi confirmado no aparelho de teste (Galaxy A16): resolve para
   `com.whatsapp/.TextAndDirectChatDeepLink` e abre o WhatsApp com a mensagem pronta.

O link canônico do anúncio já gera a prévia rica com capa e dados do livro dentro do WhatsApp pelas tags Open
Graph servidas por `functions/livro/[id].ts` (Spec 119), o que cobre a necessidade de mostrar a arte do livro.

## Decisão

1. **Mobile:** o atalho do WhatsApp abre apenas `whatsapp://send?text=...` com a mensagem formatada por
   `buildWhatsAppShareMessage` (título, autor, modalidade, bairro de Piripiri e link canônico). Sem captura de
   imagem e sem folha do sistema. `Share.share` permanece somente como último recurso, quando nenhum aplicativo
   abre o esquema (WhatsApp ausente).
2. **Botão de compartilhar:** mantém o comportamento da Spec 092 — captura o cartão do anúncio e abre a folha do
   sistema com imagem e legenda. É o único caminho que exibe o seletor de aplicativos.
3. **Contrato do ViewModel:** `shareToWhatsApp(bookId, listing)` deixa de receber o `capture`, deixando explícito
   que o atalho não compartilha arquivo. Na Web o comportamento não muda: Web Share API, depois WhatsApp Web e,
   por fim, cópia da mensagem.

## Consequências

### Positivas

- Os dois botões passam a ter efeitos distintos e previsíveis; o atalho cumpre o critério CA3 da Spec 118.
- Nenhuma dependência de nomes internos do WhatsApp nem de novas bibliotecas.
- A arte do anúncio continua disponível no botão de compartilhar e, no WhatsApp, como prévia Open Graph.

### Negativas e mitigações

- Publicar a arte direto no WhatsApp Status exige o botão de compartilhar (dois toques em vez de um). A prévia
  Open Graph reduz a perda visual dessa decisão.
- Em aparelhos sem WhatsApp instalado, o atalho cai no menu do sistema — única alternativa disponível e já
  coberta por teste.
