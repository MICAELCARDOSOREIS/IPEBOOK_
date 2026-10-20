# 0025 — Portabilidade e exportação de dados do titular (LGPD)

Data: 2026-10-20. Status: aceito.

## Contexto

O Artigo 18, inciso V da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) estabelece o direito do titular à portabilidade de seus dados pessoais a outro fornecedor de serviço ou produto. No Ipebook, os dados do usuário abrangem perfil, anúncios publicados, pedidos enviados e recebidos, livros favoritados, alertas de busca configurados e denúncias registradas.

## Decisão

Implementar o caso de uso `UserDataExportUseCases` na camada de domínio (`src/usecase/UserDataExportUseCases.ts`), amparado pelo contrato de repositório `IUserDataExportDataSource` (`src/model/contracts/IUserDataExportDataSource.ts`).

O serviço agrega de forma atômica e segura todos os dados do usuário autenticado no formato JSON padronizado (`UserExportData`), incluindo:
- Perfil (`id`, `email`, `createdAt`).
- Lista de anúncios de livros criados pelo titular.
- Propostas enviadas e recebidas.
- Livros favoritados e alertas ativos.
- Denúncias submetidas.
- Metadados de conformidade: data/hora de exportação e versão de esquema da LGPD.

A consulta respeita estritamente o `auth.uid()` da sessão do usuário autenticado via RLS no `SupabaseUserDataExportDataSource` e possui adaptador em memória `MemoryUserDataExportDataSource` para testes automatizados.

## Alternativas consideradas

- **Exigir solicitação manual via e-mail de suporte**: rejeitada, pois contraria a autonomia e a conformidade automática exigida no aplicativo.
- **Exportação via dump cru de banco**: rejeitada por violar o isolamento entre camadas da arquitetura e expor detalhes internos de tabelas.

## Consequências

- Conformidade estrita com o Art. 18, V da LGPD.
- Facilidade de consumo tanto pela interface quanto por rotinas de download ou auditoria.

Vínculos: [Issue #128](https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/128), [ADR 0006](0006-conta-com-email-e-google.md).
