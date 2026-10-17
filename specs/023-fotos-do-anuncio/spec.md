# Especificação 023 — Fotos do Anúncio (Modelo, Armazenamento e Exibição)

## 1. Visão Geral e Objetivo

Em um marketplace comunitário de livros usados e físicos (venda, troca e doação), a foto real é o principal elemento gerador de confiança. Ela permite verificar a edição, o estado de conservação da capa, marcas de uso e integridade do exemplar.

Esta especificação define o suporte a fotos na entidade `Book`, o upload e armazenamento no Supabase Storage (`book-photos`), a exibição fluida com fallback ilustrativo e o ciclo de vida de remoção (LGPD). Destrava diretamente a Spec 018 (Galeria de Fotos do Anunciante).

---

## 2. Escopo

### O que faz parte (In-Scope)
- **Extensão da Entidade `Book`:** Campos `photoUrl?: string;` (capa principal) e `photos?: readonly string[];` (galeria de até 5 fotos).
- **Validação de Domínio (`BookValidator`):**
  - Formatos aceitos: JPEG, PNG e WEBP.
  - Limite máximo por imagem: 5MB.
  - Limite de até 5 fotos por anúncio.
  - Validação de URLs seguras (HTTPS ou esquemas de desenvolvimento).
- **Armazenamento e Políticas (Supabase Storage):**
  - Bucket público `book-photos` para leitura.
  - Upload restrito a usuários autenticados sob o caminho `${owner_id}/${book_id}/${filename}`.
  - Exclusão permitida apenas ao proprietário do livro.
- **Interface e Experiência Visual:**
  - Componente `AddPhotoCard` integrado no fluxo de anúncio para captura/seleção de imagem.
  - Componente `BookCover` estendido para renderizar a imagem real (`Image`) com indicador acessível, mantendo o fallback determinístico caso nenhuma foto seja informada.
  - Exibição da foto na Home (`src/view/home.tsx`) e no Detalhe do Livro (`src/view/listings/bookDetail.tsx`).
- **Ciclo de Vida e LGPD:**
  - Remoção de fotos vinculadas quando o anúncio é cancelado/removido (Spec 013) ou quando a conta é excluída (Spec 014).

### O que está fora de escopo (Out-of-Scope)
- Editor avançado de imagem (corte/filtros fotográficos).
- Reconhecimento automático de capa por OCR ou IA.

---

## 3. Critérios de Aceite (Gherkin)

### Cenário 1: Publicação de anúncio com foto da capa
- **Dado** que um usuário autenticado cadastra um livro informando a foto da capa,
- **Quando** o anúncio é criado com sucesso,
- **Então** `photoUrl` é persistido e associado ao livro, e o catálogo exibe a imagem real.

### Cenário 2: Exibição resiliente com fallback (Graceful Degradation)
- **Dado** um livro cadastrado sem foto de capa,
- **Quando** o anúncio é renderizado na Home ou no Detalhe,
- **Então** o componente `BookCover` renderiza a capa temática ilustrativa com as cores determinísticas do design system.

### Cenário 3: Validação de limite e formato de fotos
- **Dado** uma tentativa de enviar foto com formato não suportado ou mais de 5 fotos,
- **Quando** o caso de uso valida a requisição,
- **Então** o sistema rejeita com `ValidationError` explicativo.

---

## 4. Conformidade e Segurança (UGC & Moderação)

Conteúdo gerado por usuário (fotos de livros) está sujeito às diretrizes comunitárias de Piripiri e moderação da Spec 011 (`v2_reports`). Usuários podem denunciar fotos impróprias sob o motivo `inappropriate_content` ou `fraud_or_scam`.
