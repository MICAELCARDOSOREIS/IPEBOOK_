# Especificação 118 — Compartilhamento Rápido no WhatsApp e Grupos de Piripiri

**Status:** Concluída  
**Data:** 3 de novembro de 2026  
**Contexto:** UX / Viralidade / Comunidade de Piripiri / Mobile / Web  
**ADR vinculada:** [0092](../../docs/adr/0092-compartilhamento-rapido-whatsapp.md) — roteamento mobile revisado pelo [0110](../../docs/adr/0110-atualizacao-do-atalho-whatsapp-sem-folha-do-sistema.md)

## 1. Problema e Motivação

Em Piripiri, a circulação orgânica de livros depende fortemente da dinâmica comunitária do WhatsApp (WhatsApp Status, grupos de bairros e grupos de estudantes da Chrisfapi, IFPI e UESPI).

As opções anteriores de compartilhamento sofriam de:
1. **Ausência de atalho de 1 toque para o WhatsApp** no detalhe do livro, forçando o leitor a passar pelo menu nativo genérico do sistema.
2. **Mensagem sem formatação nem contextualização:** não aproveitava a tipografia do WhatsApp (`*negrito*`, emojis e indicação clara de Piripiri e do bairro).
3. **Comportamento limitado na Web:** apenas copiava o link para a área de transferência, em vez de abrir diretamente a conversa/grupo no WhatsApp Web (`api.whatsapp.com/send`).
4. **Desconexão pós-publicação:** a tela de sucesso do anúncio (`createListingSuccess.tsx`) usava link desatualizado e não oferecia o disparo direto com 1 toque no WhatsApp.

## 2. Escopo

1. **Formatação de Mensagem Rica (`ShareUseCases`):**
   - Criação do método `buildWhatsAppShareMessage(listing, url)`.
   - Inclusão formatada de: título do livro, autor, modalidade (`💰 Venda: R$ XX,XX`, `🔄 Aceita troca`, `🎁 Doação gratuita`, `📦 Box de X volumes`), indicação de Piripiri e bairro (quando informado), orientação de ponto seguro e link canônico `https://ipebook.app/livro/{id}`.
   - Enriquecimento de `buildWhatsAppShareUrl(message, web?: boolean)`.

2. **Roteamento Inteligente por Plataforma (`useShareListingViewModel`):**
   - No **Mobile (Android/iOS)**:
     - Abre o esquema nativo `whatsapp://send?text=...` com a mensagem formatada, sem passar pela folha do sistema.
     - A imagem do card do livro com legenda formatada continua no botão genérico de compartilhar (`shareImageFile`), que é o único caminho que abre o seletor de aplicativos (ADR 0110).
     - Fallback automático para `Share.share` caso o WhatsApp não esteja instalado.
   - Na **Web/Desktop**:
     - Abertura direta do WhatsApp Web (`https://api.whatsapp.com/send?text=...`) em nova janela/aba.
     - Fallback para área de transferência e aviso toast caso haja bloqueio de pop-up.

3. **Interface e Pontos de Acesso:**
   - **`src/view/components/AppIcon.tsx`:** inclusão do ícone `whatsapp`.
   - **`src/view/listings/bookDetail.tsx`:**
     - Atalho de 1 toque no WhatsApp na barra superior do Hero (evitando duplicar botões de compartilhamento na barra inferior de ação principal).
   - **`src/view/listings/createListingSuccess.tsx`:**
     - Botão em destaque "Divulgar no WhatsApp" logo após publicar o livro.
   - **`src/view/listings/manageListing.tsx`:**
     - Ação dedicada de compartilhamento no WhatsApp para o dono do livro.

## 3. Critérios de Aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | A mensagem do WhatsApp contém título, autor, modalidade formatada, menção a Piripiri e link canônico. | Testes unitários em `shareUseCases.test.ts` |
| CA2 | Na Web, `shareToWhatsApp` abre a URL da API do WhatsApp (`api.whatsapp.com/send`) ou aciona a Web Share API/cópia com aviso. | Testes em `useShareListingViewModel.test.tsx` |
| CA3 | No Mobile, `shareToWhatsApp` abre `whatsapp://send?text=...` quando o WhatsApp está disponível, ou faz fallback transparente para `Share.share`. | Testes em `useShareListingViewModel.test.tsx` |
| CA4 | `BookDetail` exibe ação dedicada de 1 toque para o WhatsApp no mobile e no desktop. | Teste de componente `bookDetailView.test.tsx` |
| CA5 | `CreateListingSuccess` permite divulgar o livro recém-criado no WhatsApp com 1 toque. | Teste de componente `createListingSuccessView.test.tsx` |
| CA6 | 100% dos testes da suíte e checagem de tipos/arquitetura passam sem regressão. | `npm test` e `npm run check:architecture` |
