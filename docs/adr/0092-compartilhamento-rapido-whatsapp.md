# 0092. Compartilhamento Rápido no WhatsApp e Grupos de Piripiri

* Status: Aceito (roteamento mobile do item 2 substituído pelo [0110](0110-atualizacao-do-atalho-whatsapp-sem-folha-do-sistema.md))
* Data: 2026-11-03
* Contexto: UX / Viralidade / Comunidade / Piripiri / Mobile / Web
* Vinculado à especificação: [Spec 118](../../specs/118-compartilhamento-rapido-whatsapp/spec.md)

## Contexto e Problema

O WhatsApp é a principal ferramenta de comunicação comunitária e de circulação de informações em Piripiri (grupos de bairros, turmas universitárias do IFPI, Chrisfapi e UESPI, e WhatsApp Status).

Até então, o compartilhamento de anúncios no IpêBook apresentava limitações:
1. O botão secundário na tela de detalhes do livro utilizava um ícone genérico de compartilhamento e o menu padrão do sistema, sem um atalho direto e evidente para o WhatsApp.
2. Na Web, o compartilhamento apenas copiava o link para a área de transferência, sem abrir diretamente o WhatsApp Web (`api.whatsapp.com/send`).
3. A mensagem gerada era excessivamente simples e não aproveitava a formatação em negrito do WhatsApp, emojis de destaque nem a contextualização hiperlocal de Piripiri (bairro, pontos seguros de encontro e modalidade visual).
4. Na tela de publicação concluída com sucesso (`createListingSuccess.tsx`), o botão de compartilhamento usava um domínio desatualizado (`ipebook.com.br` em vez de `ipebook.app`) e não oferecia o disparo direcionado para grupos e status.

## Decisão de Arquitetura

1. **Mensagem Estruturada e Rica para WhatsApp (`ShareUseCases`):**
   - Criação da formatação `buildWhatsAppShareMessage(listing, url)` utilizando a sintaxe nativa do WhatsApp (`*negrito*`, quebras de linha e emojis contextuais).
   - Inclusão do título, autor, modalidade destacada (Venda com valor formatado, Troca, Doação gratuita ou Box de volumes), bairro de Piripiri quando informado e menção aos Pontos Seguros oficiais de Piripiri.
   - Link canônico para o anúncio (`https://ipebook.app/livro/:id`).

2. **Roteamento Inteligente por Plataforma (`useShareListingViewModel`):**
   - **Ambiente Mobile (Android / iOS):**
     - Quando o WhatsApp estiver instalado (`Linking.canOpenURL("whatsapp://send?text=...")`), abre diretamente o esquema de envio nativo.
     - Se houver captura do cartão de imagem (`ListingShareCard`), dispara o arquivo de imagem com a legenda formatada via folha do sistema, permitindo publicar direto no Status do WhatsApp ou encaminhar para conversas/grupos com a arte do livro.
     - Se o WhatsApp não estiver instalado, realiza fallback automático e transparente para o `Share.share` do sistema operacional sem travar o aplicativo.
   - **Ambiente Web / Desktop:**
     - Abre diretamente o WhatsApp Web (`https://api.whatsapp.com/send?text=...`) em nova janela/aba, permitindo envio imediato sem depender de cópia manual de link.

3. **Pontos de Acesso na Interface:**
   - **Detalhes do Livro (`bookDetail.tsx`):**
     - Botão dedicado de 1 toque no WhatsApp na barra inferior de ações móveis e no cartão de ações widescreen do desktop.
     - Ícone do WhatsApp adicionado ao `AppIcon` para consistência visual do design system.
   - **Publicação Concluída (`createListingSuccess.tsx`):**
     - Botão de destaque "Divulgar no WhatsApp" permitindo ao anunciante compartilhar imediatamente nos grupos de Piripiri logo após cadastrar o livro.
   - **Gerenciador de Anúncio (`manageListing.tsx`):**
     - Ação dedicada de compartilhamento com a nova mensagem formatada e canal do WhatsApp.

## Consequências

### Positivas
- Aumento imediato da visibilidade e circulação dos livros em Piripiri via grupos e status.
- Redução de fricção: com 1 toque o usuário já cai no WhatsApp com o texto e o link prontos.
- Paridade entre Web e Mobile: no computador abre o WhatsApp Web e no celular abre o aplicativo instalado.
- Preservação da privacidade: apenas dados públicos do anúncio e o bairro são divulgados.

### Negativas / Limitações
- Caso o usuário na Web use bloqueadores de pop-up agressivos que impeçam `window.open`, o sistema mantém o fallback com cópia da mensagem para a área de transferência e toast explicativo.
