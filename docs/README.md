# Documentação do Ipebook

Este índice organiza a documentação do novo projeto em `IPEBOOK_`. O código de outro repositório Ipebook não foi migrado.

| Preciso entender… | Documento |
| --- | --- |
| Objetivo, público, escopo e requisitos | [Produto e requisitos](produto.md) |
| Camadas, dependências, dados e erros | [Arquitetura MVVM](arquitetura.md) |
| Instalação, configuração, execução e problemas comuns | [Guia de desenvolvimento](desenvolvimento.md) |
| Testes, critérios de aceite e CI | [Qualidade e validação](qualidade.md) |
| Como usar a versão atual | [Guia de uso](uso.md) |
| O que foi entregue e o que falta | [Estado e continuidade](estado.md) |
| Resumos e imagens das versões | [Versões do produto](versoes/README.md) |
| Por que a arquitetura foi escolhida | [Índice de ADRs](adr/README.md) |
| Identidade visual, tipografia e diretrizes de IHC | [Design System](design-system.md) |
| Integrantes e contexto acadêmico | [Equipe do projeto](equipe.md) |
| Padrões de desenvolvimento e colaboração | [Guia de contribuição](../CONTRIBUTING.md) |

## Fontes de verdade

A [constituição](../.specify/memory/constitution.md) estabelece os princípios. As funcionalidades são especificadas em `specs/`, com plano, tarefas e validação. Os ADRs registram decisões arquiteturais; estes guias explicam o resultado sem substituir esses registros.

A [especificação 001](../specs/001-estrutura-mvvm/spec.md) cobre a base técnica existente. A documentação de produto diferencia comportamento implementado de questões em aberto: uma sugestão não autoriza sua implementação.

## Manutenção

Ao mudar um fluxo, atualizar sua especificação, os guias afetados e a evidência de validação. Preservar registros históricos com data; manter somente [estado.md](estado.md) como resumo da situação corrente. Escrever em português e não incluir credenciais.
