# Spec 058 — Busca e preenchimento automático por ISBN (Figma 04.01)

## Contexto e Objetivo

No fluxo de publicação de anúncios (`/anunciar`), a etapa 1 apresenta o card explicativo `Ler ISBN com a câmera / Preenche título e autor automaticamente` (Figma `04.01`). O preenchimento manual de título e autor representa o principal ponto de atrito para novos leitores que desejam desapegar ou trocar livros em Piripiri.

Esta especificação implementa a busca e o preenchimento automático de metadados a partir do código ISBN-10 ou ISBN-13 do exemplar:
1. Validação e limpeza de strings de ISBN (remove hífens e espaços; aceita formatos de 10 ou 13 dígitos).
2. Consulta de metadados em base aberta e pública (Open Library API).
3. Preenchimento automático de título e autor no formulário de anúncio.
4. Interface acessível na etapa 1 para inserção de ISBN, com feedback de carregamento, sucesso ou orientação amigável caso o exemplar não seja encontrado.
5. Tolerância total a falhas de rede: o fluxo manual nunca é bloqueado.

## Requisitos Funcionais

- **RF-01**: A aplicação deve validar e normalizar ISBNs de 10 dígitos (com dígito verificador numérico ou 'X') e 13 dígitos (prefixos 978 ou 979).
- **RF-02**: Ao acionar a busca por ISBN válido, o sistema consulta os metadados do livro e preenche automaticamente o campo de `Título` e `Autor`.
- **RF-03**: Se o serviço retornar uma URL de capa pública válida, o campo de foto é sugerido como ponto de partida (substituível na etapa 2).
- **RF-04**: Caso o ISBN não seja encontrado, o sistema exibe mensagem amigável: `"Livro não encontrado na base pública. Você pode digitar o título e autor manualmente."` sem bloquear o formulário.
- **RF-05**: Caso o dispositivo esteja offline ou ocorra falha de rede na API, o erro não quebra a interface nem interrompe a criação do anúncio.
- **RF-06**: O card de ISBN na etapa 1 torna-se interativo, permitindo acionar a busca por diálogo ou campo dedicado.

## Critérios de Aceite

- **CA-01**: Contrato `IBookMetadataService` e entidade `BookMetadata` criados na camada de domínio/casos de uso.
- **CA-02**: Implementação `OpenLibraryBookMetadataService` em `infra/services/` e `MemoryBookMetadataService` para testes e modo memória.
- **CA-03**: Injeção de `bookMetadataService` no container de DI (`src/di/container.ts`).
- **CA-04**: Integração no `useCreateListingViewModel` com métodos de busca e estado de busca (`lookingUpIsbn`, `isbnFeedback`).
- **CA-05**: Card interativo em `CreateListingStep1.tsx` com campo para busca de ISBN e preenchimento de campos.
- **CA-06**: Testes unitários do serviço, teste de hook do ViewModel e teste de componente da tela aprovados com 100% de sucesso.
