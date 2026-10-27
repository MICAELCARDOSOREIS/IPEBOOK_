# ADR 0066 — Aprimoramentos da Experiência Web Responsiva e Desktop Largo

- **Status:** Aceito
- **Data:** 27 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 093 (Aprimoramentos da experiência Web responsiva e desktop largo no padrão Figma).
- **Relacionado a:** complementa o ADR 0020 (Publicação Web), ADR 0055/0056 (Alinhamento ao Figma) e ADR 0057 (Filtro do Explorar).

## Contexto

A experiência Web em desktop largo (`width >= 960px`, `useIsWideWeb`) introduziu o cabeçalho persistente `WebHeader`, grades responsivas de 4 e 5 colunas, painel de autenticação em duas colunas (`AuthShell`) e visualização de conversas com chat embutido.

No entanto, a auditoria de continuidade e testes apontou lacunas na paridade com o Figma (`APP · 30 · Web · Responsivo`):
1. **Filtro de Conservação truncado**: `WebFilterSidebar` exibia apenas "Bom estado" em uma linha binária, enquanto o Figma `34:229` e o modelo de domínio possuem 4 estados de conservação (`new`, `good`, `marked`, `worn`).
2. **Hero da Início (`Home`)**: Em desktop largo, botões redundantes de topo (Entrar e Notificações) competiam com o `WebHeader`, e faltavam o bloco editorial de estatísticas comunitárias de Piripiri e o chip de bairro ativo integrado.
3. **Estante Desktop**: Falta do banner convidativo de troca e desapego comunitário ("Quer trocar livros?") no topo da listagem de anúncios na Web (`05.01`).
4. **Redefinição de Senha (`ResetPassword`)**: A tela não utilizava o `AuthShell`, exibindo um formulário esticado sem o painel da marca presente nas demais telas de acesso (`signIn`, `signUp`, `forgotPassword`).

## Decisão

1. **Expandir `SearchConditionFilter`**:
   - Evoluir de `"all" | "good"` para `"all" | BookCondition` (`new`, `good`, `marked`, `worn`).
   - Atualizar `WebFilterSidebar` para listar as 4 opções de conservação com seleção atômica e chips de remoção no Explorar.
   - Atualizar `FilterSheet` e os utilitários de contagem e descrição de resultados (`searchFilters.ts`) para refletir as 4 condições.
2. **Refinar a Home no Desktop Largo (`home.tsx`)**:
   - Ocultar botões duplicados da barra de topo (Entrar e Notificações) quando `wideWeb` for verdadeiro, mantendo a responsabilidade unificada no `WebHeader`.
   - Adicionar o bloco de estatísticas/destaques comunitários de Piripiri (total de livros disponíveis, bairros atendidos e doações ativas) no hero editorial da Web larga.
3. **Banner de Troca na Estante Desktop (`myListings.tsx`)**:
   - Renderizar o banner convidativo de desapego e circulação de livros comunitários no topo da aba de anúncios na Web larga, com chamada de ação direta.
4. **Padronizar `ResetPassword` com `AuthShell`**:
   - Envolver o fluxo de redefinição de senha e links expirados no `AuthShell`, garantindo apresentação consistente em duas colunas na Web larga.

## Consequências

- Paridade visual completa com as especificações do Figma Web Desktop (`01.06`, `02.01`, `02.02`, `05.01`).
- Maior expressividade nos filtros de busca em todas as plataformas (web e mobile).
- Interface web desktop limpa, eliminando elementos de navegação redundantes.
