# Validação — Spec 031

Data: 2026-10-20.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | sem erros |
| `npm run check:architecture` | 205 arquivos verificados, 0 violações |
| `npx vitest run` | 101 arquivos, 682 testes passando |
| cobertura | Statements 88,85% · Branches 80,94% · Functions 85,82% · Lines 90,40% |

## Verificações específicas

- O teste `tests/hooks/useAuthViewModel.test.tsx` exercita o limite ponta a ponta no ViewModel com
  um `ClientRateLimiter` real: cinco recusas seguidas ainda mostram "Credenciais inválidas." e a
  sexta troca para a mensagem de excesso de tentativas.
- Há teste cobrindo que travar uma conta não trava outra (chave por e-mail) e que entrar com
  sucesso zera o contador.
- O teste do guarda cobre a volta da liberação depois que a janela fecha, usando uma janela curta
  de 10 ms.

## Limitações

- O limite vive no dispositivo: é barreira de uso contra cliques repetidos e rajadas, não controle
  de segurança. Quem reinstalar o app zera o contador. O limite no servidor depende de
  configuração do Supabase e está declarado como fora de escopo na spec.
- O `SafeLogger` escreve no console do dispositivo; não há envio para serviço externo.
- Como em entregas anteriores, `npm run validate` não roda inteiro dentro de um worktree (o script
  de cobertura usa `./node_modules`); a cobertura foi medida apontando para o `node_modules` do
  repositório principal.
