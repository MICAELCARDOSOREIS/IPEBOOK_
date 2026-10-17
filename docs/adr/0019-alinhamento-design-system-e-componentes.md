# 0019 — Alinhamento do Design System às telas reais e ao Figma

## Status

Aceito

## Contexto

A pasta `design-system/04-componentes/` documentava 24 componentes especificados durante o trabalho preliminar de IHC. No entanto, havia uma divergência entre a documentação e o código em `src/view/components/`, onde apenas 11 componentes existiam.

Essa discrepância levou anteriormente a incidentes arquiteturais, como o registrado no ADR 0011 (onde uma barra de 5 destinos herdada de template genérico foi corrigida para 3 destinos essenciais da comunidade de Piripiri).

Para evitar que novos colaboradores ou agentes de IA implementem componentes fictícios ou fora de escopo, tornou-se mandatória uma auditoria e alinhamento completo dos 24 componentes documentados, definindo claramente:
1. O que está implementado;
2. O que é implementado nesta rodada por necessidade concreta;
3. O que pertence a issues/specs futuras já planejadas;
4. O que está deliberadamente fora de escopo do Ipebook na fase beta.

## Decisão

Classificar todos os 24 componentes documentados e aplicar as ações correspondentes:

### 1. Componentes já implementados e mantidos (12)
- `barra-de-navegacao` (`NavigationBar.tsx` — 3 destinos conforme ADR 0011)
- `barra-superior` (`TopAppBar.tsx`)
- `botao` (`FilledButton.tsx`)
- `campo-de-busca` (`SearchField.tsx`)
- `campo-de-texto` (`TextField.tsx`)
- `capa-ilustrativa` (`BookCover.tsx`)
- `cartao-de-adicionar-foto` (`AddPhotoCard.tsx` — integrado nas telas de anúncio e edição)
- `chip` (`Chip.tsx`)
- `indicador-de-etapas` (`StepProgress.tsx` — integrado no fluxo de anúncio)
- `logotipo` (`Logotipo.tsx`)
- `badge` (`IconBadge.tsx`)
- `dialogo` (`Dialog.tsx` — implementado na Issue #89 com acessibilidade e confirmação)

### 2. Implementados nesta issue (#92) por utilidade imediata (2)
- `tag` (`Tag.tsx`): Componente unificado de etiqueta não interativa para modalidades (`venda`, `troca`, `doacao`) e status (`reservado`, `concluido`, `pausado`), eliminando a duplicação inline de mapas de cor e garantindo contraste e acessibilidade mínimos de 4,5:1.
- `snackbar` (`Snackbar.tsx`): Componente de feedback flutuante (toast) acessível com `accessibilityLiveRegion="polite"` para confirmação não intrusiva de ações reversíveis ou assíncronas (como pausar, retomar ou salvar anúncios).

### 3. Pertencentes a outras issues da trilha (2)
- `avatar`: Atribuído às issues #55 e #73 (Maria Clara — Perfil do usuário).
- `estado-vazio`: Atribuído à issue #76 / Spec 021 (Maria Clara — Estados globais e ilustrações).

### 4. Fora de escopo deliberado da beta (8)
- `bolha-de-mensagem`: Fora de escopo pelo ADR 0011. O Ipebook não possui chat síncrono instantâneo; as negociações são assíncronas por proposta e pontos de encontro públicos em Piripiri.
- `interruptor`: Fora de escopo conforme decisão na issue #55. Filtros e alternâncias binárias utilizam `Chip` ou diálogos diretos.
- `item-de-lista`: Descartado como componente genérico; cada lista (notificações, pedidos, anúncios) compõe seus itens diretamente com `Pressable` e tokens do tema.
- `linha-de-livro`: Descartado; o pareamento `BookCover` + tipografia resolve o catálogo sem introduzir acoplamento rígido.
- `cartao-de-info`: Descartado; caixas de contexto usam views estilizadas locais com tokens semânticos (`soft`, `action`, etc.).
- `abas`: Descartado; a alternância de visões usa `NavigationBar` na raiz e `Chip` para filtros de categorias/estados.
- `fab`: Descartado; ações de criação são contextualizadas na navegação ou no topo para garantir acessibilidade em telas pequenas e leitores de tela.
- `opcao-unica`: Descartado; seleção única é realizada via conjunto de `Chip`s com propriedade `selected`.

Todos os arquivos dos componentes fora de escopo ou dependentes de outras issues receberão aviso explícito no topo para prevenir implementações errôneas.

## Consequências

- Eliminação de qualquer ambiguidade entre documentação e código em `src/view/components/`.
- Prevenção de retrabalho ou código morto introduzido por outros agentes ou desenvolvedores.
- Entrega de dois componentes fundamentais (`Tag` e `Snackbar`) com 100% de cobertura de testes.
