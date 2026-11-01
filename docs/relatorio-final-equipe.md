# Relatório Final Consolidado da Equipe — Ipebook

**Projeto:** Ipebook — Aplicativo Comunitário de Circulação e Troca de Livros  
**Instituição:** Instituto Federal de Educação, Ciência e Tecnologia do Piauí (IFPI) — Campus Piripiri  
**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)  
**Disciplinas:** Engenharia de Software III / Programação para Dispositivos Móveis  
**Responsável pela Consolidação:** Eric Vinícius dos Santos Oliveira  
**Data:** Outubro de 2026  

---

## 1. Visão Geral e Contexto do Projeto

O **Ipebook** nasceu com o propósito de suprir a carência de uma plataforma hiperlocal dedicada à circulação, doação, venda acessível e troca de livros físicos no município de Piripiri - PI. 

Ao longo do semestre, o projeto evoluiu de uma ideia exploratória para uma plataforma robusta multiplataforma (Android e Web), alinhando padrões rigorosos de Engenharia de Software com as práticas recomendadas de Programação Móvel.

---

## 2. Consolidação das Entregas por Integrante

### 2.1 Micael Cardoso Reis
- **Arquitetura e Governança:** Concepção da estrutura MVVM sofisticada em 7 camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), automação do validador de fronteiras arquiteturais (`check:architecture`).
- **Core de UI e Design System:** Implementação dos tokens visuais, componentes fundamentais e migração integral para o Material 3 Expressive (ADR 0084).
- **Testes e Infraestrutura:** Pipeline de Integração Contínua (CI) com GitHub Actions, cobertura de testes com Vitest acima de 80%, deploy contínuo na Vercel e Cloudflare Pages.
- **Funcionalidades Críticas:** Mecanismo hiperlocal por bairros de Piripiri, sistema de busca textual com trigramas PostgreSQL (`pg_trgm`), histórico de encontros com mapa e confirmação por QR Code.

### 2.2 Maria Clara Almeida Martins
- **Identidade e Interação Humano-Computador (IHC):** Estruturação do Design System formal, contratos de tokens semânticos, paleta inspirada no Ipê e tipografia serifada da marca.
- **Trilha de Autenticação e Acesso:** Implementação dos fluxos de login por e-mail e Magic Link, tratamento de links expirados, tela de boas-vindas, onboarding e redefinição de senha (Spec 003 e Spec 033).
- **Modelagem de Domínio:** Entidades do núcleo de negócios (`Book`, `User`, `Rating`), contratos de casos de uso e validação de acessibilidade (WCAG 2.1 AA) em componentes visuais.
- **Perfil e Moderação:** Gestão de perfil do usuário, histórico de avaliações recebidas, fluxo de denúncias e bloqueio de usuários.

### 2.3 Antonio Carlos Gomes
- **Negociação e Ciclo de Vida do Livro:** Implementação dos casos de uso e infraestrutura da negociação simples (Spec 004), incluindo estados de pedido (pendente, aceito, concluído e cancelado).
- **Cadastro e Gestão de Anúncios:** Fluxo completo de anúncio de livros (Spec 003), validação de ISBN com integração à BrasilAPI e suporte a coleções/box de livros.
- **Segurança e Moderação:** Validação de regras de negócio, limites anti-abuso e painel de moderação para conformidade com termos da comunidade.

### 2.4 Eric Vinícius dos Santos Oliveira
- **Definição de Produto e Plataformas:** Condução e formalização da decisão estratégica inicial de plataformas (Android e Web prioritárias, postergando iOS conforme ADR 0040 e Tarefa 4).
- **Consolidação Técnica e Documental:** Elaboração deste relatório consolidado de entregas, compilação dos relatórios de conformidade e rastreabilidade para a banca avaliadora.

---

## 3. Arquitetura e Decisões Técnicas (ADRs)

O projeto adotou o padrão de **Architecture Decision Records (ADRs)** desde a sua concepção, totalizando mais de 80 decisões registradas em `docs/adr/`. Destacam-se:

| ADR | Decisão | Impacto |
| --- | --- | --- |
| **0002** | Expo + MVVM Sofisticado | Separação estrita em 7 camadas com injeção de dependências (`di/`) |
| **0003** | Estratégia ISO/IEC 25010 | Qualidade balizada em Adequação Funcional, Confiabilidade e Usabilidade |
| **0005** | Modalidades (Venda, Troca, Doação) | Flexibilidade no modelo comunitário sem transação monetária interna |
| **0012** | Supabase com Row Level Security (RLS) | Segurança e isolamento de dados no nível do banco |
| **0050** | Seletor de Bairro Comunitário | Enfoque hiperlocal específico para a realidade de Piripiri |
| **0070** | Conclusão de Troca via QR Code | Verificação presencial segura entre os moradores |
| **0084** | Adoção do Material 3 Expressive | Modernização visual com suporte a temas, feedback tátil e ergonomia |

---

## 4. Garantia da Qualidade e Cobertura de Testes

O projeto segue rigorosamente o modelo de qualidade da **ISO/IEC 25010**:

- **Verificação Automatizada:** `npm run test` com Vitest, cobrindo testes unitários de entidades, casos de uso, viewmodels e componentes visuais com mocks isolados.
- **Métricas Atingidas:**
  - Statements: > 90%
  - Branches: > 80% (conforme limiar de qualidade estabelecido)
  - Functions: > 90%
  - Lines: > 90%
- **Verificação Estática e Linting:** Biome configurado para análise e formatação uniforme de código, além do validador customizado de camadas arquiteturais.

---

## 5. Conclusão e Estado Atual da Entrega

O Ipebook atinge com sucesso o marco de versão estável para o ciclo avaliativo, dispondo de:
1. Catálogo comunitário com paginação e filtros hiperlocais;
2. Autenticação e perfil de usuário completos;
3. Fluxo de ponta a ponta de negociação e agendamento de encontros;
4. Leitor de código de barras para ISBN integrado à câmera;
5. Suporte a anúncios individuais e box de livros;
6. Aplicação Web responsiva publicada e pronta para testes.
