# Spec 067 — Seletor de Bairro e Filtro Territorial de Piripiri (Home e Explorar)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 25 de outubro de 2026  
**Telas no Figma:** `02.01 · Início` (`10:1`), `02.02 · Explorar / Pesquisa` (`10:2`).  
**Depende de:** Spec 022 (restrição territorial Piripiri), Spec 028 (filtros de catálogo), Spec 034 (preferências privadas), Spec 062 (alinhamento Home), Spec 066 (alinhamento Explorar), ADR 0016 (restrição territorial Piripiri), ADR 0050 (seletor de bairro comunitário e persistência).

---

## 1. Problema

No Ipebook, a circulação de livros físicos acontece entre pessoas que residem ou transitam na cidade de Piripiri, PI (ADR 0016 e Spec 022). As telas canônicas do Figma `02.01 · Início` e `02.02 · Explorar` exibem no topo esquerdo a pílula de localização `[ 📍 Centro ⌄ ]`.

Entretanto, até o momento:
1. O botão `[ 📍 Centro ⌄ ]` na Home (`src/view/home.tsx`) e na Pesquisa (`src/view/search/search.tsx`) permanecia desconectado nas rotas (`src/app/index.tsx` e `src/app/pesquisa.tsx`), sem ação ao toque (`onSelectNeighborhood` ausente ou inoperante);
2. Não havia um componente modal ou folha acessível para o usuário alternar entre os 17 bairros oficiais de Piripiri ou escolher "Todos os bairros";
3. O `useSearchViewModel` não contemplava filtro por bairro, impossibilitando filtrar livros disponíveis em um bairro específico (ex: Petecas, Paciência, Fonte dos Matos);
4. A escolha do bairro ativo não era persistida localmente no dispositivo para visitantes e usuários logados, forçando a interface a sempre assumir "Centro".

## 2. Usuários afetados

Todos os leitores e vizinhos em Piripiri que navegam pelo app buscando livros físicos disponíveis perto de sua casa, trabalho ou escola.

## 3. Escopo

1. **Componente `NeighborhoodSelectorModal`:**
   - Modal acessível com título *"Escolha seu bairro em Piripiri"*;
   - Opção *"Todos os bairros (Piripiri)"*;
   - Lista completa dos 17 bairros oficiais definidos em `PIRIPIRI_NEIGHBORHOODS` (`src/model/entities/location.ts`);
   - Campo de filtro rápido de texto para localização imediata do bairro;
   - Indicador visual do bairro atualmente selecionado;
   - Área de toque mínima de 48dp, botão de fechar e compatibilidade total com leitores de tela (TalkBack / VoiceOver).
2. **Hook e Gerenciador de Localidade Ativa (`useActiveNeighborhood`):**
   - Chave de persistência `@ipebook:active_neighborhood` em `AsyncStorage`;
   - Inicialização resiliente: lê a preferência salva no dispositivo; se não houver, utiliza a preferência do perfil (caso autenticado) ou padrão `"Centro"`;
   - Função `selectNeighborhood(neighborhood: string)` que atualiza o estado e persiste no dispositivo.
3. **Integração na Tela Inicial (`Home` e `src/app/index.tsx`):**
   - Ao clicar na pílula de bairro no topo esquerdo, abre o `NeighborhoodSelectorModal`;
   - Exibe o nome do bairro ativo selecionado na pílula;
   - Ao selecionar um bairro, atualiza o rótulo da pílula imediatamente.
4. **Integração na Tela Explorar / Pesquisa (`Search`, `useSearchViewModel` e `src/app/pesquisa.tsx`):**
   - Inclusão do campo `neighborhood: string | "all"` no `SearchState` e `setNeighborhood: (neighborhood: string | "all") => void` no `SearchActions`;
   - Filtragem dos livros pelo bairro especificado (`book.neighborhood === neighborhood`), exceto quando selecionado `"all"` ou `"Todos os bairros"`;
   - Ao clicar na pílula, abre o seletor; ao escolher, aplica o filtro de bairro na busca;
   - O botão "Limpar filtros" preserva ou reseta os filtros conforme a intenção do usuário.
5. **Cobertura Automatizada com TDD:**
   - Testes unitários para o hook `useActiveNeighborhood`;
   - Testes unitários para o `useSearchViewModel` com filtro de bairro;
   - Testes de componente para `NeighborhoodSelectorModal`;
   - Testes de integração na Home e Pesquisa.

## 4. Fora do escopo

- Geolocalização via GPS em tempo real (o modelo de Piripiri é declarativo por privacidade e economia de bateria, conforme ADR 0016).
- Expansão para outras cidades além de Piripiri, PI (a beta permanece estritamente restrita a Piripiri).

## 5. Regras de Negócio

- **RN-01 (Vocabulário Fechado de Bairros):** Somente os 17 bairros de `PIRIPIRI_NEIGHBORHOODS` e a opção coringa `"all"` / `"Todos os bairros"` são aceitos.
- **RN-02 (Persistência no Dispositivo):** A seleção de bairro deve ser salva no `AsyncStorage` local imediatamente para que o usuário permaneça com seu bairro preferido nas próximas visitas.
- **RN-03 (Filtragem Consistente):** Quando um bairro específico estiver selecionado na busca, apenas anúncios com `book.neighborhood === neighborhood` (comparação insensível a maiúsculas/minúsculas) devem ser retornados.
- **RN-04 (Fallback Gracioso):** Caso o anúncio antigo não possua bairro preenchido, ele deve ser considerado apenas na opção `"all"` (todos os bairros).
- **RN-05 (Acessibilidade):** Toda opção do seletor deve possuir `accessibilityRole="button"`, `accessibilityState={{ selected: isCurrent }}` e `accessibilityLabel`.

## 6. Critérios de Aceite

1. O toque no chip de localização `[ 📍 Centro ⌄ ]` tanto na Home quanto na Pesquisa abre o modal de seleção de bairros.
2. O modal exibe os 17 bairros oficiais de Piripiri e a opção "Todos os bairros".
3. A digitação no campo de filtro do modal restringe a lista de bairros em tempo real.
4. Ao tocar em um bairro, o modal fecha, o chip atualiza o nome do bairro e a preferência é salva no `AsyncStorage`.
5. Na tela de Pesquisa/Explorar, selecionar um bairro filtra os livros exibidos para exibir somente os daquele bairro.
6. 100% dos testes unitários e de integração novos e existentes passam com sucesso.
