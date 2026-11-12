# ADR 0055 — Alinhamento global das telas Android ao Figma

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Contexto técnico:** Spec 072 (Alinhamento global ao Figma).
- **Relacionado a:** ADR 0004 (design system e tokens), ADR 0007 (serifa da marca), ADR 0008 (escopo
  Android), ADR 0019 (componentes e MVVM), ADRs 0045, 0047, 0048, 0049 e 0052 (alinhamentos por tela).

## Contexto

Os alinhamentos visuais foram feitos tela a tela (Início, Estante, Perfil, Explorar, Encontros). O
restante do app ainda usa layouts provisórios, e o usuário pediu o alinhamento de todas as telas. O
repositório já contém os SVGs canônicos das 137 telas Android em `design-system/figma-exports/svgs/`.

## Decisão

1. O Figma Android (`APP · 10 · Android · Material 3`) é a fonte da verdade visual; os SVGs locais
   são a referência versionada, rasterizados para PNG apenas durante a comparação.
2. O alinhamento é feito por grupos de telas com propriedade exclusiva de arquivos de View; ninguém
   altera componentes compartilhados, tokens, ViewModels ou UseCases dentro dos grupos.
3. Mudanças em componentes compartilhados são consolidadas numa etapa única posterior, com testes
   próprios.
4. Valores visuais vêm de `src/view/tokens.ts`; exceções exigem justificativa no `tasks.md`.

## Consequências

- Permite paralelizar o trabalho sem conflitos de edição.
- Diferenças que dependem de dados inexistentes ficam registradas como pendência, sem inventar regra
  de negócio.
- Exige validação visual manual (ADB) porque não há testes de regressão visual automatizados.

## Alternativas consideradas

- **Uma spec por tela:** mais rastreável, mas inviável para mais de cem telas no mesmo ciclo.
- **Gerar telas a partir do código exportado do Figma:** o código exportado é web/Tailwind e
  absoluto; não respeita MVVM, React Native nem acessibilidade.

