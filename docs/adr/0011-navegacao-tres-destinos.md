# 0011 — Barra de navegação com 3 destinos (Início, Pesquisa, Perfil)

Data: 2026-10-14. Status: aceito.

## Contexto

O [design-system/04-componentes/barra-de-navegacao.md](../../design-system/04-componentes/barra-de-navegacao.md)
documenta uma barra de navegação fixa com **5 destinos**: Início, Explorar, Estante, Conversas e
Perfil — decisão de produto atribuída a 02/10/2026. O [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md)
também cita essa barra de 5 destinos ao descrever a linguagem visual do Android.

Essa decisão de 5 destinos veio do design-kit original, trazido do projeto irmão abandonado
(`/home/usermicael/Projetos/IpeBook`) — o mesmo padrão de cópia sem adaptação já corrigido nos
ADRs [0007](0007-serifa-da-marca.md) e [0009](0009-design-kit-tokens-como-fonte-unica.md). O
IPEBOOK_ não tem "Estante" (biblioteca pessoal) nem "Conversas" (mensageria) especificadas nem
implementadas — só existem Catálogo (Início), e, a partir da versão 1.0, Pesquisa e Perfil.

## Decisão

A barra de navegação do IPEBOOK_ usa **3 destinos**: **Início**, **Pesquisa** e **Perfil**,
seguindo a anatomia, os estados e a acessibilidade já documentados em `barra-de-navegacao.md`
(pílula de item ativo, alvo de 48 dp, rótulo sempre visível) — só o número e o conteúdo dos
itens mudam, não o componente em si.

"Estante" e "Conversas" não entram na barra: não existem como funcionalidade especificada no
IPEBOOK_ e não há necessidade de produto concreta para elas agora (negociação já é atendida
pelas telas "Meus pedidos"/"Pedidos recebidos" da spec 004, acessíveis a partir do Perfil ou da
Home, sem precisar de destino fixo próprio).

Este ADR **não revoga o ADR 0008** (dark mode e linguagem visual por plataforma continuam
válidos) — só corrige a contagem de destinos da barra de navegação que o 0008 citou de
passagem.

## Alternativas consideradas

- Manter os 5 destinos do design system, implementando "Estante" e "Conversas" como telas
  vazias/placeholder só para a barra bater com a documentação: rejeitada — cria navegação para
  funcionalidade que não existe, contra o princípio de não inventar escopo sem necessidade de
  produto comprovada.
- Não ter barra de navegação fixa nesta versão, mantendo navegação por botões/links como hoje:
  rejeitada para a v1.0 — o produto já tem 3 destinos de nível superior reais (Início, Pesquisa,
  Perfil) o suficiente para justificar navegação fixa, e o design system já define o componente
  pronto para isso.

## Consequências

- `src/view/components/NavigationBar.tsx` implementa só os 3 itens — Início, Pesquisa, Perfil —
  com os tokens e estados já documentados em `barra-de-navegacao.md`.
- Se "Estante" ou "Conversas" vierem a ser especificadas de verdade no futuro, a barra ganha um
  item novo nessa ocasião — este ADR não impede isso, só não implementa escopo inexistente hoje.
- `design-system/04-componentes/barra-de-navegacao.md` continua documentando os 5 destinos como
  o padrão herdado do sistema base; este ADR é a decisão de produto que restringe o que o
  IPEBOOK_ de fato implementa, do mesmo jeito que o ADR 0007 fez para a serifa da marca.

Vínculos: [ADR 0007](0007-serifa-da-marca.md), [ADR 0008](0008-sem-dark-mode-android-md3-ios-liquid-glass.md),
[ADR 0009](0009-design-kit-tokens-como-fonte-unica.md),
[design-system/04-componentes/barra-de-navegacao.md](../../design-system/04-componentes/barra-de-navegacao.md).
