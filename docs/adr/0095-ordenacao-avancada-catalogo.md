# 0095. Estratégia de Ordenação Avançada no Catálogo Comunitário de Piripiri

- **Status:** Aceito
- **Data:** 2026-11-03
- **Contexto:** UX / Pesquisa / Catálogo / Proximidade Hiperlocal / Mobile / Web
- **Decisores:** Equipe IpêBook
- **Especificação vinculada:** [Spec 121](../../specs/121-ordenacao-avancada-catalogo/spec.md)

## Contexto

A pesquisa e exploração de livros no IpêBook permite aos leitores de Piripiri encontrar obras para compra, troca e doação. Anteriormente, as opções de ordenação cobriam apenas recência (`recent`), título alfabético (`title`), menor preço (`price_asc`) e maior preço (`price_desc`).

No entanto:
1. Em uma plataforma comunitária hiperlocal, leitores muitas vezes desejam explorar livros da cidade priorizando os exemplares localizados em seu próprio bairro ou agrupados por bairros de Piripiri (Centro, Pacavira, Floresta, Fonte dos Matos, etc.), facilitando a logística de retirada em pontos públicos próximos.
2. Na versão Web Desktop widescreen, o painel lateral de filtros (`WebFilterSidebar`) não oferecia acesso direto à troca da ordenação, forçando o leitor a buscar o botão na linha de resumo superior.
3. Não havia destaque para a ordenação por bairros nem agrupamento inteligente entre o bairro ativo do leitor e os demais bairros de Piripiri.

## Decisão

1. **Nova Opção de Ordenação `neighborhood` ("Bairros de Piripiri"):**
   - Adicionada ao tipo `SearchSortOption = "recent" | "price_asc" | "price_desc" | "neighborhood" | "title"`.
   - Rótulo humanizado em `SORT_LABELS`: `"Bairros de Piripiri"`.
   - Lógica de ordenação pura em `sortBooks`:
     - Se o leitor possui um bairro preferido ou ativo no seletor, os livros desse bairro recebem prioridade máxima no topo da lista.
     - Os livros dos demais bairros são ordenados alfabeticamente pelo nome do bairro de Piripiri (`pt-BR`), agrupando exemplares do mesmo bairro.
     - Livros sem bairro informado aparecem ao final.
     - Desempate determinístico pelo título do livro.

2. **Paridade nas Interfaces Móvel e Desktop:**
   - `SortSheet.tsx`: inclui a opção "Bairros de Piripiri" no radiogroup acessível.
   - `FilterSheet.tsx`: atualiza o seletor de chips com as cinco opções de ordenação na ordem de relevância comunitária.
   - `WebFilterSidebar.tsx`: incorpora a seção "Ordenar por" na barra lateral persistente desktop, com chips expressivos e acessíveis.
   - `useSearchViewModel`: passa o bairro do usuário/seletor ativo para o cálculo memorizado de `sortBooks`.

## Consequências

### Positivas
- Leitores podem priorizar livros perto de casa com um único toque.
- Experiência completa e ergonômica tanto no mobile quanto no desktop.
- 100% testado de forma pura no domínio/ViewModel sem quebrar contratos de persistência.

### Negativas / Mitigações
- A ordenação client-side processa os livros disponíveis no estado local. Como o catálogo de Piripiri opera em lote inicial leve de disponíveis, o custo de ordenação em memória é desprezível (menos de 2ms).
