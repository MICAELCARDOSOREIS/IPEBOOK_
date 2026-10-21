# Spec 036 — Gerenciar e editar alerta de busca (Figma 02.09 a 02.12)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Fontes visuais:** exportação `IpêBook.pdf`, telas `02.07` a `02.13`
(`design-system/telas-android-figma.md`).

## Problema

`/alertas` condensa em uma única tela sete telas do Figma. Depois da Spec 035 o estado vazio e a
lista ficaram alinhados, mas as ações de cada alerta continuam resolvidas no mesmo lugar: cada
alerta é uma linha com três links de texto miúdos (Editar · Pausar · Excluir) e a edição reaproveita
o formulário de criação no topo da lista.

O Figma separa:

| Figma | Tela | Hoje no aplicativo |
| --- | --- | --- |
| `02.09 · Gerenciar alerta` | Tela própria com o cartão de estado e três ações em largura total | Não existe |
| `02.10 · Editar alerta` | Tela própria com termo, cidade e tipo de anúncio | Formulário reaproveitado da lista |
| `02.11 · Alerta pausado` | Mesma tela, estado pausado | Variação visual na linha da lista |
| `02.12 · Excluir alerta?` | Diálogo sobre a tela de gerenciamento | Diálogo sobre a lista |

Além da estrutura, falta informação: `02.09` e `02.10` mostram **tipo de anúncio** e **cidade** do
alerta, mas `v2_search_alerts` guarda apenas `query` e `active`. Hoje a linha
`searchAlerts.tsx:135` escreve "Venda, troca e doação · Piripiri, PI" fixo no código, independente
do alerta — o texto não descreve o dado, apenas imita o desenho.

## Decisão de alcance

O alerta passa a guardar as modalidades escolhidas, e elas filtram de verdade as notificações. Os
chips de `02.10` seriam enganosos se fossem apenas visuais: mostrariam uma escolha que o produto
ignora. A cidade permanece "Piripiri, PI", travada, porque a Spec 022 restringe a plataforma a
Piripiri — o campo existe no desenho como contexto, não como escolha.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Modalidades do alerta):** todo alerta guarda uma ou mais modalidades
  (`sale`, `trade`, `donation`). Alertas existentes passam a valer para as três, que é o
  comportamento atual.
- **RN-02 (Correspondência por modalidade):** um anúncio novo só gera notificação quando sua
  modalidade está entre as do alerta, além da correspondência de texto já existente.
- **RN-03 (Pelo menos uma modalidade):** salvar um alerta sem nenhuma modalidade é recusado com
  "Selecione pelo menos um tipo.", como em `02.10`.
- **RN-04 (Navegação):** cada alerta da lista `02.07` é um alvo único que abre
  `/alertas/[id]` (`02.09`), de onde saem editar (`/alertas/[id]/editar`, `02.10`), pausar/retomar
  (`02.11`) e excluir (`02.12`).
- **RN-05 (Cidade travada):** o campo de cidade de `02.10` exibe "Piripiri, PI" sem permitir edição.
- **RN-06 (Acessibilidade):** cada alvo respeita `tokens.accessibility.touchTarget`, com
  `accessibilityRole` e rótulo que nomeia o alerta.

## Critérios de Aceite

1. `/alertas` lista cada alerta como um alvo navegável único, com termo, modalidades e cidade, sem
   os links de ação soltos.
2. `/alertas/[id]` apresenta "Gerenciar alerta", a manchete com o termo do alerta, o cartão
   "Alerta ativo" ou "Alerta pausado" e as ações "Editar alerta", "Pausar alerta"/"Retomar alerta" e
   "Excluir alerta".
3. `/alertas/[id]/editar` apresenta "Editar alerta", a manchete "Ajuste sua busca.", o termo, a
   cidade travada em "Piripiri, PI", os chips de tipo com seleção múltipla, "Salvar alterações" e
   "Cancelar".
4. Salvar sem modalidade alguma mostra "Selecione pelo menos um tipo." e não grava.
5. Excluir pede confirmação em diálogo e, confirmado, volta para a lista sem o alerta.
6. Um anúncio cuja modalidade não está no alerta não gera notificação, mesmo que o texto combine.
7. Alertas criados antes desta mudança continuam valendo para as três modalidades.

## Verificação

`npm run validate` (inclui os testes SQL das migrações em PGlite) e `npm run verify:release`, mais
conferência das telas no aparelho via ADB contra as páginas do PDF.
