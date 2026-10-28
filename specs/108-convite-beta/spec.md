# Especificação 108 — Página de convite para o beta na Play Store

Status: implementada e validada localmente; pendente aplicar a migração no Supabase remoto e publicar o site.

## Objetivo
Chamar leitores de Piripiri para testar o app Android antes do lançamento, juntando os Gmails num
só lugar para depois colocá-los na lista de testadores do Play Console.

## Escopo
- Página pública `/beta` no site (sem login): o que é o IpêBook, como funciona o teste, link da
  Play Store e formulário com nome (opcional) e Gmail.
- Os e-mails ficam na tabela `v2_beta_testers` do Supabase, gravados só pela função
  `v2_register_beta_tester` (SECURITY DEFINER). Ninguém lê pela API; o dono consulta no painel do
  Supabase ou pelo SQL abaixo.
- Fora do escopo: adicionar os e-mails no Play Console automaticamente (a API pública não permite
  editar listas de testadores) e enviar e-mail de confirmação.

## Regras
- **RN-01** E-mail obrigatório, com formato válido, até 254 caracteres; guardado em minúsculas e sem
  espaços. Precisa ser uma Conta Google (a página pede Gmail; outros domínios são aceitos porque
  podem ser contas Google).
- **RN-02** Nome opcional, sanitizado, até 80 caracteres.
- **RN-03** Inscrever o mesmo e-mail de novo não é erro: a pessoa vê a mesma confirmação.
- **RN-04** Anônimos não leem, alteram nem apagam a tabela; só chamam a função.
- **RN-05** Contra spam, no máximo 300 inscrições novas por hora no total (código `IBLIM`).

## Links
- Play Store: `https://play.google.com/store/apps/details?id=com.ipebook.app`
- Teste fechado: o link de participação aparece após a aprovação da faixa Alpha.

## Exportar os e-mails para o Play Console
```sql
select string_agg(email, ',' order by created_at) from public.v2_beta_testers where invited_at is null;
update public.v2_beta_testers set invited_at = now() where invited_at is null;
```
Cole a lista em *Teste fechado → Testadores → lista de e-mails*.

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | Valida e normaliza e-mail e nome (RN-01, RN-02) | `tests/unit/betaSignupUseCases.test.ts` |
| CA2 | Inscrição repetida confirma sem erro (RN-03) | `tests/unit/betaSignupUseCases.test.ts` e `npm run test:sql` |
| CA3 | Anônimo não lê nem altera a tabela; função grava (RN-04) | `npm run test:sql` |
| CA4 | Limite global por hora (RN-05) | `npm run test:sql` |
| CA5 | Tela mostra link da loja, envia, exibe erro e sucesso | `tests/components/betaInviteScreen.test.tsx` |
| CA6 | Rota `/beta` gerada no build web | `npm run build:web` |
