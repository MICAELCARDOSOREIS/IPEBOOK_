# 0022 — Primeiro acesso guardado no dispositivo

Data: 2026-10-20. Status: aceito.

## Contexto

A issue #98 pede que as boas-vindas apareçam só no primeiro acesso. Para isso é preciso saber se
a pessoa já viu a tela. A marca poderia ficar em três lugares:

- na conta, no banco (Supabase), ou
- no dispositivo, ou
- em nenhum lugar, mostrando a tela sempre.

A marca de primeiro acesso não é um dado de conta: ela descreve o aparelho. Um visitante sem
conta também precisa dela (AD-9), e o banco exigiria sessão para gravá-la.

## Decisão

Guardar a marca "boas-vindas vistas" no dispositivo, com `AsyncStorage` (chave
`ipebook.boasVindasVistas`). A leitura e a gravação ficam em `infra/`, o caso de uso
`OnboardingUseCases` decide se a tela aparece, e a decisão da rota inicial fica em um único ponto
(`InitialRouteGate`, AD-18).

Se a leitura falhar, as boas-vindas aparecem; se a gravação falhar, a tela volta na próxima
abertura. Nenhuma das duas falhas bloqueia o app.

## Alternativas consideradas

- **Marca no banco, por conta:** rejeitada. Exigiria sessão para um visitante anônimo, e a tela
  reapareceria para cada conta criada no mesmo aparelho.
- **Sem marca (tela sempre):** rejeitada. Contraria o critério de primeiro acesso da #98.
- **Marca na URL ou em cookie da web:** rejeitada. Não funciona no Android, que é a plataforma
  obrigatória da beta.

## Consequências

- A marca é por aparelho: limpar os dados do app faz a tela reaparecer, o que é aceitável.
- Nenhum dado pessoal é gravado no banco nem fica vinculado a uma conta.
- Se as boas-vindas passarem a depender de sessão (por exemplo, para oferecer ações de conta
  personalizadas), esta decisão precisa ser revista com um novo ADR.

Vínculos: [spec 026](../../specs/026-boas-vindas-primeiro-acesso/spec.md),
[ADR 0006](0006-conta-com-email-e-google.md).
