# Guia de Contribuição — Ipebook

Seja bem-vindo(a) ao projeto **Ipebook**! Este documento orienta os integrantes da equipe e futuros colaboradores sobre os padrões de desenvolvimento, fluxo de versionamento, políticas de branches e boas práticas de engenharia de software adotadas no projeto.

---

## 📌 1. Princípios Gerais

1. **Português Obrigatório:** Toda a documentação, mensagens de commit, nomes de cenários de teste, pull requests e discussões técnicas devem ser redigidos em língua portuguesa.
2. **Qualidade Contínua:** Nenhuma alteração pode ser integrada se quebrar a tipagem estrita (`tsc --noEmit`), violar as regras de camadas da arquitetura MVVM (`scripts/verificar-arquitetura.mjs`) ou reduzir a cobertura de testes para menos de 80% (`npm run test:coverage`).
3. **Spec Kit & ADRs:** Novas funcionalidades ou decisões arquiteturais devem ser precedidas de especificações (`specs/`) e registros de decisão arquitetural (`docs/adr/`).
   **Numeração das specs:** antes de criar `specs/NNN-...`, liste `specs/` e use o próximo número livre (`ls specs | tail -3`) — nunca reutilize um número já existente, nem em branches paralelas; ao abrir o PR, confira se outra branch não tomou o mesmo número. O mesmo vale para ADRs. A CI roda `npm run check:numbering` e falha se houver colisão; rode-o de novo depois de atualizar a branch com o `develop`.
4. **Documentação sempre atualizada:** quem muda o código atualiza a documentação no mesmo commit/PR — nunca depois, "quando der tempo". Ver a seção 6 abaixo para o que checar.

---

## 🌿 2. Estratégia de Branches e Versionamento

O projeto adota o fluxo baseado no **Git Flow adaptado**:

* `main`: Ramo reservado exclusivamente para versões estáveis, testadas e aprovadas para entrega. **Nunca faça commits diretos na `main`**.
* `develop`: Ramo base para integração contínua de novas entregas e testes.
* Branches de funcionalidade / correções: devem ser criadas a partir de `develop`:
  - `feat/nome-da-funcionalidade` (ex: `feat/busca-livros`)
  - `test/nome-do-teste` (ex: `test/fluxo-login-e2e`)
  - `fix/descricao-da-correcao` (ex: `fix/sanitizacao-titulo`)
  - `docs/tema-da-documentacao` (ex: `docs/atualizacao-iso25010`)

---

## ✍️ 3. Padrão de Commits

Adotamos a convenção de **Commits Semânticos (Conventional Commits)** com mensagens claras, concisas e em português:

```text
tipo(escopo opcional): descrição curta no imperativo
```

### Tipos Permitidos:
* `feat`: Adição de nova funcionalidade ao aplicativo.
* `fix`: Correção de defeito ou bug identificado.
* `test`: Adição ou reestruturação de testes (unitários, componentes, hooks, mocks, integração, E2E).
* `docs`: Alterações exclusivamente em arquivos de documentação (`README.md`, `specs/`, `docs/`).
* `refactor`: Refatoração de código que não altera comportamento nem adiciona funcionalidade.
* `build`: Alterações em dependências, scripts de build ou configurações do ecossistema Expo/npm.
* `chore`: Tarefas rotineiras de manutenção do repositório.

### Exemplos Válidos:
* `test(unit): adicionar validacoes de limite de caracteres de livros`
* `feat(catalog): exibir capa do livro no card da listagem`
* `fix(viewmodel): tratar retorno de timeout na consulta remota`
* `docs(adr): registrar adr 0004 sobre persistencia com sqlite`

> ⚠️ **Atenção:** Commits genéricos como `"ajustes"`, `"testes"`, `"wip"` ou commits gigantes concentrando todo o trabalho de uma vez são expressamente proibidos.

---

## 🛠️ 4. Fluxo de Trabalho Passo a Passo

