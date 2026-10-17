# 0017 — Armazenamento e modelo de fotos de anúncios no Supabase Storage

Data: 2026-10-17. Status: aceito.

## Contexto

A [spec 023](../../specs/023-fotos-do-anuncio/spec.md) e a [issue #82](https://github.com/Ghostyxseven/IPEBOOK_/issues/82) exigem suporte a fotos reais nos anúncios do Ipebook para aumentar a confiança comunitária e detalhar o estado de conservação do livro. É necessário definir onde e como os arquivos de imagem são armazenados, quais formatos e limites são tolerados, e como o ciclo de vida se alinha à LGPD.

## Decisão

Adotar o **Supabase Storage** com bucket público de leitura (`book-photos`) associado a colunas `photo_url` (imagem principal da capa) e `photos` (galeria opcional de até 5 imagens) na tabela `public.v2_books`.

1. **Formatos e Limites:**
   - Tipos MIME: `image/jpeg`, `image/png`, `image/webp`.
   - Limite por foto: 5MB.
   - Limite por anúncio: máximo de 5 fotos.
2. **Políticas de Acesso (RLS de Storage):**
   - Leitura pública (`anon`, `authenticated`).
   - Escrita (`INSERT`): apenas contas autenticadas para o prefixo do próprio usuário (`storage.foldername(name)[1] = auth.uid()::text`).
   - Exclusão (`DELETE`): apenas o proprietário da imagem.
3. **Ciclo de Vida e LGPD:**
   - Ao remover um anúncio próprio (Spec 013), as referências são expurgadas da tabela `v2_books`.
   - Ao excluir a conta (Spec 014), todas as fotos associadas aos anúncios do usuário são elegíveis para expurgo do bucket de storage.
4. **Fallback Visual e Resiliência:**
   - O componente `BookCover` do design system mantém o design determinístico de capa ilustrativa caso o livro não possua foto ou a imagem falhe ao carregar.

## Alternativas consideradas

- **Armazenamento de Base64 diretamente no banco relacional:** Rejeitado por ineficiência de armazenamento e bloqueio de cache de CDN.
- **Serviço externo separado (ex: AWS S3 ou Cloudinary):** Rejeitado nesta fase para evitar novas credenciais, custos adicionais e complexidade operacional fora do projeto Supabase já vinculado.

## Consequências

- O aplicativo passa a exibir fotos reais de livros, destravando a Spec 018 (Galeria de Fotos do Anunciante).
- O tráfego e o armazenamento no Supabase Storage devem ser monitorados para não exceder a cota do plano gratuito na fase beta.

Vínculos: [spec 023](../../specs/023-fotos-do-anuncio/spec.md), [ADR 0012](0012-supabase-com-rls.md).
