# Qualidade, Testes Automatizados e Norma ISO/IEC 25010

Este documento detalha a estratégia de engenharia da qualidade do Ipebook, a suíte de testes automatizados multinível, a comprovação das características da norma **ISO/IEC 25010** e o roteiro preparatório para a defesa oral do projeto.

---

## 1. Comandos de Validação e Execução

Executar na raiz do projeto:

```bash
# Execução rápida de toda a suíte de testes
npm test

# Execução com relatório e conferência de cobertura de código (mínimo 80%)
npm run test:coverage

# Validação unificada obrigatória (TypeScript + Arquitetura + Cobertura)
npm run validate

# Verificação do build estático web
npm run build:web
```

O comando `npm run validate` é rigoroso e composto: caso qualquer checagem estática, regra arquitetural ou teste falhe, o processo é abortado imediatamente com código de saída diferente de zero.

Desde a spec 007, `validate` também executa `npm run test:sql`, que aplica as migrações em
PostgreSQL local via PGlite e verifica cenários de acesso permitido e negado. Esse teste não
substitui a aplicação das migrações e a conferência de RLS no Supabase hospedado.

---

## 2. Fundamentação na Norma ISO/IEC 25010

A qualidade do software do Ipebook foi projetada com base no modelo de produto da norma internacional **ISO/IEC 25010**, priorizando três características fundamentais:

| Característica ISO/IEC 25010 | Subcaracterística | Como o Ipebook implementa e comprova | Suíte de Testes Associada |
| :--- | :--- | :--- | :--- |
| **Adequação Funcional** (*Functional Suitability*) | **Completude e Corretude** | Regras puras de domínio validam títulos, autores, sanitização de strings, limites mínimos/máximos e casos de borda; casos de uso orquestram e isolam dados sem mutações colaterais. | [`tests/unit/bookValidator.test.ts`](../tests/unit/bookValidator.test.ts)<br>[`tests/unit/bookUseCases.test.ts`](../tests/unit/bookUseCases.test.ts)<br>[`tests/integration/homeIntegration.test.tsx`](../tests/integration/homeIntegration.test.tsx) |
| **Confiabilidade** (*Reliability*) | **Tolerância a Falhas e Recuperabilidade** | A camada de ViewModel gerencia concorrência (descarte de requisições antigas em corridas assíncronas), intercepta falhas técnicas para nunca expor dados internos sensíveis ao usuário e fornece mecanismo determinístico de retry. | [`tests/hooks/useHomeViewModel.test.tsx`](../tests/hooks/useHomeViewModel.test.tsx)<br>[`tests/components-mocked/homeViewMocked.test.tsx`](../tests/components-mocked/homeViewMocked.test.tsx) |
| **Usabilidade** (*Usability*) | **Acessibilidade e Operabilidade** | A View expõe semântica nativa clara (`accessibilityRole` de `header`, `alert` e `button`), rótulos para leitores de tela (`accessibilityLabel`) e oculta elementos puramente decorativos (`accessible={false}`). | [`tests/components/homeView.test.tsx`](../tests/components/homeView.test.tsx)<br>[`.maestro/03-acessibilidade-e-elementos.yaml`](../.maestro/03-acessibilidade-e-elementos.yaml) |

---

## 3. Arquitetura da Suíte de Testes (Pirâmide de Testes)

A suíte adota a pirâmide de testes para garantir velocidade, alta fidelidade e facilidade de manutenção:

```text
               /              /  \      E2E (.maestro/)
             /    \     3 fluxos declarativos mobile
            /------           /        \   Integração (tests/integration/)
          /          \  View + ViewModel + UseCase + DataSource real
         /------------        /              \  Componentes com RNTL e Mocks (tests/components/ e tests/components-mocked/)
       /                \ Renderização semântica, acessibilidade e isolamento de tela
      /------------------     /                    \ Unitários e Hooks (tests/unit/ e tests/hooks/)
    /                      \ Regras puras, validadores e ciclo de vida de ViewModel
   /------------------------```

### 3.1. Testes Unitários de Domínio (`tests/unit/`)
- **`bookValidator.test.ts` (13 testes):** Validação de limites (2 a 150 caracteres para título, 2 a 100 caracteres para autor), casos de borda exatos, rejeição de tipos primitivos inválidos, múltiplos erros acumulados e formatação de exibição.
- **`bookUseCases.test.ts` (4 testes):** Validação das regras de negócio dos casos de uso, imutabilidade de entidades devolvidas pelo datasource e propagação tipada de erros de domínio.

