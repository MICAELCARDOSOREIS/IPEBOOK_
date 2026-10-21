# Spec 033 — Estados do fluxo de acesso

**Responsável:** Maria Clara Almeida Martins
**Issue:** #97
**Depende de:** #81 (backend Supabase ativo), já fechada.

## Problema

O fluxo de acesso tem as telas principais (entrar, criar conta, esqueci senha, redefinir senha),
mas dois estados intermediários previstos no Figma (fluxo 01 · Acesso) não tinham tratamento
próprio:

- **Link expirado** (`01.08`): ao abrir um link de recuperação de senha inválido ou já usado, a
  pessoa via apenas uma mensagem de erro genérica dentro do formulário de nova senha, sem nenhum
  caminho para sair dali além de "Voltar ao login" (perdendo o fio da recuperação).
- **E-mail já cadastrado** (`01.14`): ao se cadastrar com um e-mail já confirmado por outra conta,
  o Supabase responde com sucesso (sem erro) e `identities: []` — nenhuma conta nova é criada e
  nenhum e-mail é enviado, mas o código tratava isso como cadastro bem-sucedido, enganando quem
  se cadastrou.

Levantamento do código mostrou que outros dois estados do Figma já tinham tratamento, feito em
entregas anteriores (Spec 030/ADR de alinhamento):

- **Confira seu e-mail** (`01.05`, fluxo de recuperação de senha): `forgotPassword.tsx` já mostra
  uma tela dedicada com contador de reenvio, sem revelar se a conta existe.
- **Senha atualizada** (`01.09`): `resetPassword.tsx` já mostra uma tela de confirmação dedicada.

## Escopo

Tratar os dois estados sem tratamento (link expirado, e-mail já cadastrado) no fluxo de
recuperação de senha e de cadastro.

## Fora de escopo

- **Confirmar e-mail / E-mail confirmado / Confirmação reenviada / E-mail inválido**
  (`01.12`, `01.13`, `01.15`, `01.16`): são estados de um fluxo de confirmação de e-mail por link
  (deep link) análogo ao de recuperação de senha, com a mesma complexidade de configuração
  (URL de redirecionamento própria, nova rota, nova tela) — tamanho de uma entrega própria.
  Registrado aqui para não se perder; fica para uma issue nova.
- Qualquer mudança nas telas de autenticação do Micael (#54, já fechada) além dos dois estados
  acima.

## Comportamento esperado

- **RN-01** Ao submeter uma nova senha com um link de recuperação inválido, expirado ou ausente,
  a tela de Nova Senha mostra um estado dedicado "Link expirado" (ícone de erro, mensagem clara)
  com um botão "Solicitar novo link" que leva à tela de Recuperar Acesso — nunca deixa a pessoa
  apenas com uma mensagem de erro sem próximo passo.
- **RN-02** Ao se cadastrar com um e-mail já confirmado por outra conta, a resposta é tratada como
  erro (não como sucesso), com mensagem "Este e-mail já está cadastrado. Entre com sua senha." —
  a pessoa é quem forneceu o próprio e-mail no formulário, então informar isso não é um risco de
  privacidade de terceiros (diferente da recuperação de senha, que continua sem revelar se a
  conta existe).
- **RN-03** As duas mensagens novas são anunciadas por leitor de tela (`accessibilityRole="alert"`).

## Critérios de aceite

- [ ] RN-01 implementado e testado (ViewModel + View).
- [ ] RN-02 implementado e testado (datasource Supabase + datasource em memória).
- [ ] RN-03 verificado nos testes de componente.
- [ ] `npm run validate` passando.
- [ ] Verificação manual do link de recuperação expirado no Android e na Web registrada como
      pendência quando não houver dispositivo/conta descartável disponíveis no ambiente.
