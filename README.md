# Ipebook

Base independente em Expo, React Native e TypeScript, com arquitetura MVVM sofisticada em sete camadas e suíte completa de testes automatizados baseada na norma **ISO/IEC 25010**.

Projeto avaliativo do curso de Tecnologia em Análise e Desenvolvimento de Sistemas do IFPI — Campus Piripiri, integrando três disciplinas:

* **Engenharia de Software III** — arquitetura, estratégia de testes e qualidade (ISO/IEC 25010).
* **Programação para Dispositivos Móveis (PDM)** — implementação do app em Expo/React Native.
* **Interação Humano-Computador (IHC)** — design system formal, acessibilidade (WCAG 2.1/2.2 AA) e usabilidade.

---

## 📄 Produto e documentação

* Objetivo, público, modalidade e decisões de produto em [`docs/produto.md`](docs/produto.md).
* Estado atual e próximos passos em [`docs/estado.md`](docs/estado.md).
* Design system (IHC): paleta, tipografia, espaçamento e acessibilidade em [`docs/design-system.md`](docs/design-system.md).
* Sistema de design completo (tokens, 23 componentes com anatomia/estados/acessibilidade/código, princípios e fluxos) em [`design-system/`](design-system/README.md), para quem for implementar as telas das specs 003 e 004.
* Primeira jornada funcional especificada (ainda não implementada): [`specs/003-autenticacao-e-cadastro-de-anuncio/`](specs/003-autenticacao-e-cadastro-de-anuncio/spec.md) e [`specs/004-negociacao-simples/`](specs/004-negociacao-simples/spec.md).
* Divisão de tarefas da equipe (decisões pendentes e trabalho técnico) em [`tasks/README.md`](tasks/README.md).

---

## 🚀 Como Começar

Na raiz do projeto, com Node.js (v24 LTS recomendada) e npm:

```bash
npm ci
npm run web
```

Para executar em dispositivo nativo:
```bash
npm run android  # Dispositivo/Emulador Android
npm run ios      # Dispositivo/Simulador iOS (macOS) — disponível, mas fora do escopo de validação
```

> Plataformas suportadas na primeira entrega: **Android e Web** (decisão registrada em [`docs/produto.md`](docs/produto.md)). iOS fica fora do escopo por enquanto; o comando continua disponível para quem tiver ambiente macOS, mas não é alvo de validação desta entrega.

---

## 🧪 Estratégia de Testes Automatizados (Engenharia de Software III)

A estratégia de testes foi desenvolvida para atender aos requisitos da disciplina de Engenharia de Software III (IFPI Campus Piripiri - Prof. Jeferson Soares), estruturada em suítes organizadas por responsabilidade.

### 📋 Comandos de Teste e Cobertura

```bash
# 1. Executar todos os testes automatizados
npm test

# 2. Gerar relatório de cobertura de código com limiar mínimo de 80%
npm run test:coverage

# Ou diretamente pelo parâmetro nativo:
npm test -- --coverage

# 3. Execução agregada de validação (Typescript estrito + Arquitetura + Cobertura)
npm run validate
```

### 📂 Organização das Suítes de Testes

| Categoria | Localização | O que valida | Evidência / Ferramenta |
| :--- | :--- | :--- | :--- |
| **Testes Unitários** | `tests/unit/` | Funções puras, validações de payload de livro, limites de caracteres e regras dos casos de uso. | Vitest (`bookValidator.test.ts`, `bookUseCases.test.ts`) |
| **Testes de Hooks** | `tests/hooks/` | Ciclo de vida do hook `useHomeViewModel`, estado inicial, recarregamento, concorrência e tratamento seguro de erros. | `renderHook` (`useHomeViewModel.test.tsx`) |
| **Testes de Componentes** | `tests/components/` | Renderização semântica da View, cabeçalhos, rótulos de acessibilidade (`accessibilityRole`) e estado vazio. | RNTL (`homeView.test.tsx`) |
| **Componentes com Mock** | `tests/components-mocked/` | Isolamento determinístico da View para forçar cenários extremos (falha de rede, carregamento, botão de retry). | RNTL com `vi.mock` (`homeViewMocked.test.tsx`) |
| **Testes de Integração** | `tests/integration/` | Integração real entre múltiplas camadas: View + ViewModel + Casos de Uso + Repositório em memória sem mocks de negócio. | RNTL integrado (`homeIntegration.test.tsx`) |
| **Testes End-to-End (E2E)** | `.maestro/` | 3 fluxos críticos reais executados em dispositivo ou emulador móvel. | Maestro (`01-catalogo-inicial.yaml`, `02-recuperacao-erro-retry.yaml`, `03-acessibilidade-e-elementos.yaml`) |

