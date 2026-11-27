# Issue — [iOS Nativo] Adequar aplicativo iPhone nativo (Expo/React Native) ao Apple HIG e Liquid Glass sem alterar Android/Web

* **Responsável Principal (Maior Responsabilidade):** Eric Vinícius dos Santos Oliveira ([@Eric2025gh](https://github.com/Eric2025gh))
* **Apoio da Equipe:**
  * Micael Cardoso Reis ([@MICAELCARDOSOREIS](https://github.com/MICAELCARDOSOREIS)) — arquitetura MVVM, DI, contratos e validações automatizadas
  * Maria Clara Almeida Martins ([@clarinhamartins](https://github.com/clarinhamartins)) — Design System Liquid Glass, Descoberta/Busca, Acessibilidade Apple HIG e referência do PWA no iPhone ([spec 136](../136-pwa-iphone-apple-hig/issue.md))
  * Antonio Carlos Gomes ([@gomes738](https://github.com/gomes738)) — fluxos de publicação, negociação, anúncios e push
* **Labels:** `pessoa:eric`, `enhancement`, `ios`, `apple-hig`, `accessibility`, `documentation`
* **Branch base:** `develop`
* **Branch sugerida:** `feature/ios-nativo-apple-hig`
* **Inventário de Telas iPhone no Figma:** [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) (Canvas `APP · 20 · iPhone · iOS 26`: tema claro exclusivo, 52 quadros principais + 4 estados após carregamento + 7 estados iOS 26 + 25 telas de protótipo nativo + 2 pranchas iOS 26)
* **Documentos de Referência:**
  - [ADR 0008 — Diretrizes Visuais por Plataforma](../../docs/adr/0008-sem-dark-mode-android-md3-ios-liquid-glass.md) (Android segue Material Design 3; iOS segue Liquid Glass / Apple HIG)
  - [ADR 0114 — Remoção do Tema Escuro (Tema Claro Exclusivo)](../../docs/adr/0114-remocao-tema-escuro.md)
  - [Spec 136 — PWA/iOS no Safari](../136-pwa-iphone-apple-hig/issue.md) (complementar para web/Safari; esta issue foca no **app nativo iOS**)

---

## 📌 Contexto e Objetivo

O **IpêBook** já possui acabamento consolidado em **Material Design 3** no Android e layout próprio na **Web**, além de ajustes específicos de PWA no Safari ([spec 136](../136-pwa-iphone-apple-hig/issue.md)). Para a versão **nativa de iPhone (iOS via Expo / React Native)**, o trabalho segue o **Apple Human Interface Guidelines (HIG)** e a linguagem visual **Liquid Glass (iOS 26)** em **tema claro exclusivo**, conforme o inventário atualizado do Figma (`APP · 20 · iPhone · iOS 26`, [Guia `915:384`](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=915-384&m=dev)).

O foco desta entrega — com **Eric Vinícius** liderando a definição de escopo, priorização, acompanhamento técnico, homologação em iPhone e fechamento das pendências com apoio do restante da equipe — é:

1. **Conformidade Nativa com Apple HIG:** navegação, gestos de retorno (*swipe back*), *safe areas* nativas (Dynamic Island, Notch e Home Indicator), tipografia (`Source Serif 4` / `Plus Jakarta Sans` no conteúdo e `SF Pro` nos controles iOS), hierarquia visual e alvos de toque mínimos de **44×44 pt**.
2. **Linguagem Visual iOS 26 (Liquid Glass · Tema Claro):** superfícies translúcidas (`--glass-fill` / `--glass-stroke`), campos `--ios-cell` (`#f7f3ec`) com foco `#4e8a68`, controles flutuantes, listas agrupadas em Configurações e alertas/menus nativos conforme as pranchas `09` (`952:2303`) e `10` (`957:2903`).
3. **Configuração e Build iOS no Expo:** revisar `app.json` (bundle identifier, permissões de câmera/galeria/localização com descrições em português, ícones iOS, splash screen e suporte a `expo run:ios` / EAS / TestFlight).
4. **Isolamento Total de Plataformas:** garantir que **nenhuma alteração** degrade ou modifique o comportamento e o visual do **Android (MD3)** nem da **Web**.

---

## 🛑 Regra de Ouro: Escopo Isolado ("Sem Mexer no Android/Web")

- **Isolamento por plataforma:** Toda adaptação específica de iOS nativo deve ficar isolada via `Platform.OS === 'ios'`, arquivos `.ios.tsx` ou tokens/estilos condicionais exclusivos para iOS.
- **Tema claro exclusivo:** Sem Dark Mode (Spec 139 / ADR 0114).
- **Preservar Android e Web:** O Android continua estritamente em Material Design 3 e a Web mantém seu layout responsivo e PWA atual.
- **Seguir MVVM:** Manter a arquitetura em camadas (`View -> ViewModel -> Service/Entity`), sem regras de negócio nas views.

---

## 📋 Sub-issues para Execução (Detalhamento Completo)

As 44 rotas de `src/app/` e todos os quadros atualizados do Figma (`APP · 20 · iPhone · iOS 26`) estão divididos nas sub-issues `#226` a `#238` (detalhadas em [`issues.md`](./issues.md)), acompanhadas por [`spec.md`](./spec.md), [`plan.md`](./plan.md) e [`tasks.md`](./tasks.md):

1. **#226 (`T001`):** Configurar `app.json`, `infoPlist` (PT-BR), deep links e ADR de escopo iOS (`@Eric2025gh`) — *Pendente*
2. **#227 (`T002`):** Base Liquid Glass e componentes Apple HIG no Design System (`@clarinhamartins`, `@Eric2025gh` + apoio `@MICAELCARDOSOREIS`) — *Entregue nos PRs `#239` e `#241`; conferir acabamento final com Pranchas `09` e `10`*
3. **#228 (`T003`):** Acesso, Onboarding e Escolha de Bairro (`@Eric2025gh`) — *Pendente*
4. **#229 (`T004`):** Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público (`@clarinhamartins`, `@Eric2025gh`) — *PR `#240` mergeado; PR `#243` (alertas) em revisão; validar em iPhone*
5. **#230 (`T005`):** Publicação, Rascunhos, Minha Estante e Pedidos (`@Eric2025gh`, `@gomes738`) — *Implementado localmente em `dcef8369`; homologar em iPhone e conferir novo Figma*
6. **#231 (`T006`):** Conversas, Negociação, Encontro, Entrega e Compartilhamento (`@gomes738`, `@Eric2025gh`) — *Implementado e validado em iPhone (Expo Go); conferir alinhamento visual com novo Figma na auditoria*
7. **#232 (`T007`):** Perfil, Conta, Notificações, Ajuda, Moderação e Estados Globais (`@Eric2025gh`) — *Pendente*
8. **#233 (`T008`):** Permissões iOS, Reduzir Transparência, Dynamic Type e VoiceOver — Tema Claro (`@clarinhamartins`, `@Eric2025gh` + apoio `@MICAELCARDOSOREIS`) — *Acessibilidade entregue no PR `#242`; faltam permissões nativas*
9. **#234 (`T009`):** Sign in with Apple (`@MICAELCARDOSOREIS`, `@Eric2025gh`) — *Pendente*
10. **#235 (`T010`):** Notificações Push iOS / APNs (`@gomes738`, `@Eric2025gh`) — *Implementado localmente em `2a7a9d98`; falta credencial APNs e homologação em iPhone*
11. **#236 (`T011`):** Build iOS (`eas.json`), `PrivacyInfo.xcprivacy` e TestFlight (`@Eric2025gh`) — *Pendente*
12. **#237 (`T012`):** Auditoria visual final lado a lado com o Figma iOS 26 (`@clarinhamartins`, `@Eric2025gh`) — *Pendente*
13. **#238 (`T013`):** Verificação final no iPhone e regressão zero em Android e Web (`@MICAELCARDOSOREIS`, `@Eric2025gh`) — *Pendente*

---

## ✅ Critérios de Aceite

1. A especificação completa (`spec.md`, `plan.md`, `tasks.md`, `issues.md`) e o inventário [`design-system/telas-iphone-figma.md`](../../design-system/telas-iphone-figma.md) estão sincronizados com o Figma atual (`APP · 20 · iPhone · iOS 26`).
2. O app iOS nativo respeita Safe Areas (Dynamic Island / Notch / Home Indicator), teclado nativo e gestos padrão do iOS em tema claro exclusivo.
3. Os componentes iOS seguem o Apple HIG e as pranchas Liquid Glass `09` e `10` do Figma (`≥ 44×44 pt`, Reduzir Transparência, Dynamic Type, VoiceOver).
4. **O comportamento e o visual no Android (MD3) e na Web permanecem 100% inalterados.**
5. `npm run validate` passa 100% verde.
