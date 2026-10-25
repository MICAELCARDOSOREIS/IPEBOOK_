# Plano — Spec 072 (Alinhamento global ao Figma)

## Abordagem

1. Rasterizar os 137 SVGs canônicos com `rsvg-convert -w 393` para PNG de referência (fora do
   repositório, só para comparação visual).
2. Dividir as telas em seis grupos com arquivos disjuntos (tabela da `spec.md`) e alinhar cada grupo
   em paralelo, sem tocar em `src/view/components/*`, `src/view/tokens.ts`, ViewModels ou UseCases.
3. Ajustes em componentes compartilhados (por exemplo `BookCover`, `TopAppBar`) são centralizados
   em uma etapa única depois dos grupos, para evitar conflitos e regressões cruzadas.
4. Validar cada grupo com typecheck e testes das telas afetadas; ao final, suíte completa e
   capturas ADB no Galaxy A16.

## Decisões

- ADR 0055 registra o Figma Android como fonte da verdade visual e o processo de alinhamento por
  grupos com propriedade de arquivos.
- Formatação monetária: `toFixed(2).replace(".", ",")`, padrão já usado em Início e Explorar.

## Riscos

- Testes que dependem de textos antigos: atualizar só quando o texto do Figma substituir o anterior.
- Telas sem dados equivalentes (por exemplo, avaliação do anunciante no detalhe): mostrar só o que
  o ViewModel já fornece e registrar a lacuna.

