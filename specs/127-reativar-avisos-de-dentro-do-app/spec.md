# Reativar os avisos do celular de dentro do app

**Spec:** 127 — derivada do acompanhamento registrado em `specs/020-permissoes-da-plataforma/spec.md`
**Estado:** Especificada e implementada em 2026-11-05

## Objetivo e escopo

A Spec 020 established que o app explica o motivo antes de abrir o prompt nativo e que, uma vez
negada ou adiada a resposta, ele **não insiste**: o registro de "já perguntado" faz a explicação não
voltar sozinha. Na verificação de fluxo real no navegador (`validacao.md` da Spec 020, 2026-11-05)
isso virou uma lacuna concreta de UX: quem negou e depois se arrependeu não tem nenhum caminho
dentro do IpêBook para pedir de novo — só a orientação de ir aos Ajustes do aparelho. A Central de
notificações, que é justamente a tela que avisa "Notificações desativadas", informava o problema sem
oferecer ação.

| # | Situação antes (evidência conferida no código) | Resultado depois |
| --- | --- | --- |
| E1 | `src/view/notifications/notifications.tsx` renderizava a banner de permissão desativada (`testID="permission-alert"`) apenas com título e texto, sem nenhum controle. | A banner traz um botão que reabre o aviso explicativo da Spec 020, e o aviso explica antes do prompt nativo — a mesma tela, o mesmo texto, nenhuma promessa nova. |
| E2 | `usePermissionPromptViewModel` só decidia mostrar a explicação em `refresh()`, que respeita o registro de "já perguntado"; não havia forma de a pessoa pedir a explicação de novo. | Ação nova `reopen()`: mostra a explicação **a pedido**, sem consultar nem alterar o registro, e sem tocar no comportamento de `refresh()` (a recusa continua não insistindo). |
| E3 | Concedida a permissão em outra tela, a raiz (`PushRegistration`) só relia a permissão quando a sessão mudava, então o token do push não era registrado naquela execução. | A raiz reavalia sessão **e** permissão a cada navegação, então conceder pela Central de notificações libera o registro do token sem recarregar o app. |

Fora do escopo: permissões de câmera/fotos (a recusa já tem alternativa na própria etapa — publicar
com capa ilustrativa, Spec 020 T006); mudar quando o aviso aparece sozinho na primeira entrada
(regra da Spec 020, inalterada); habilitar a permissão por conta própria nos Ajustes do aparelho
(impossível para o app); qualquer alteração de esquema, de RLS ou do texto dos diálogos existentes.

## Critérios de aceite

1. **CA1 — controle na banner.** Com a permissão de notificações desativada no aparelho, a Central de
   notificações mostra, dentro da banner "Notificações desativadas", um botão acessível com rótulo
   "Pedir permissão de novo" e `accessibilityLabel` "Pedir permissão de avisos novamente ao aparelho".
   Teste: `tests/components-mocked/notificationsPermissionReopen.test.tsx`.
2. **CA2 — nada aparece sozinho.** Abrir a Central de notificações não abre diálogo algum e não invoca
   o prompt nativo: a tela não chama `refresh()`, e o único caminho para a explicação é o toque no
   botão (que chama `reopen()`). Teste: segundo caso da suíte nova + `reopen` não invocado quando a
   permissão está concedida (banner nem aparece).
3. **CA3 — o motivo vem antes do prompt.** Depois de tocar no controle, o diálogo mostra o título e a
   mensagem já existentes (`PERMISSION_PROMPT_COPY.notifications`); o prompt nativo só é pedido quando
   a pessoa toca em "Permitir avisos" (`approve()`). Teste: terceiro caso da suíte nova e
   `tests/hooks/usePermissionPromptViewModel.test.tsx` (caso Spec 127: `reopen` com registro de
   pergunta já existente, `resolve()` chamado uma vez e `request()` zero até o "Permitir avisos").
4. **CA4 — sem insistência.** A recusa continua sem reabrir a explicação sozinha: `refresh()` segue
   devolvendo `idle` quando o registro diz "já perguntado" (Comportamento da Spec 020 preservado,
   provado pelos casos CA2/CA3 já existentes, que não mudaram).
5. **CA5 — conceder funciona na mesma execução.** Concedida a permissão pela Central, a raiz passa a
   tratar o push como pronto (`permissionReady` verdadeiro) ao navegar, sem recarregar o app.
   Teste: caso Spec 127 em `tests/components/pushRegistration.test.tsx`.
6. **CA6 — a arquitetura continua a mesma.** A View chama a fábrica `makeNotificationsPromptViewModel`
   do contêiner (ADR 0098: nenhum `src/viewmodel/**` importa `@/di`), nenhum ViewModel novo, nenhuma
   tela acima do teto de 900 linhas. Verificação: `npm run check:architecture` e `npm run validate`.

## Como será testado

- Unitário/hook: transição `reopen()` no ViewModel e a ordem "explicação → toque → prompt nativo".
- Componente com ViewModel mockado: banner com o controle, ausência do controle com a permissão
  concedida, ausência de diálogo em montagem, e o fluxo completo do toque até `approve()`.
- Componente da raiz: reavaliação da permissão ao navegar liberando o registro do token.
- Suíte completa com `npm run validate` (typecheck, lint, arquitetura, design system, numeração,
  config de build, SQL, cobertura ≥ 80% e sincronia da documentação).
- Limitação registrada: o prompt nativo em si (Android/iOS) e o token real do Expo só são validáveis
  em aparelho físico; a verificação web por CDP da Spec 020 cobre a ordem das chamadas, não o sistema
  operacional do celular.
