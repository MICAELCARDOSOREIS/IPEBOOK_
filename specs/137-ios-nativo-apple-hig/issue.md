# Issue — [iOS Nativo] Adequar aplicativo iPhone nativo (Expo/React Native) ao Apple HIG e Liquid Glass sem alterar Android/Web

* **Responsável Principal (Maior Responsabilidade):** Eric Vinícius dos Santos Oliveira ([@Eric2025gh](https://github.com/Eric2025gh))
* **Apoio da Equipe:**
  * Micael Cardoso Reis ([@MICAELCARDOSOREIS](https://github.com/MICAELCARDOSOREIS)) — arquitetura MVVM, DI e validações automatizadas
  * Maria Clara Almeida Martins ([@clarinhamartins](https://github.com/clarinhamartins)) — Design System, acessibilidade e referência do trabalho anterior de PWA no iPhone ([spec 136](../136-pwa-iphone-apple-hig/issue.md))
  * Antonio Carlos Gomes ([@gomes738](https://github.com/gomes738)) — fluxos de negociação, anúncios e moderação
* **Labels:** `pessoa:eric`, `enhancement`, `ios`, `apple-hig`, `accessibility`, `documentation`
* **Branch base:** `develop`
* **Branch sugerida:** `feature/ios-nativo-apple-hig`
* **Inventário de Telas iPhone no Figma:** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (Canvas `APP · 20 · iPhone · iOS 26`, 144 telas com links modo Dev)
* **Documentos de Referência:**
  - [ADR 0008 — Diretrizes Visuais por Plataforma](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md) (Android segue Material Design 3; iOS segue Liquid Glass / Apple HIG)
  - [Spec 136 — PWA/iOS no Safari](../136-pwa-iphone-apple-hig/issue.md) (complementar para web/Safari; esta issue foca no **app nativo iOS**)

---

## 📌 Contexto e Objetivo

O **IpêBook** já possui acabamento consolidado em **Material Design 3** no Android e layout próprio na **Web**, além de ajustes específicos de PWA no Safari ([spec 136](../136-pwa-iphone-apple-hig/issue.md)). No entanto, para a versão **nativa de iPhone (iOS via Expo / React Native)**, é necessário evoluir a experiência para seguir de forma fiel o **Apple Human Interface Guidelines (HIG)** e a linguagem visual **Liquid Glass (iOS 26)** definida no [ADR 0008](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md).

O foco desta entrega — com **Eric Vinícius** liderando a definição de escopo, priorização, acompanhamento técnico e validação das entregas de iOS nativo com apoio do restante da equipe — é:

1. **Conformidade Nativa com Apple HIG:** navegação, gestos de retorno (*swipe back*), *safe areas* nativas (Dynamic Island, Notch e Home Indicator), tipografia, hierarquia visual e alvos de toque mínimos de **44×44 pt**.
2. **Linguagem Visual iOS (Liquid Glass):** superfícies translúcidas (`glass-fill` / `glass-stroke`) e controles flutuantes nativos do iOS conforme o inventário do Figma (`APP · 20 · iPhone · iOS 26`).
3. **Configuração e Build iOS no Expo:** revisar `app.json` (bundle identifier, permissões de câmera/galeria/localização com descrições em português, ícones iOS, splash screen e suporte a `expo run:ios` / EAS).
4. **Isolamento Total de Plataformas:** garantir que **nenhuma alteração** degrade ou modifique o comportamento e o visual do **Android (MD3)** nem da **Web**.

---

## 🛑 Regra de Ouro: Escopo Isolado ("Sem Mexer no Android/Web")

- **Isolamento por plataforma:** Toda adaptação específica de iOS nativo deve ficar isolada via `Platform.OS === 'ios'`, arquivos `.ios.tsx` ou tokens/estilos condicionais exclusivos para iOS.
- **Preservar Android e Web:** O Android continua estritamente em Material Design 3 e a Web mantém seu layout responsivo e PWA atual.
- **Seguir MVVM:** Manter a arquitetura em camadas (`View -> ViewModel -> Service/Entity`), sem regras de negócio nas views.

---

## 📋 Sub-issues para Execução (Detalhamento Completo)

As 144 telas do Figma (`APP · 20 · iPhone · iOS 26`) e as 44 rotas de `src/app/` foram divididas em **8 sub-issues** no arquivo [`issues.md`](./issues.md), acompanhadas por [`spec.md`](./spec.md), [`plan.md`](./plan.md) e [`tasks.md`](./tasks.md):

1. **Issue 1:** Configurar `app.json`, `infoPlist` (PT-BR), deep links e ADR de escopo iOS (`@Eric2025gh`)
2. **Issue 2:** Base Liquid Glass e componentes Apple HIG no Design System (`@Eric2025gh` + apoio `@clarinhamartins` e `@MICAELCARDOSOREIS`)
3. **Issue 3:** Fluxo 01 — Acesso, Onboarding e Escolha de Bairro (`17 telas Figma`) (`@Eric2025gh`)
4. **Issue 4:** Fluxos 02 e 03 — Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público (`22 telas Figma`) (`@Eric2025gh` + apoio `@clarinhamartins`)
5. **Issue 5:** Fluxos 04 e 05 — Publicação e Minha Estante (`29 telas Figma`) (`@Eric2025gh` + apoio `@gomes738`)
6. **Issue 6:** Fluxos 06 e 08 — Conversas, Negociação, Encontro, Entrega e Compartilhamento (`24 telas Figma`) (`@Eric2025gh` + apoio `@gomes738`)
7. **Issue 7:** Fluxos 07, 09 e 10 — Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais (`33 telas Figma`) (`@Eric2025gh`)
8. **Issue 8:** Fluxos 11 e 12 — Permissões iOS, Dynamic Island/Live Activity, Dark Mode, Reduzir Transparência, Dynamic Type e VoiceOver (`19 telas Figma`) (`@Eric2025gh` + apoio `@MICAELCARDOSOREIS` e `@clarinhamartins`)

---

## 🔍 Escopo Técnico (Checklist iOS Nativo — Apple HIG)

### 1. Configuração Nativa e Permissões (`app.json` / Expo iOS)
- [ ] Revisar configurações da seção `ios` em `app.json` (bundleIdentifier, buildNumber, supportsTablet, ícones e splash).
- [ ] Garantir textos claros em português nas `infoPlist` (câmera para QR Code/fotos de livros, biblioteca de fotos, localização para pontos de encontro em Piripiri).
- [ ] Validar links universais / deep links no iOS (ex.: login Google nativo e compartilhamento).

### 2. Navegação, Safe Areas e Gestos Nativos (Apple HIG)
- [ ] Garantir respeito às *Safe Areas* nativas (Notch / Dynamic Island no topo e Home Indicator na base) em todas as telas principais e modais.
- [ ] Validar transição nativa iOS (`Stack` com *swipe-back* habilitado onde apropriado) e cabeçalhos alinhados ao padrão Apple HIG.
- [ ] Garantir que a barra inferior flutuante / *Tab Bar* no iOS siga as proporções e o acabamento definidos no Figma (`APP · 20 · iPhone · iOS 26`), sem colidir com o Home Indicator.
- [ ] Garantir comportamento adequado de teclado (`KeyboardAvoidingView` / ajuste nativo do iOS) nos formulários de anúncio, autenticação e chat.

### 3. Componentes, Feedback Tátil e Acessibilidade (iOS)
- [ ] Alvos de toque mínimos de **44×44 pt** em todos os botões, abas e ícones interativos.
- [ ] Feedback visual e tátil (haptics quando aplicável) coerente com o padrão nativo iOS.
- [ ] Modais e *Bottom Sheets* com *drag handle*, cantos contínuos e fechamento por gesto.
- [ ] Compatibilidade básica com **VoiceOver** e Dynamic Type / legibilidade de contraste (WCAG 2.1 AA).

### 4. Validação das Telas de Referência (Figma iOS 26)
Consultar [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) para validar os principais fluxos no simulador/dispositivo iOS:
- [ ] **Fluxo 01 — Acesso:** Boas-vindas, Entrar, Criar conta.
- [ ] **Fluxo 02 — Início & Descoberta:** Início, Explorar e Busca.
- [ ] **Fluxo 03 — Detalhe do Livro:** Visualização do livro e fluxo de proposta/reserva.
- [ ] **Fluxo 04 — Anúncio:** Cadastro e edição de anúncio com upload de foto e teclado iOS.
- [ ] **Fluxo 05 — Minha Estante:** Listagem e filtros.
- [ ] **Fluxo 06 — Mensagens:** Chat de negociação e conclusão de encontro.
- [ ] **Fluxo 07 — Perfil:** Dados do usuário, notificações e configurações.

---

## 👥 Divisão de Responsabilidades Sugerida

- **Eric Vinícius (`@Eric2025gh`) — Responsável Principal:**
  - Liderar o planejamento, decomposição da especificação (`spec.md`, `plan.md`, `tasks.md`), coordenação das entregas iOS nativo, configuração `ios` no `app.json`, revisão de conformidade com o Apple HIG e validação final dos fluxos no iPhone/simulador.
- **Micael, Maria Clara e Antonio Carlos — Apoio:**
  - Apoiar nos ajustes pontuais dos módulos que cada um domina (arquitetura/DI/CI, Design System/acessibilidade e fluxos de negociação/anúncio) quando houver impacto específico em `.ios.tsx`.

---

## ✅ Critérios de Aceite

1. A especificação completa da funcionalidade (`spec.md`, `plan.md`, `tasks.md`) está documentada em português em `specs/137-ios-nativo-apple-hig/`.
2. O app iOS nativo (`npm run ios` / build iOS) respeita Safe Areas (Dynamic Island / Notch / Home Indicator), teclado nativo e gestos padrão do iOS.
3. Os componentes iOS seguem o Apple HIG (alvos ≥ 44×44 pt, hierarquia visual e estilo Liquid Glass conforme ADR 0008 e Figma iOS 26).
4. **O comportamento e o visual no Android (MD3) e na Web permanecem 100% inalterados.**
5. As verificações automatizadas do projeto passam sem falhas:
   ```bash
   npm run typecheck
   npm run lint
   npm run check:architecture
   npm run check:design-system
   npm run test
   ```
