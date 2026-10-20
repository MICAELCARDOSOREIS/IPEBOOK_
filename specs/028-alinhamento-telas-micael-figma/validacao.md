# Validação — Spec 028

Data: 2026-10-20. Branch: `worktree-alinhar-telas-micael-figma`.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | sem erros |
| `npm run check:architecture` | 0 violações nas 7 camadas |
| `npm run test:sql` | 12 migrações aplicadas no PGlite, incluindo a nova `202610200005_conservacao_descricao_anuncio.sql` |
| `npx vitest run` | 97 arquivos, 650 testes, todos passando |
| cobertura (`vitest run --coverage`) | Statements 88,88% · Branches 80,69% · Functions 85,51% · Lines 90,47% — acima do limiar de 80% nas quatro dimensões |
| `npx expo export --platform web` | 25 rotas exportadas, incluindo `/gerenciar-anuncio/[id]` |

## Verificações específicas

- **Migração**: o script `verificar-migracoes.mjs` passou a recusar conservação fora da lista
  (`condition = 'novo'`) e descrição com mais de 280 caracteres, e a aceitar os valores válidos —
  as três linhas aparecem na saída do `npm run test:sql`.
- **Manifesto da Web**: `dist/icone-192.png` (192×192) e `dist/icone-512.png` (512×512) existem no
  pacote publicado e `dist/manifest.json` traz `"theme_color": "#2C5E45"`. Antes desta spec o
  manifesto apontava para `/favicon.png`, que não existia em `dist/`.
- **Rótulos acessíveis**: a ação contornada das etapas 2 e 3 do anúncio chama-se "Voltar à etapa
  anterior" porque "Voltar" colidia com o botão da barra superior — o teste de componente falhou
  com `Found multiple elements with role: button, name: Voltar` antes do ajuste.

## Limitações

- `npm run validate` não roda inteiro dentro do worktree: o script `test:coverage` usa o caminho
  relativo `./node_modules/vitest/vitest.mjs`, que não existe em um worktree sem instalação própria.
  A cobertura foi medida apontando para o `node_modules` do repositório principal; na raiz do
  projeto o comando funciona normalmente.
- O nome do cadastro é gravado em `user_metadata.full_name` e propagado ao perfil público pelo
  `IProfileDataSource.ensure`. Se essa gravação falhar (por exemplo, com a conta ainda não
  confirmada e RLS ativo), o cadastro continua válido e o perfil volta a ser criado sob demanda com
  o nome padrão. Isso não foi verificado contra o Supabase real nesta entrega.
- As telas não foram conferidas em dispositivo Android físico nesta entrega; a verificação foi por
  testes de componente e pela exportação web.
