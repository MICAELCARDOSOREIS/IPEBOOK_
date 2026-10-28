# Especificação 097 — Sinopse e dados da edição pelo ISBN

Status: implementada e testada localmente; a migração ainda precisa ser aplicada em cada ambiente. ADR: [0073](../../docs/adr/0073-brasilapi-como-fonte-de-isbn.md).

## Objetivo
Ao ler ou digitar o ISBN, trazer também a editora, o ano, o número de páginas e a sinopse, e mostrá-los no anúncio e na contracapa do livro 3D. Incluir a base brasileira de ISBN, que acha edições nacionais que a Open Library não tem.

## Escopo
- Terceira fonte de ISBN (`BrasilApiBookMetadataService`), somada às duas existentes; as fontes que falham são ignoradas.
- Novas colunas opcionais em `v2_books` e novos campos em `Book`: `synopsis`, `publisher`, `pageCount`, `publicationYear`.
- Cadastro, rascunho (local e no servidor) e detalhe do anúncio; contracapa do livro 3D com a sinopse e a editora.
- Fora do escopo: editar a sinopse à mão, buscar a edição de anúncios antigos, capa da BrasilAPI (ela não traz).

## Regras de negócio
- **RN-01** A sinopse e a editora vêm só do ISBN e passam pela mesma limpeza de texto dos demais campos (sem HTML nem controle).
- **RN-02** A sinopse tem no máximo 2000 caracteres (cortada no fim de uma palavra, com reticências), a editora 120, as páginas de 1 a 20000 e o ano de 1000 a 2100; valor inválido é descartado sem recusar o anúncio.
- **RN-03** Da lista de autores da BrasilAPI só o primeiro nome é usado (a lista inclui tradutores).
- **RN-04** Cada campo da edição vem da primeira fonte que o tiver; a capa continua preferindo a de maior resolução.
- **RN-05** Uma nova busca por outro ISBN substitui a edição anterior; sem dados, o anúncio vai sem sinopse.
- **RN-06** Anúncios antigos e anúncios cadastrados à mão não têm esses campos e continuam como estavam.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | A BrasilAPI devolve título, 1º autor, editora, páginas, ano e sinopse limpa; ISBN inválido não chama a rede | teste unitário do serviço |
| CA2 | A fonte composta junta a capa de uma fonte com a edição de outra e ignora fonte fora do ar | teste unitário |
| CA3 | Limpeza, limites e corte da sinopse | teste unitário de `normalizeEdition` |
| CA4 | O ISBN preenche a edição no cadastro e ela chega ao anúncio; nova busca a troca | teste do ViewModel |
| CA5 | O banco aceita as colunas, rejeita valores fora do limite e outra pessoa não as altera | cenário SQL (PGlite) |
| CA6 | O detalhe mostra Editora, Páginas, Ano e Sinopse só quando existem | teste de componente |
| CA7 | A contracapa do 3D mostra a sinopse (ou a descrição) e a editora | teste de componente |
| CA8 | O CSP do site libera `brasilapi.com.br` | verificador de build |

## Suposições
- A BrasilAPI é gratuita e sem garantia de disponibilidade; por isso é só mais uma fonte.
- O autor ainda pode vir "desconhecido" quando nenhuma fonte o tiver (o caso do Wotakoi); a pessoa pode corrigir à mão.