---

## 📐 Qualidade de Software segundo a ISO/IEC 25010

Conforme as diretrizes da disciplina, o projeto adotou três características essenciais da norma ISO/IEC 25010:

### 1. Adequação Funcional (Completude e Corretude)
* **Por que é importante:** O leitor precisa ter certeza de que as informações do acervo estão íntegras, que dados inválidos são rejeitados antes de afetar o sistema e que a listagem de livros é precisa.
* **Funcionalidade / Tela:** Regras de entidade e consulta ao catálogo (`src/model/validators/bookValidator.ts`, tela Home).
* **Como foi atendida:** Implementação de validações puras de borda e orquestração por casos de uso no padrão MVVM.
* **Teste comprovatório:** [`tests/unit/bookValidator.test.ts`](tests/unit/bookValidator.test.ts) e [`tests/integration/homeIntegration.test.tsx`](tests/integration/homeIntegration.test.tsx).

### 2. Confiabilidade (Tolerância a Falhas e Recuperabilidade)
* **Por que é importante:** Falhas de rede ou requisições assíncronas concorrentes não podem congelar a aplicação nem expor dados sensíveis em mensagens de erro.
* **Funcionalidade / Tela:** Tratamento de erros, sanitização e botão de nova tentativa (*retry*) na Home.
* **Como foi atendida:** A ViewModel sanitiza mensagens técnicas desconhecidas, cancela efeitos de respostas obsoletas (*race conditions*) e fornece a ação de recuperação `reload()`.
* **Teste comprovatório:** [`tests/hooks/useHomeViewModel.test.tsx`](tests/hooks/useHomeViewModel.test.tsx) e [`tests/components-mocked/homeViewMocked.test.tsx`](tests/components-mocked/homeViewMocked.test.tsx).

### 3. Usabilidade / Acessibilidade (Proteção contra Erros e Operabilidade)
* **Por que é importante:** Garantir que pessoas usuárias de tecnologias assistivas (leitores de tela) possam navegar e operar o acervo de livros com clareza semântica.
* **Funcionalidade / Tela:** Estrutura semântica e botões na tela Home ([`src/view/home.tsx`](src/view/home.tsx)).
* **Como foi atendida:** Uso de propriedades semânticas nativas (`accessibilityRole="header"`, `accessibilityRole="alert"`, `accessibilityLabel="Carregando livros"` e `accessible={false}` em adereços visuais).
* **Teste comprovatório:** [`tests/components/homeView.test.tsx`](tests/components/homeView.test.tsx) e fluxo E2E [`03-acessibilidade-e-elementos.yaml`](.maestro/03-acessibilidade-e-elementos.yaml).

---

## 📱 Execução dos Testes E2E com Maestro

Consulte as instruções detalhadas em [`.maestro/README.md`](.maestro/README.md).

```bash
# Executar suíte E2E completa no emulador:
maestro test .maestro/
```

---

## 🗣️ Guia para Defesa Oral com o Professor

* **P: Por que criar um mock para o teste de componente e o que aconteceria se ele fosse removido?**
  * *R:* O mock da ViewModel em `homeViewMocked.test.tsx` isola a interface visual para testar de forma determinística estados raros ou difíceis de forçar (como queda repentina de conexão e carregamento infinito). Se removido, o teste dependeria do timing assíncrono real das camadas inferiores, tornando-se um teste de integração e podendo quebrar por motivos alheios à renderização da tela.
