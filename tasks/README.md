# Tarefas da equipe — Ipebook

**`/home/usermicael/Projetos/IpeBook` (o "projeto grande") foi abandonado em 2026-10-14 — a
equipe decidiu não usá-lo mais.** O único projeto ativo é este, `IPEBOOK_`. As tarefas que eram
sobre aquele projeto (9 a 22) foram reformuladas como **ideias de backlog genéricas** para o
`IPEBOOK_` — não são trabalho pronto para começar, só anotações para quando as funcionalidades
correspondentes (perfil, negociação, moderação, web responsiva) vierem a existir aqui de verdade.
Ver [00b-achados-projeto-ipebook-grande.md](00b-achados-projeto-ipebook-grande.md) (agora
histórico) para o contexto completo dessa decisão.

- **Tarefas 1 a 8** — decisões de produto e pendências técnicas deste projeto. Ativas.
- **Tarefas 9 a 22** — backlog futuro genérico (ver nota acima). Não são trabalho ativo.
- **Tarefas 23 a 25** — implementação das specs do MVP deste projeto (`IPEBOOK_`):
  [specs/003-autenticacao-e-cadastro-de-anuncio/](../specs/003-autenticacao-e-cadastro-de-anuncio/)
  e [specs/004-negociacao-simples/](../specs/004-negociacao-simples/), que fecham os 4 itens do
  escopo do MVP decidido na Tarefa 3. **Ativas — é o que a equipe deve priorizar agora.**

## Leitura obrigatória antes de qualquer tarefa

- [00-achados-da-analise.md](00-achados-da-analise.md) — achados do `IPEBOOK_` (tarefas 1–8).

Cada integrante tem sua própria subpasta, nomeada conforme [docs/equipe.md](../docs/equipe.md).

As issues correspondentes no GitHub (repositório `Ghostyxseven/IPEBOOK_`) têm labels por
integrante (`pessoa:micael`, `pessoa:maria-clara`, `pessoa:antonio`, `pessoa:eric`). As tarefas
1, 2, 3, 4 e 7 não têm issue — já estão decididas, não precisam de acompanhamento de execução.

**Atualização de 2026-10-13:** as tarefas 1, 2, 3, 4 e 7 (decisões de produto do `IPEBOOK_`) já
têm decisão registrada em "Registro de execução", trazida do que a equipe já validou no projeto
irmão (`/home/usermicael/Projetos/IpeBook`) — ver `docs/produto.md`, seção "Decisões já
tomadas". Não é preciso reunião para respondê-las de novo; só revisar se alguém discordar. Isso
libera a Tarefa 8 (especificar a primeira jornada funcional) para começar, e a equipe pode focar
em código a partir daí.

## Como usar

1. Ler [00-achados-da-analise.md](00-achados-da-analise.md) primeiro.
2. Priorizar as Tarefas 23 a 25 (implementação do MVP) — é o trabalho ativo da equipe agora.
3. As tarefas prefixadas "Backlog futuro" (9 a 22) não são para começar agora — são só
   anotações para quando a funcionalidade correspondente existir de verdade no `IPEBOOK_`.
4. Lê o contexto, o que fazer e o entregável dentro do próprio arquivo.
5. Ao concluir, preenche a seção **"Registro de execução"** no final do arquivo da tarefa.
6. Decisões que mudam arquitetura devem virar ADR neste repositório.
7. [00c-checklist-apresentacao-final-projeto-grande.md](00c-checklist-apresentacao-final-projeto-grande.md)
   (reformulado como checklist genérico) é compartilhado, não é tarefa individual.

## Ordem de dependência — tarefas 1 a 8 (IPEBOOK_)

```
Tarefa 1 (problema e público) — Micael
      │
      ▼
Tarefa 2 (modalidade e origem dos livros) — Maria Clara
      │
      ├──▶ Tarefa 7 (reconciliar documentação de modalidade) — Maria Clara
      │
      ▼
Tarefa 3 (escopo do MVP e conta/autenticação) — Antonio
      │
      ▼
Tarefa 8 (especificar primeira jornada funcional) — Antonio

Tarefa 4 (plataformas) — Eric            ─┐ podem ser feitas em paralelo,
Tarefa 5 (integrar componentes visuais) — Eric ─┘ não dependem das demais
Tarefa 6 (resolver ADR 0019 ausente) — Micael  ─ pode começar já
```

## Ordem de dependência — tarefas 23 a 25 (implementação do MVP neste repositório)

