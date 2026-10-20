# 0026 — Sanitização preventiva contra injeção de texto e validação estrita de fotos

Data: 2026-10-20. Status: aceito.

## Contexto

Campos abertos de entrada de texto (como título de livro, autor, descrição de encontro comunitário, justificativa de denúncia e termo de busca) podem ser alvos de ataques de Cross-Site Scripting (XSS), injeção de tags HTML maliciosas e caracteres de controle invisíveis. Além disso, o upload de fotos de livros sem pré-validação expõe o sistema a arquivos corrompidos, extensões perigosas, nomes de arquivo contendo sequências de *path traversal* (ex.: `../../`) e uploads que excedem a cota de 5 MB do bucket de storage.

## Decisão

Adotar uma camada dupla de proteção antes da persistência:

1. **Sanitizador de Texto (`src/model/validators/textSanitizer.ts`)**:
   - Neutralização de tags HTML (`<script>`, `<iframe>`, tags maliciosas gerais).
   - Remoção de caracteres de controle e protocolos maliciosos (`javascript:`, `vbscript:`, `data:`).
   - Normalização de espaços em branco e aplicação de limites de tamanho por tipo de campo.

2. **Validador de Imagens (`src/infra/services/ImageOptimizationService.ts`)**:
   - Validação estrita de tamanho (máximo 5 MB por foto).
   - Validação de formato MIME (estritamente `image/jpeg`, `image/png` e `image/webp`).
   - Sanitização de caminhos de arquivo, impedindo qualquer tentativa de *path traversal*.

## Alternativas consideradas

- **Confiar apenas no escape do React Native / React**: rejeitada, pois os dados trafegam pela API Supabase, são exibidos na Web, exportados em JSON (LGPD) e consultados por diferentes plataformas, exigindo higienização na fonte.
- **Bibliotecas externas pesadas com dependências nativas (ex.: sharp, DOMPurify)**: rejeitadas para manter o bundle leve e 100% compatível com React Native sem complexidade de compilação C++.

## Consequências

- Proteção robusta contra XSS e injeção em todos os canais de entrada de texto.
- Garantia de que nenhuma imagem fora do padrão de 5 MB ou com formato inválido seja enviada ao Supabase Storage.

Vínculos: [Issue #129](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/129), [Issue #130](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/130), [ADR 0017](0017-armazenamento-e-modelo-de-fotos-supabase-storage.md).
