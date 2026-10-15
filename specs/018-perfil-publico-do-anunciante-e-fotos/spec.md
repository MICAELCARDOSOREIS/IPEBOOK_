# Especificação 018: Perfil Público do Anunciante e Fotos do Anúncio

## 1. Contexto e Problema

No detalhe de um anúncio, quem está interessado num livro não tem como ver quem é a pessoa que
está anunciando (histórico de negociações, avaliações recebidas) nem ver as fotos do livro em
tamanho maior antes de propor uma troca ou compra. Isso reduz a confiança numa negociação entre
vizinhos que não se conhecem.

Telas correspondentes no Figma (fluxo 03 · Livro e comunidade): `03.04 · Perfil de Ana Paula`
(perfil público do anunciante) e `03.06 · Fotos do anúncio` (galeria).

## 2. Escopo e Restrições

- **O que faz parte:**
  - Tela de perfil público do anunciante: nome, avaliação média, quantidade de negociações
    concluídas, data de entrada na comunidade — sem dados de contato direto (telefone/e-mail).
  - Acesso à tela de perfil público a partir do detalhe do anúncio (toque no nome/avatar de quem
    anuncia).
  - Galeria de fotos do anúncio em tela cheia, com navegação entre fotos, a partir do detalhe do
    anúncio.
- **O que NÃO faz parte:**
  - Edição do próprio perfil ou configurações de conta — isso é do fluxo 07 · Perfil e conta
    (issues #55/#56, responsabilidade da Maria Clara). Esta spec só cobre a visão **pública**
    (somente leitura) do perfil de outra pessoa.
  - Upload de fotos no anúncio — isso já é parte do fluxo de anunciar (spec 003); aqui só a
    visualização em galeria.
  - Chat ou contato direto a partir do perfil público — a negociação continua pelo fluxo de
    proposta/conversa (spec 004).

## 3. Critérios de Aceite

- [ ] A partir do detalhe de um anúncio, o usuário acessa o perfil público de quem anuncia.
- [ ] O perfil público mostra nome, avaliação média (com contagem de avaliações) e quantidade de
  negociações concluídas, sem expor dados de contato direto.
- [ ] Usuário sem avaliações ainda vê um estado claro ("Sem avaliações ainda"), não um erro.
- [ ] A partir do detalhe de um anúncio, o usuário abre a galeria de fotos em tela cheia e
  navega entre as fotos disponíveis.
- [ ] Anúncio sem foto (capa ilustrativa) não oferece a ação de abrir galeria.
- [ ] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