```
#23 Modelo (Maria Clara) ─┐ podem ser feitas em paralelo (arquivos diferentes)   #30 Modelo (Antonio)
#26 Modelo (Eric)        ─┘                                                       ─ pode começar já também
      │                                                                              (coordenar com #26
      ▼                                                                              em book.ts)
#24 Caso de uso+infra (Maria Clara) ─┐
#27 Caso de uso+infra (Eric)        ─┘ paralelo
      │
      ▼
#25 ViewModel+telas (Maria Clara) ─┐
#28 ViewModel+tela (Eric)         ─┘ paralelo
      │
      ▼
#29 Conjunta: container, Home, integração final (Maria Clara + Eric)
      │
      ▼
Resto da Tarefa 25 (negociação completa, Antonio) — só agora depende de 23/24 prontas
```

## Backlog futuro (tarefas 9 a 22) — não é trabalho ativo

Sem ordem de dependência — não são tarefas para começar agora. São anotações de lição
aprendida/ideia futura, válidas apenas se/quando a funcionalidade correspondente (negociação,
notificações, autenticação Google, moderação, perfil, web responsiva) vier a ser especificada
de verdade para o `IPEBOOK_`. Ver cada arquivo para o que exatamente ficou registrado.

## Tarefas por integrante

### No `IPEBOOK_` (este projeto)

