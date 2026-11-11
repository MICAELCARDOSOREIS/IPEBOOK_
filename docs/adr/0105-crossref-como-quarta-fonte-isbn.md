# 0105 — Crossref como quarta fonte pública e gratuita de metadados de ISBN

Data: 2026-11-10. Status: aceito. Especificação: [097](../../specs/097-sinopse-e-edicao-pelo-isbn/spec.md). Complementa a Spec 092 (fontes compostas de ISBN) e o [ADR 0073](0073-brasilapi-como-fonte-de-isbn.md).

## Contexto
O IpêBook atende leitores e estudantes em Piripiri (PI), com polos universitários e técnicos (como IFPI e UESPI). Enquanto títulos comerciais e de grandes editoras são amplamente cobertos pela BrasilAPI (CBL/Mercado Editorial) e pelo Google Books, livros didáticos, acadêmicos, universitários e publicações científicas com frequência não possuem registros completos nessas bases ou carecem de sinopse e dados da edição.

## Decisão
- Adicionar o `CrossrefBookMetadataService` como quarta fonte pública do `CompositeBookMetadataService`.
- A API pública da Crossref (`https://api.crossref.org/works?filter=isbn:{isbn}&rows=1`) é 100% gratuita, sem necessidade de autenticação ou chave de API privada, possuindo alta disponibilidade e ampla cobertura de publicações acadêmicas e editoras universitárias.
- A composição paralela de metadados prioriza a BrasilAPI para títulos nacionais em português e a Google Books para capas de alta resolução, utilizando a Crossref para preencher autor, editora, ano de publicação e resumo/sinopse quando ausentes nas demais fontes.
- Atualizar a política de segurança (`connect-src` em `public/_headers`) e a verificação de build (`scripts/verificar-config-build.mjs`) para liberar `https://api.crossref.org`.

## Alternativas consideradas
- **Manter apenas as três fontes atuais**: Deixaria livros acadêmicos e técnicos sem autocompletar de metadados.
- **Bases comerciais (como ISBNdb)**: Exigem assinatura mensal paga em dólares e chaves privadas, violando a diretriz de soluções públicas e gratuitas.
- **Inventaire.io / Wikidata**: O endpoint direto de ISBN do Inventaire é voltado apenas a parsing sintático e o SPARQL do Wikidata introduz latência elevada e estrutura complexa para o cliente mobile.

## Consequências
- Aumento da taxa de sucesso no escaneamento de livros didáticos e acadêmicos.
- Totalmente resiliente: uma eventual indisponibilidade da Crossref é ignorada silenciosamente pelo `CompositeBookMetadataService` sem bloquear as outras fontes.
- Custo zero de infraestrutura e sem credenciais confidenciais.
