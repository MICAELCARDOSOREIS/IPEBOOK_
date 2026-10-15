# Especificação 019: Compartilhar Anúncio

## 1. Contexto e Problema

Hoje não há como uma pessoa divulgar um anúncio de livro fora do app — por exemplo, mandar o
link num grupo de WhatsApp do bairro. Isso limita o alcance do anúncio a quem já usa o app
IpêBook ativamente, reduzindo a chance de um livro ser vendido/trocado/doado.

Telas correspondentes no Figma (fluxo 08 · Compartilhar): `08.01 · Compartilhar livro`,
`08.02 · Link copiado`.

## 2. Escopo e Restrições

- **O que faz parte:**
  - Ação "Compartilhar" no detalhe do anúncio, abrindo o menu nativo de compartilhamento do
    sistema (Android) ou copiando o link (Web, onde não há menu nativo).
  - Confirmação visual ("Link copiado") quando a plataforma só permite copiar.
  - O link compartilhado abre direto no detalhe do anúncio correspondente dentro do app (deep
    link) — ou na versão Web do anúncio, se aberto fora do app.
- **O que NÃO faz parte:**
  - Compartilhamento dentro do próprio app (ex. "enviar pra um contato do IpêBook") — é só
    compartilhamento externo (sistema operacional / copiar link).
  - Métricas de quantas vezes um anúncio foi compartilhado.
  - Anúncio expirado/removido: o comportamento do link nesse caso é tratado como estado de erro
    genérico (ver spec 021 · Estados globais), não reimplementado aqui.

## 3. Critérios de Aceite

- [ ] No Android, "Compartilhar" abre o menu nativo de compartilhamento do sistema com o link
  do anúncio.
- [ ] Na Web, "Compartilhar" copia o link do anúncio para a área de transferência e mostra uma
  confirmação visual e acessível (não só uma mudança de cor).
- [ ] O link copiado/compartilhado, ao ser aberto, leva direto ao detalhe do anúncio
  correspondente.
- [ ] A ação de compartilhar está disponível tanto pra quem está autenticado quanto pra quem
  não está (compartilhar não exige login).
- [ ] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
