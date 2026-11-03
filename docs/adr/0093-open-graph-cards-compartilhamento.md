# 0093. Open Graph Dinâmico para Compartilhamento de Livros no WhatsApp

- **Status:** Aceito
- **Data:** 2026-11-03
- **Contexto:** UX / Viralidade / Web / Cloudflare Pages / WhatsApp / Redes Sociais
- **Decisores:** Equipe IpêBook
- **Especificação vinculada:** [Spec 119](../../specs/119-open-graph-cards-compartilhamento/spec.md)

## Contexto

Com a entrega da Spec 118 (Compartilhamento Rápido no WhatsApp), os leitores de Piripiri podem disparar com 1 toque mensagens formatadas contendo o link `https://ipebook.app/livro/{id}` para grupos locais e WhatsApp Status.

No entanto, quando os crawlers do WhatsApp (`WhatsApp/2.x`, `facebookexternalhit`), Telegram, Twitter/X ou Discord requisitam essa URL para gerar a pré-visualização (card com foto, título e descrição), encontram um SPA estático compilado pelo Expo Router que não possuía tags `og:title`, `og:description`, `og:image` ou `og:url` específicas do livro no HTML inicial.

Como esses crawlers não executam JavaScript complexo de SPA para buscar dados do Supabase via client-side, o link era renderizado no WhatsApp sem o card visual ou com metadados genéricos do aplicativo.

## Decisão

Adotamos uma abordagem híbrida de alta performance e resiliência:

1. **Cloudflare Pages Function (`functions/livro/[id].ts`):**
   - Intercepta requisições para `/livro/:id` no Edge (rede global da Cloudflare).
   - Identifica requisições de crawlers sociais (WhatsApp, Facebook, Twitter, Telegram, Discord, Googlebot, etc.) ou acessos diretos.
   - Consulta os dados públicos do livro (`title`, `author`, `trade_type`, `price`, `photo_url`, `bairro`, `is_box`, `box_volumes_count`) na API REST pública do Supabase via `fetch` HTTP direto com a chave anon.
   - Injeta dinamicamente no `<head>` do HTML estático base (`dist/livro/[id].html`) as tags Open Graph (`og:*`), Twitter Cards (`twitter:*`) e `<title>` canônico.
   - Se o livro não for encontrado ou houver falha de rede, faz fallback elegante para o HTML base com os metadados canônicos do IpêBook.

2. **Tags Canônicas Fallback no Build Web (`scripts/preparar-dist-web.mjs`):**
   - Injeta metadados Open Graph padrão em `dist/index.html` e `dist/livro/[id].html` durante a compilação web, garantindo que mesmo sem a função de borda, o link nunca fique sem preview visual (utilizando o ícone de alta resolução `/icone-512.png` como imagem fallback).

3. **Atualização Reativa no DOM do Navegador (`src/view/webMeta.ts`):**
   - Módulo auxiliar client-side que atualiza `document.title` e as tags `meta[property^="og:"]` no navegador quando o usuário navega pelo SPA, assegurando consistência total para abas do navegador e leitores de tela.

## Consequências

### Positivas
- Links de livros enviados no WhatsApp exibem a capa real do livro, o título, o autor e a modalidade (ex.: "Venda: R$ 25,00 · Centro, Piripiri") no card de pré-visualização.
- Zero impacto no tempo de carregamento para usuários normais da web.
- Não requer servidores dedicados ou SSR completo do Expo Router, aproveitando a infraestrutura gratuita do Cloudflare Pages Functions.
- Totalmente compatível com a política de segurança CSP (`public/_headers`) e arquitetura MVVM do projeto.

### Negativas / Mitigações
- Exige que o endpoint do Supabase esteja acessível no Edge (o que já é o caso com o Supabase gerenciado). Em caso de indisponibilidade, o fallback serve os metadados padrão do IpêBook sem quebrar a rota.