1. **Sincronizar com o repositório:**
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Criar sua branch de trabalho:**
   ```bash
   git checkout -b feat/minha-entrega
   ```
3. **Instalar dependências limpas:**
   ```bash
   npm ci
   ```
4. **Implementar código acompanhado de testes:**
   - Para regras de negócio: criar testes em `tests/unit/`.
   - Para estado/ViewModel: criar testes em `tests/hooks/`.
   - Para UI/telas: criar testes em `tests/components/` ou `tests/components-mocked/`.
   - Para fluxos completos: criar testes em `tests/integration/` ou `.maestro/`.
5. **Garantir validação local:**
   Antes de abrir commit ou Pull Request, execute:
   ```bash
   npm run validate
   ```
   O comando garante que o TypeScript, a arquitetura de 7 camadas e a cobertura mínima de 80% estão aprovados.
6. **Submeter Pull Request:**
   Abra o PR apontando sempre para a branch `develop`, descrevendo:
   - O que foi implementado;
   - Os testes criados e o resultado da cobertura;
   - As decisões arquiteturais associadas;
   - Quais documentos foram atualizados por causa desta mudança (ver seção 6 abaixo) — se
     nenhum precisou mudar, diga isso explicitamente em vez de omitir.
   Use o checklist do modelo de PR. Antes de marcar uma issue como concluída, confira também o
   registro de execução da tarefa da pessoa responsável e o estado da spec correspondente.

---

## 🔒 5. Segurança e Variáveis de Ambiente

* **Nunca commite chaves secretas ou credenciais:** Arquivos `.env` locais estão no `.gitignore`.
* Mantenha apenas o arquivo `.env.example` versionado com valores de exemplo fictícios (`EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co`).

---

## 📄 6. Manter a documentação sempre atualizada

Documentação desatualizada é pior do que nenhuma documentação — faz quem lê confiar em algo
errado. Sempre que seu PR mudar código, dados ou estrutura, atualize na mesma entrega (não
depois) o que for afetado:

* **Criou, renomeou ou apagou um arquivo que a documentação cita** (teste, spec, componente,
  fluxo do Maestro)? Corrija todo link/nome citado — faça uma busca (`grep -rn "nome-antigo"`)
  antes de abrir o PR. Já encontramos documentação referenciando arquivos renomeados e até
  arquivos duplicados/órfãos que ninguém tinha apagado.
* **Mudou contagem de testes, cobertura, ou estrutura de pastas?** Atualize `docs/estado.md` e,
  se pertinente, `docs/qualidade.md` e o `README.md` — não deixe um número antigo ("31 testes em
  6 arquivos") sobreviver à mudança que o tornou errado.
* **Criou uma ADR nova?** Acrescente-a ao índice em `docs/adr/README.md` e ao `README.md` da raiz
  (seção "Arquitetura e Decisões"). ADRs aceitos não são reescritos — se uma decisão mudar,
  crie uma nova ADR e linke as duas.
* **Implementou ou concluiu uma tarefa de `specs/*/tasks.md`?** Marque a tarefa como concluída —
  não deixe a tarefa como pendente depois de pronta, nem o contrário.
* **Concluiu uma issue?** Atualize seu checklist e a issue geral relacionada. Só feche quando
  código, documentação e validação exigida estiverem alinhados; registre falhas e limites em
  vez de declarar a entrega validada sem evidência.
* **Mudou uma decisão de produto já registrada em `docs/produto.md`?** Atualize a tabela de
  decisões lá, não só o código.
* Antes de abrir o PR, rode uma busca pelo que você mudou (`grep -rln "<nome-antigo-ou-numero>"
  --include="*.md" .`) para achar documentação que ficou para trás — é o jeito mais rápido de
  pegar isso antes de alguém mais tarde perder tempo seguindo um link morto.

O [modelo de PR](.github/PULL_REQUEST_TEMPLATE.md) reúne esses itens num checklist visível a
cada entrega. Mesmo sem abrir PR, use a mesma lista antes de considerar a tarefa concluída.
