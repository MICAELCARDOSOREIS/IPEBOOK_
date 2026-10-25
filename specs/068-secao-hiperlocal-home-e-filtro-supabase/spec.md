# Spec 068 — Seção Hiperlocal na Home e Filtro Remoto de Bairro no Supabase

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 25 de outubro de 2026  
**Telas no Figma:** `02.01 · Início` (`10:1`), `02.02 · Explorar / Pesquisa` (`10:2`).  
**Depende de:** Spec 022 (restrição geográfica Piripiri), Spec 028 (filtro e ordenação do catálogo), Spec 062 (alinhamento Home ao Figma), Spec 067 (seletor de bairro e persistência), ADR 0016 (restrição territorial Piripiri), ADR 0050 (seletor de bairro comunitário), ADR 0051 (seção hiperlocal na Home e filtro remoto no Supabase).

---

## 1. Problema

Na Spec 067 (ADR 0050), implementamos o `NeighborhoodSelectorModal` e o hook `useActiveNeighborhood`, conectando a pílula de localização `[ 📍 Bairro ⌄ ]` no topo da Home e da Pesquisa.

Contudo:
1. **Desconexão do Catálogo da Home com o Bairro Ativo:** Na Home (`src/view/home.tsx`), a pílula reflete o bairro selecionado (ex.: "Centro", "Crioli", "Petecas"), mas os livros exibidos no carrossel "Perto de você" ignoravam esse bairro, filtrando apenas por modalidade. Isso quebrava a promessa central da proposta hiperlocal de Piripiri: *"Compre, troque ou receba livros de quem mora perto de você"*.
2. **Ausência de Filtragem de Bairro Direto no Supabase:** No `SupabaseBookDataSource` (`src/infra/datasources/supabaseBookDataSource.ts`), o método `list(options?: ListBooksOptions)` aceitava apenas paginação (`limit` e `offset`). Ao buscar livros paginados por bairro, todo o catálogo precisava trafegar pela rede ou a filtragem dependia exclusivamente de pós-processamento em memória no cliente, prejudicando desempenho, consumo de dados e integridade em paginações futuras.
3. **Navegação "Ver todos" desconectada do Bairro:** O botão "Ver todos" do carrossel na Home navegava para a Pesquisa sem repassar o bairro ativo, forçando o leitor a selecionar o bairro novamente na tela de busca.

## 2. Usuários Afetados

Moradores e leitores dos bairros de Piripiri que abrem o aplicativo esperando encontrar livros disponíveis em sua vizinhança imediata ou em um bairro de seu interesse.

## 3. Escopo

1. **Extensão de `ListBooksOptions` e Contratos de Dados (`iBookDataSource`):**
   - Suporte aos campos `neighborhood?: string` e `modality?: Book["modality"]` em `ListBooksOptions`;
   - Implementação da cláusula `.eq("neighborhood", options.neighborhood)` no `SupabaseBookDataSource.list` quando `neighborhood` for informado e diferente de `"all"`;
   - Suporte equivalente nos datasources de teste e cache (`MemoryBookDataSource` e `CachedBookDataSource`).
2. **Carrossel Hiperlocal na Home (`src/view/home.tsx`):**
   - Quando um bairro específico estiver ativo (ex.: "Centro"):
     - O título do carrossel destaca a localidade: *"Perto de você no Centro"* (ou *"Perto de você em Piripiri"* para `"all"`);
     - Os livros exibidos no carrossel principal refletem prioritariamente os livros cadastrados naquele bairro;
     - Caso não haja livros disponíveis no bairro selecionado, exibe estado acolhedor: *"Ainda não há livros no [Bairro]. Que tal ser a primeira pessoa a anunciar?"*, oferecendo botão para ver livros de toda a cidade ou anunciar;
     - Quando houver livros em outros bairros de Piripiri, exibir uma seção adicional ou botão direto para ver o catálogo completo da cidade.
3. **Navegação Contextual para a Pesquisa:**
   - O botão "Ver todos" da seção hiperlocal invoca `onNavigateToSearch` repassando o filtro de bairro `{ neighborhood: effectiveNeighborhood, modality: selectedModality }`, mantendo a continuidade do contexto do usuário.
4. **Testes Automatizados (TDD):**
   - Testes unitários do `SupabaseBookDataSource` validando a inclusão de `.eq("neighborhood", ...)` e `.eq("modality", ...)`;
   - Testes unitários do `MemoryBookDataSource` com os novos filtros;
   - Testes de renderização da `Home` cobrindo os estados do carrossel hiperlocal (com livros no bairro, sem livros no bairro e visualização global de Piripiri).

## 4. Fora do Escopo

- Cálculo de distância euclidiana ou rotas de GPS (Piripiri opera em modelo declarativo de bairros oficiais e pontos seguros de encontro, conforme ADR 0016).
- Alteração no esquema da tabela `v2_books` (a coluna `neighborhood` já existe e está indexada).

## 5. Regras de Negócio

- **RN-01 (Filtragem Territorial no Banco):** No `SupabaseBookDataSource`, se `options.neighborhood` estiver preenchido e for diferente de `"all"` e de `"Todos os bairros (Piripiri)"`, a query deve incluir `.eq("neighborhood", options.neighborhood)`.
- **RN-02 (Coerência de Bairro na Home):** Ao alternar o bairro na pílula do topo, a lista de livros no carrossel deve refletir imediatamente a localidade escolhida.
- **RN-03 (Preservação de Modalidade e Bairro):** Filtros rápidos de modalidade (Venda, Troca, Doação) continuam operando em conjunto com o filtro de bairro.
- **RN-04 (Continuidade na Navegação):** Ao tocar em "Ver todos" no carrossel hiperlocal, a navegação para `/pesquisa` deve carregar com o bairro selecionado ativo.

## 6. Critérios de Aceite

1. `SupabaseBookDataSource.list({ neighborhood: "Centro" })` aplica o filtro `.eq("neighborhood", "Centro")` na query SQL.
2. `MemoryBookDataSource.list({ neighborhood: "Centro" })` retorna apenas livros do Centro.
3. A tela inicial (Home) exibe *"Perto de você no [Bairro]"* quando um bairro específico estiver ativo e filtra os cards pelos livros daquela localidade.
4. Quando o bairro ativo não possuir livros disponíveis, a Home exibe mensagem explicativa e convite para ver livros de Piripiri como um todo.
5. O botão "Ver todos" navega para a Pesquisa passando o bairro selecionado.
6. 100% dos testes unitários, de componentes e de integração passam com `npm run validate` e `npm run check:architecture` aprovados.
