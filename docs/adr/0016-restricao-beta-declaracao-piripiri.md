# 0016 — Restrição territorial da beta por declaração comunitária

Data: 2026-10-17. Status: aceito.

## Contexto

A versão beta do Ipebook tem foco comunitário em Piripiri, PI. O modelo de troca, doação e venda exige encontros presenciais em pontos públicos seguros da cidade (ADR 0009 / Spec 009). Permitir anúncios ou cadastros dispersos geograficamente rompe a viabilidade da transação local e frustra as pessoas usuárias. É necessário definir como o sistema aplica e valida essa restrição territorial.

## Decisão

Adotar a **declaração explícita de localidade (cidade: "Piripiri", estado: "PI") e seleção de bairro** na camada de domínio e casos de uso, sem captura de coordenadas de geolocalização ou GPS contínuo.

A camada de caso de uso (`BookUseCases`) e de validação (`BookValidator`) rejeitam qualquer tentativa de criação de anúncio com cidade diferente de "Piripiri" ou estado diferente de "PI". A interface apresenta a localidade fixada e permite escolher o bairro em uma lista predefinida de Piripiri.

## Alternativas consideradas

- **Rastreamento via GPS / Geolocalização do dispositivo:** Rejeitada por violar o princípio da minimização de dados da LGPD (Art. 6º, III), exigir permissões intrusivas de sistema, drenar bateria e falhar em ambientes Web/desktop sem suporte de posicionamento confiável.
- **Integração com serviço terceiro de mapas:** Rejeitada por adicionar custos operacionais, segredos desnecessários e dependência externa fora do escopo da beta (o token Mapbox sem uso foi removido exatamente por essa razão).
- **Sem restrição no domínio (apenas texto de ajuda):** Rejeitada porque permitia cadastros inconsistentes que quebravam a proposta de valor.

## Consequências

- A privacidade da pessoa usuária é preservada por design e por padrão (LGPD).
- Não há atrito de permissões de sistema operacional ao abrir o aplicativo.
- A regra é validada tanto na interface quanto nas regras de negócio (caso de uso), impedindo contorno via requisições de API.
- Para expansão futura para novas cidades, a regra no domínio precisará evoluir de constante para tabela/configuração dinâmica de municípios atendidos.

Vínculos: [spec 022](../../specs/022-restricao-geografica-piripiri/spec.md), [ADR 0012](0012-supabase-com-rls.md).