* **P: Quando usar `getBy`, `queryBy` e `findBy` no Testing Library?**
  * *R:* `getBy` para elementos síncronos que **obrigatoriamente devem existir** (falha se não achar); `queryBy` para **afirmar ausência** de elementos (retorna `null` em vez de lançar erro, ideal para asserções como `.toBeNull()`); `findBy` para elementos que **surgem assincronamente** após promessas ou transições de estado.
* **P: Por que preferir consultas semânticas (`getByText`, `getByRole`) a `testID`?**
  * *R:* Porque consultas semânticas simulam o comportamento real da pessoa usuária e validam a acessibilidade do software. Um `testID` testa um detalhe interno de implementação que a pessoa usuária não percebe.
* **P: Por que 100% de cobertura não significa que o app está livre de bugs?**
  * *R:* A cobertura mede apenas as linhas executadas pelo motor de testes, não a qualidade das asserções (`expect`) nem a abrangência de combinações de dados e casos de borda não previstos.

---

## 🏛️ Arquitetura e Decisões

* Arquitetura em 7 camadas documentada em [`docs/arquitetura.md`](docs/arquitetura.md).
* Decisões arquiteturais registradas em ADRs (índice completo em [`docs/adr/README.md`](docs/adr/README.md)):
  - [ADR 0001 — Adotar ADRs](docs/adr/0001-adotar-adrs.md)
  - [ADR 0002 — Adotar Expo e MVVM sofisticado](docs/adr/0002-adotar-expo-mvvm.md)
  - [ADR 0003 — Estratégia de testes com RNTL, Vitest Coverage e Maestro sob a ISO/IEC 25010](docs/adr/0003-estrategia-testes-iso25010.md)
  - [ADR 0004 — Design System, tokens contratuais e diretrizes de IHC](docs/adr/0004-design-system-e-tokens-ihc.md)
  - [ADR 0005 — Modalidade do produto: venda, troca e doação de livros físicos](docs/adr/0005-modalidade-venda-troca-doacao.md)
  - [ADR 0006 — Haverá conta: e-mail/senha e login com Google](docs/adr/0006-conta-com-email-e-google.md)
  - [ADR 0007 — Serifa da marca: Source Serif 4 Bold](docs/adr/0007-serifa-da-marca.md)
  - [ADR 0008 — Sem dark mode nesta etapa; Android Material 3, iOS Liquid Glass](docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md)
  - [ADR 0009 — design-kit/tokens.json como fonte única de tokens](docs/adr/0009-design-kit-tokens-como-fonte-unica.md) (substituído pelo 0010)
  - [ADR 0010 — design-system/ substitui design-kit/ como fonte única de design](docs/adr/0010-design-system-substitui-design-kit.md)

---

## 👥 Equipe do Projeto (IFPI Piripiri - TADS)

* **Instituição:** Instituto Federal do Piauí — Campus Piripiri
* **Disciplinas:** Engenharia de Software III, Programação para Dispositivos Móveis (PDM) e Interação Humano-Computador (IHC) (Prof. Jeferson Soares)
* **Integrantes:**
  1. **Micael Cardoso Reis** ([@Ghostyxseven](https://github.com/Ghostyxseven))
  2. **Maria Clara Almeida Martins** ([@clarinhamartins](https://github.com/clarinhamartins))
  3. **Antonio Carlos Gomes** ([@gomes738](https://github.com/gomes738))
  4. **Eric Vinícius dos Santos Oliveira** ([@Eric2025gh](https://github.com/Eric2025gh))
* Mais detalhes em [`docs/equipe.md`](docs/equipe.md).

---

## 🤝 Como Contribuir

Consulte as diretrizes completas de colaboração, política de branches, fluxo de Git e convenção de commits em [**CONTRIBUTING.md**](CONTRIBUTING.md).

