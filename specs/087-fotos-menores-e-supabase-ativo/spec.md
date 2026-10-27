# Spec 087 — Fotos menores e Supabase sempre ativo

## Problema
- As fotos eram comprimidas (qualidade 0,7), mas não reduzidas: média de 350 KB e até 1,5 MB no Storage.
  No plano gratuito (5 GB de egress/mês), isso limita o app a poucas centenas de usuários ativos.
- O plano gratuito pausa o projeto após 7 dias sem uso, derrubando o app.

## Escopo
- `ExpoImagePickerService`: depois do recorte 1:1, reduz para no máximo 1080 px de lado
  (`expo-image-manipulator`, pacote oficial do Expo 58) e comprime uma única vez (JPEG 0,7).
  Fotos menores não são ampliadas. Fotos já enviadas continuam como estão.
- Workflow `.github/workflows/manter-supabase-ativo.yml`: a cada 2 dias consulta `v2_books` pela API
  pública com a chave publicável; falha se os segredos estiverem ausentes ou a resposta não for 200.

## Critérios de aceite
- CA1: foto maior que 1080 px é reduzida antes do envio. Teste: `tests/unit/expoImagePickerService.test.ts`.
- CA2: foto menor não é ampliada. Mesmo teste.
- CA3: o workflow faz uma consulta real e falha visivelmente sem os segredos.
  Validação: a mesma requisição retornou HTTP 200 localmente; execução manual pelo `workflow_dispatch`.

## Pré-requisitos
Segredos `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no repositório do GitHub.
O agendamento só roda a partir da branch padrão (`develop`).