### 3.2. Testes de Hooks (`tests/hooks/`)
- **`useHomeViewModel.test.tsx` (5 testes):** Testes executados com `renderHook`, validando transição de estados de carregamento, sucesso com catálogo populado, tratamento de `DomainError`, sanitização de exceções técnicas inesperadas e proteção contra *race conditions* assíncronas.

### 3.3. Testes de Componentes com RNTL (`tests/components/`)
- **`homeView.test.tsx` (4 testes):** Renderização da tela inicial com `@testing-library/react-native`, verificando semântica de cabeçalhos (`header`), mensagens contextuais e comportamento visual no catálogo vazio.

### 3.4. Testes de Componentes com Mock (`tests/components-mocked/`)
- **`homeViewMocked.test.tsx` (3 testes):** Mock explícito de `useHomeViewModel` para simular estados de carregamento forçado (`ActivityIndicator`), alerta de erro (`accessibilityRole="alert"`) e disparo de nova tentativa ao pressionar o botão "Tentar novamente".

### 3.5. Testes de Integração Real (`tests/integration/`)
- **`homeIntegration.test.tsx` (2 testes):** Exercita o fluxo completo de ponta a ponta sem nenhum mock de regra de negócio, ligando `MemoryBookDataSource` -> `BookUseCases` -> `useHomeViewModel` -> Renderização nativa da View.

### 3.6. Testes Ponta a Ponta Mobile (`.maestro/`)
- **`01-catalogo-inicial.yaml`:** Fluxo E2E de inicialização e visualização do catálogo inicial.
- **`02-recuperacao-erro-retry.yaml`:** Fluxo E2E de recuperação e nova tentativa.
- **`03-acessibilidade-e-elementos.yaml`:** Fluxo E2E de acessibilidade e rolagem.

---

## 4. Cobertura de Código

A verificação é realizada pelo `@vitest/coverage-v8`, exigindo o mínimo de 80% em todas as métricas.

**Resultado aferido:**
- **Statements:** > 98% (requisito: >= 80%)
- **Branches:** > 95% (requisito: >= 80%)
- **Functions:** 100% (requisito: >= 80%)
- **Lines:** 100% (requisito: >= 80%)

---

## 5. Roteiro e Guia para a Defesa Oral

Este guia foi elaborado para apoiar a apresentação técnica perante os avaliadores:

### P1: "Por que escolheram a arquitetura MVVM com 7 camadas em vez de colocar tudo em componentes React?"
> **Resposta:** *"O MVVM desacopla completamente a lógica de apresentação e de negócio da renderização visual. Ao dividir o sistema em Model (entidades puras e contratos), UseCases (regras de negócio), ViewModel (estado observável), View (componentes React Native) e Infra (fontes de dados), garantimos que o domínio possa ser testado de forma rápida e unitária em Node.js, sem necessidade de emulador ou ciclo de vida de UI. Além disso, a injeção de dependências permite trocar a fonte de dados (ex: de memória para SQLite ou API REST) sem alterar uma única linha da interface gráfica."*

### P2: "Como vocês comprovaram a qualidade segundo a norma ISO/IEC 25010?"
> **Resposta:** *"Mapeamos três características centrais da ISO/IEC 25010 diretamente para testes automatizados reproduzíveis:*
> 1. *Adequação Funcional: garantida por 17 testes unitários e de integração que validam regras de cadastro, limites de caracteres e consistência de dados;*
> 2. *Confiabilidade: comprovada por testes de hooks que simulam falhas de rede, sanitizam mensagens para evitar vazamento de dados internos e protegem contra condições de corrida;*
> 3. *Usabilidade: atestada por testes com React Native Testing Library que verificam acessibilidade para leitores de tela (papéis de header, alert e button) e fluxos E2E com Maestro."*

### P3: "Por que usaram Maestro em vez de Playwright para os testes ponta a ponta?"
> **Resposta:** *"O Ipebook é uma aplicação mobile React Native/Expo. O Playwright é projetado primordialmente para a web desktop e depende de drivers de navegador que não reproduzem a árvore de acessibilidade nem os gestos nativos de dispositivos móveis. O Maestro é a ferramenta declarativa de ponta para automação mobile real, testando o aplicativo diretamente no emulador Android e no simulador iOS sem instrumentação invasiva ou dependências frágeis."*

### P4: "Como garantiram que os testes não quebrem por acoplamento com detalhes de implementação?"
> **Resposta:** *"Seguimos os princípios da Testing Library: testamos o que o usuário vê e como ele interage. Em vez de verificar estados internos ou instâncias de classes, consultamos a tela por `getByRole`, `getByText` e `getByLabelText`. Mocks foram utilizados de forma estrita e fundamentada apenas onde era necessário isolar cenários não-determinísticos (como simular queda instantânea de rede no teste de componente mockado)."*
