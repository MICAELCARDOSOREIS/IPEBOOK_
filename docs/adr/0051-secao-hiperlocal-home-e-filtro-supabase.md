# ADR 0051 — Seção Hiperlocal na Home e Consulta Remota de Bairro no Supabase

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 068 (Seção Hiperlocal na Home e Filtro Remoto de Bairro no Supabase), Figma `02.01 · Início`, `02.02 · Explorar`.
- **Relacionado a:** ADR 0016 (Restrição territorial Piripiri), ADR 0050 (Seletor de Bairro Comunitário), ADR 0045 (Alinhamento Visual Home).

---

## Contexto

Após a introdução do seletor de bairro comunitário (ADR 0050 / Spec 067), a pílula de localização no cabeçalho da Home passou a exibir dinamicamente o bairro ativo do usuário em Piripiri (ex.: "Centro", "Crioli", "Petecas").

Contudo, dois problemas arquiteturais e de experiência foram identificados:
1. **Desconexão do Carrossel com o Bairro Ativo:** Na Home (`src/view/home.tsx`), a lista de livros em destaque ("Perto de você") filtrava exclusivamente por modalidade (Venda, Troca, Doação), ignorando o bairro ativo. Um morador do Crioli que selecionava seu bairro continuava visualizando livros misturados de outros bairros sem destaque territorial.
2. **Filtragem Remota Inexistente no Supabase:** O contrato `ListBooksOptions` e o `SupabaseBookDataSource.list` suportavam apenas paginação (`limit` e `offset`), sem cláusula de filtragem por `neighborhood` nem por `modality` no banco de dados Postgres, obrigando o cliente a receber todos os registros para filtrar no dispositivo ou impedindo buscas paginadas restritas ao bairro.

## Decisão

1. **Extensão do Contrato de Consulta `ListBooksOptions`:**
   - Adicionar os parâmetros opcionais `neighborhood?: string` e `modality?: Book["modality"]` em `src/model/datasources/iBookDataSource.ts`.
2. **Filtragem Remota no Supabase (`SupabaseBookDataSource`):**
   - No método `list`, aplicar condicionalmente `.eq("neighborhood", options.neighborhood)` caso um bairro válido seja informado (diferente de `"all"` e de `"Todos os bairros (Piripiri)"`).
   - Aplicar condicionalmente `.eq("modality", options.modality)` caso uma modalidade específica seja informada (diferente de `"all"`).
   - Manter paridade funcional nos adaptadores em memória e cache (`MemoryBookDataSource` e `CachedBookDataSource`).
3. **Seção Hiperlocal na Home (`src/view/home.tsx`):**
   - Dinamizar o título do carrossel principal para *"Perto de você no [Bairro]"* quando um bairro estiver ativo, ou *"Perto de você em Piripiri"* quando em modo global.
   - Filtrar os livros exibidos no carrossel de acordo com o bairro ativo.
   - Caso não existam livros disponíveis no bairro selecionado, renderizar um estado vazio acolhedor que informa a ausência local e convida o leitor a explorar os livros de toda a cidade ou anunciar o primeiro livro.
4. **Navegação Contextual para a Pesquisa:**
   - O botão "Ver todos" repassa o bairro ativo e a modalidade atual para `onNavigateToSearch`, preservando a intenção de navegação do usuário ao entrar na tela de busca.

## Consequências

- **Positivas:**
  - Redução de tráfego de rede e payload desnecessário em consultas filtradas por bairro ou modalidade.
  - Alinhamento pleno com a proposta de valor comunitária de Piripiri: leitores encontram facilmente livros no seu próprio bairro.
  - Experiência coesa entre seleção de localidade, exibição na Home e aprofundamento na Pesquisa.
- **Negativas / Limitações:**
  - Requer que os mocks de testes do datasource reflitam as novas opções de consulta.