| Integrante | Pasta | Tarefas | Depende de |
| --- | --- | --- | --- |
| Micael Cardoso Reis | [micael-cardoso-reis/](micael-cardoso-reis/) | [01 — Problema e público-alvo](micael-cardoso-reis/01-problema-e-publico.md) · [06 — Resolver referência ADR 0019](micael-cardoso-reis/06-resolver-referencia-adr-0019.md) ([#2](https://github.com/Ghostyxseven/IPEBOOK_/issues/2)) · [26 ([#22](https://github.com/Ghostyxseven/IPEBOOK_/issues/22)) — Resolver pendências do design-kit](micael-cardoso-reis/26-resolver-pendencias-design-kit.md) | — |
| Maria Clara Almeida Martins | [maria-clara-almeida-martins/](maria-clara-almeida-martins/) | [02 — Modalidade e origem dos livros](maria-clara-almeida-martins/02-modalidade-e-origem-dos-livros.md) · [07 — Reconciliar documentação de modalidade](maria-clara-almeida-martins/07-reconciliar-documentacao-de-modalidade.md) | Tarefa 1 |
| Antonio Carlos Gomes | [antonio-carlos-gomes/](antonio-carlos-gomes/) | [03 — Escopo do MVP e conta/autenticação](antonio-carlos-gomes/03-escopo-mvp-e-conta.md) · [08 — Especificar primeira jornada funcional](antonio-carlos-gomes/08-especificar-primeira-jornada-funcional.md) ([#3](https://github.com/Ghostyxseven/IPEBOOK_/issues/3)) | Tarefas 1, 2, 7 |
| Eric Vinícius dos Santos Oliveira | [eric-vinicius-dos-santos-oliveira/](eric-vinicius-dos-santos-oliveira/) | [04 — Plataformas suportadas inicialmente](eric-vinicius-dos-santos-oliveira/04-plataformas.md) · [05 — Integrar componentes visuais na Home](eric-vinicius-dos-santos-oliveira/05-integrar-componentes-visuais-na-home.md) ([#1](https://github.com/Ghostyxseven/IPEBOOK_/issues/1)) | — |

### Implementação do MVP neste repositório

Cada tarefa grande (23, 24, 25) virou issues menores e independentes — trabalhar uma de cada
vez, não a issue grande inteira de uma só vez.

| Integrante | Tarefa | Issues menores (fazer nesta ordem) | Spec |
| --- | --- | --- | --- |
| Maria Clara Almeida Martins | [23 (#19) — Implementar autenticação](maria-clara-almeida-martins/23-implementar-autenticacao-spec-003.md) | [#23 Modelo](https://github.com/Ghostyxseven/IPEBOOK_/issues/23) (pode começar já) → [#24 Caso de uso+infra](https://github.com/Ghostyxseven/IPEBOOK_/issues/24) → [#25 ViewModel+telas](https://github.com/Ghostyxseven/IPEBOOK_/issues/25) | [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/) |
| Eric Vinícius dos Santos Oliveira | [24 (#20) — Implementar cadastro de anúncio](eric-vinicius-dos-santos-oliveira/24-implementar-cadastro-anuncio-spec-003.md) | [#26 Modelo](https://github.com/Ghostyxseven/IPEBOOK_/issues/26) (pode começar já) → [#27 Caso de uso+infra](https://github.com/Ghostyxseven/IPEBOOK_/issues/27) → [#28 ViewModel+tela](https://github.com/Ghostyxseven/IPEBOOK_/issues/28) | [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/) |
| Maria Clara + Eric | — | [#29 Conjunta — container, Home, integração final](https://github.com/Ghostyxseven/IPEBOOK_/issues/29) (depois de tudo acima) | [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/) |
| Antonio Carlos Gomes | [25 (#21) — Implementar negociação simples](antonio-carlos-gomes/25-implementar-negociacao-spec-004.md) | [#30 Modelo](https://github.com/Ghostyxseven/IPEBOOK_/issues/30) (**pode começar já**, não espera 23/24) → resto aguarda 23+24 prontas | [specs/004](../specs/004-negociacao-simples/) |

### Backlog futuro, por integrante (não é trabalho ativo — ver nota no topo)

| Integrante | Backlog |
| --- | --- |
| Micael Cardoso Reis | [09 — Bugs corrigidos no projeto abandonado (histórico, issue fechada)](micael-cardoso-reis/09-corrigir-bugs-auditoria-negociacao-notificacoes.md) · [10 ([#5](https://github.com/Ghostyxseven/IPEBOOK_/issues/5)) — Catálogo: paginação/validação](micael-cardoso-reis/10-finalizar-catalogo-e-validar-aparelho-real.md) · [11 ([#6](https://github.com/Ghostyxseven/IPEBOOK_/issues/6)) — Notificações: decidir em conjunto](micael-cardoso-reis/11-acordar-adr-0011-notificacoes.md) · [12 ([#7](https://github.com/Ghostyxseven/IPEBOOK_/issues/7)) — Build Android e deploy Web](micael-cardoso-reis/12-infra-remoto-build-vercel-readme.md) |
| Maria Clara Almeida Martins | [13 ([#8](https://github.com/Ghostyxseven/IPEBOOK_/issues/8)) — Login Google futuro](maria-clara-almeida-martins/13-fechar-pendencias-google-ios-autenticacao.md) · [14 ([#9](https://github.com/Ghostyxseven/IPEBOOK_/issues/9)) — Validar autenticação em aparelho](maria-clara-almeida-martins/14-validar-autenticacao-onboarding-aparelho-real.md) · [15 ([#10](https://github.com/Ghostyxseven/IPEBOOK_/issues/10)) — Web responsiva: senha/confirmações](maria-clara-almeida-martins/15-web-responsiva-sua-parte.md) |
| Antonio Carlos Gomes | [16 ([#11](https://github.com/Ghostyxseven/IPEBOOK_/issues/11)) — Moderação: checar permissão se existir](antonio-carlos-gomes/16-corrigir-acesso-menu-moderacao.md) · [17 ([#12](https://github.com/Ghostyxseven/IPEBOOK_/issues/12)) — Validar segurança em aparelho](antonio-carlos-gomes/17-validar-seguranca-aparelho-real.md) · [18 ([#13](https://github.com/Ghostyxseven/IPEBOOK_/issues/13)) — Web responsiva: moderação](antonio-carlos-gomes/18-web-responsiva-sua-parte.md) |
| Eric Vinícius dos Santos Oliveira | [19 ([#14](https://github.com/Ghostyxseven/IPEBOOK_/issues/14)) — Classificar modalidade em métricas](eric-vinicius-dos-santos-oliveira/19-corrigir-metrica-reputacao.md) · [20 ([#15](https://github.com/Ghostyxseven/IPEBOOK_/issues/15)) — Perfil completo (futuro)](eric-vinicius-dos-santos-oliveira/20-completar-perfil-completo-spec-031.md) · [21 ([#16](https://github.com/Ghostyxseven/IPEBOOK_/issues/16)) — Validar anúncio/perfil em aparelho](eric-vinicius-dos-santos-oliveira/21-validar-anuncio-perfil-aparelho-real.md) · [22 ([#17](https://github.com/Ghostyxseven/IPEBOOK_/issues/17)) — Web responsiva: anúncios/perfil](eric-vinicius-dos-santos-oliveira/22-web-responsiva-sua-parte.md) |

## Compartilhado

- [00c-checklist-apresentacao-final-projeto-grande.md](00c-checklist-apresentacao-final-projeto-grande.md) ([#18](https://github.com/Ghostyxseven/IPEBOOK_/issues/18)) — reformulado como checklist genérico de apresentação.
