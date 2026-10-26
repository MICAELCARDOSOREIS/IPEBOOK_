# Relatório do Grupo A · Acesso e Onboarding (Spec 072)

**Data:** 25 de outubro de 2026  
**Responsável:** Micael Cardoso Reis  

## 1. Telas Alinhadas

| Tela Figma | Arquivo | Status | O que foi conferido |
| :--- | :--- | :--- | :--- |
| `01.01 · Boas-vindas` (`324:38`) | `src/view/onboarding/welcome.tsx` | Alinhada | Topo com Logotipo e pílula `• PIRIPIRI · PIAUÍ`, título serifado com destaque amarelo ("Uma boa história merece continuar."), ilustração centralizada de clássicos com pétalas de ipê, subtítulo de proximidade, tags de modalidades (`Venda`, `Troca`, `Doação`) e três botões de ação ("Começar", "Já tenho conta", "Explorar livros sem entrar"). |
| `01.02 / 01.10 · Entrar com e-mail` (`354:6017`) | `src/view/auth/signIn.tsx` | Alinhada | Barra M3 com título "Entrar com e-mail", manchete serifada ("Sua próxima leitura começa aqui."), campos de E-mail e Senha, botão principal "Entrar", e links textuais "Esqueci minha senha" e "Criar uma conta". |
| `01.03 · Criar conta` (`336:118`) | `src/view/auth/signUp.tsx` | Alinhada | Logotipo IpêBook, manchete "Crie sua conta", botão social desabilitado, divisor "ou crie com e-mail", campos de Nome completo, E-mail, Senha, checkbox de aceite de termos de uso e privacidade e botões "Criar conta" e "Já tenho conta". |
| `01.04 · Recuperar acesso` (`6:534`) | `src/view/auth/forgotPassword.tsx` | Alinhada | Topo com logotipo, manchete "Recupere seu acesso.", campo de e-mail e botões "Enviar link" e "Voltar ao login". |
| `01.05 · Confira seu e-mail` (`6:597`) | `src/view/auth/forgotPassword.tsx` | Alinhada | Ícone de carta em container suave, manchete "Confira seu e-mail.", destaque do endereço enviado, card informativo "Não chegou?", botão "Voltar ao login" e contador de reenvio. |
| `01.06–01.09 · Nova senha e confirmações` (`254:3595` / `254:4006`) | `src/view/auth/resetPassword.tsx` | Alinhada | Estados de link expirado (01.08), nova senha (01.06) e senha atualizada (01.09) com ícones semânticos, validação de confirmação de senha e redirecionamento. |

## 2. Validação Executada
- `tests/components/welcomeRouteView.test.tsx` (3 testes): 100% aprovados.
- `tests/components/welcomeView.test.tsx` (2 testes): 100% aprovados.
- `tests/components/authViews.test.tsx` (23 testes): 100% aprovados.
- `tests/integration/authIntegration.test.tsx` (2 testes): 100% aprovados.
- Total: 30 testes aprovados.

