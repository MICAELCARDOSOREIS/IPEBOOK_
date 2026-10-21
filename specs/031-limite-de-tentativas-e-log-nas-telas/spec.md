# Spec 031 — Limite de tentativas e log sanitizado nas telas

**Responsável:** Micael Cardoso Reis
**Decisão de origem:** [ADR 0027](../../docs/adr/0027-resiliencia-seguranca-e-verificacao-release.md)

## Problema

`ClientRateLimiter` e `SafeLogger` foram implementados e registrados em `src/di/container.ts`, mas
nenhum ViewModel ou View os consumia. Na prática:

- qualquer formulário aceitava envios repetidos sem nenhum freio, incluindo tentativas de entrar
  com senha errada, pedidos de recuperação de senha e denúncias do mesmo anúncio;
- falhas de cadastro, publicação e denúncia não deixavam registro algum;
- o `docs/estado.md` afirmava que o rate limiting estava "protegendo formulários contra múltiplos
  cliques e requisições repetidas", o que não correspondia ao código.

## Escopo

Ligar os dois serviços às ações de formulário que chegam ao backend, por um guarda compartilhado,
e corrigir a documentação que descrevia a proteção como existente.

## Fora de escopo

- Limite de tentativas no servidor: o `ClientRateLimiter` vive no dispositivo e é uma primeira
  barreira de uso, não um controle de segurança — quem quiser burlar basta reinstalar o app. O
  controle no servidor depende de configuração do Supabase e fica para uma entrega própria.
- Envio dos registros do `SafeLogger` para um serviço externo de observabilidade.
- Ações de leitura (listas, busca, detalhe), que não têm efeito colateral no backend.

## Comportamento esperado

- **RN-01** Entrar e criar conta aceitam no máximo 5 tentativas por minuto para o mesmo e-mail.
- **RN-02** Recuperar senha e denunciar anúncio aceitam no máximo 3 tentativas por minuto, por
  e-mail e por anúncio respectivamente — são as ações que disparam e-mail e moderação.
- **RN-03** Publicar anúncio aceita no máximo 5 envios por minuto na mesma sessão.
- **RN-04** Ao atingir o limite, a tela mostra "Muitas tentativas seguidas. Tente de novo em N
  segundos." (ou minutos), sem desabilitar o botão — o erro aparece como qualquer outro erro do
  formulário, como manda o `botao.md`.
- **RN-05** O limite é contado por chave de ação e alvo: travar uma conta não trava outra.
- **RN-06** Entrar com sucesso zera o contador daquela conta.
- **RN-07** Falhas de cadastro, recuperação, publicação e denúncia, e todos os bloqueios por
  excesso de tentativas, são registrados pelo `SafeLogger`, que já mascara senha, token e chave.

## Critérios de aceite

1. Cada regra acima tem teste automatizado — função pura e ViewModel.
2. Nenhum segredo chega ao log: o registro usa mensagem e contexto sem credencial.
3. O guarda é função pura reutilizável; os ViewModels só escolhem a chave da ação.
4. `docs/estado.md` e o ADR 0027 descrevem onde a proteção está aplicada, com os limites reais.
5. `npm run validate` e `npm run build:web` passam, com cobertura acima de 80% nas quatro
   dimensões.
