# Chuva de Pétalas de Ipê (IpePetalsCelebration)

> [!NOTE]
> **IMPLEMENTADO**: Implementado em `src/view/components/IpePetalsCelebration.tsx`.

Origem no sistema base: **Novo** — micro-interação comemorativa inspirada na florada do Ipê-Amarelo em Piripiri. As ilustrações usam amarelo solar mais reconhecível, com acabamento botânico vintage: contorno sépia, nervuras finas e folhas verdes compostas.

## Quando usar

- Na primeira entrada da pessoa na Home da sessão, usando a variação breve de acolhimento (`variant="entry"`).
- Em uma celebração iniciada pela pessoa ou após uma conquista, usando a florada completa (`variant="celebration"`).

## Quando não usar

- Em ações corriqueiras (como favoritar um livro ou navegar entre abas).
- Em momentos de erro ou cancelamento.

## Variações

- **Entrada:** 16 flores, pétalas e algumas folhas verdes, surgem em momentos diferentes ao longo de cerca de 2,5 a 3,5 segundos; algumas pousam brevemente no topo ou na barra inferior e depois desaparecem.
- **Celebração:** 38 flores, pétalas e folhas, em uma queda mais ampla de cerca de 4 a 5,5 segundos, com alguns pousos breves antes do desaparecimento.
- Cada peça recebe profundidade, tamanho, duração, balanço lateral e giro próprios. Inclinações `rotateX`/`rotateY` com perspectiva e sombra leve criam volume; flores agrupadas balançam suavemente e pétalas e folhas oscilam mais com o vento.
- Na Home, a florada passa à frente dos cartões e da barra superior; algumas flores pousam por um instante nas barras superior e inferior e desaparecem. A camada não bloqueia toques.
- Os arquivos PNG da animação são renderizados dos SVGs de mesmo nome em `src/view/assets/`, para manter boa definição em telas com alta densidade.

## Acessibilidade

- Totalmente oculto para leitores de tela (`accessibilityElementsHidden`, `accessible={false}`).
- Não captura toques (`pointerEvents="none"`).
- Respeita o fluxo da tela sem bloquear a leitura nem ações do usuário.

## Código

```tsx
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";

// Celebração completa em uma tela de parabéns ou sucesso:
<IpePetalsCelebration active={showCelebration} variant="celebration" onComplete={() => setShowCelebration(false)} />
```
