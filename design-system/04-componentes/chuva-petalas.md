# Chuva de Pétalas de Ipê (IpePetalsCelebration)

> [!NOTE]
> **IMPLEMENTADO**: Implementado em `src/view/components/IpePetalsCelebration.tsx`.

Origem no sistema base: **Novo** — micro-interação comemorativa inspirada na florada e queda natural das pétalas do Ipê-Amarelo em Piripiri. Substitui confetes genéricos por uma celebração artesanal e poética da comunidade.

## Quando usar

- Conclusão de uma negociação ou troca de livros entre vizinhos.
- Primeiro anúncio de livro publicado pela pessoa.
- Confirmação de doação concluída.

## Quando não usar

- Em ações corriqueiras (como favoritar um livro ou navegar entre abas).
- Em momentos de erro ou cancelamento.

## Anatomia

1. 14 pétalas orgânicas em formato de amêndoa/folha
2. Tons alternados da florada (`colors.ipe.bloom` dourado e `colors.ipe.bloomDeep` âmbar)
3. Trajetória suave de queda com oscilação lateral senoidal e rotação suave

## Acessibilidade

- Totalmente oculto para leitores de tela (`accessibilityElementsHidden`, `accessible={false}`).
- Não captura toques (`pointerEvents="none"`).
- Respeita o fluxo da tela sem bloquear a leitura nem ações do usuário.

## Código

```tsx
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";

// Disparado na tela de parabéns ou sucesso:
<IpePetalsCelebration active={showCelebration} onComplete={() => setShowCelebration(false)} />
```
