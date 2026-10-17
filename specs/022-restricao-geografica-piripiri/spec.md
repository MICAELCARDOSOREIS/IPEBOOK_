# Especificação 022 — Restrição Territorial da Beta a Piripiri, PI

## 1. Visão Geral e Objetivo

O **Ipebook** é um marketplace comunitário hiperlocal voltado à circulação de livros (venda, troca e doação) entre vizinhos e estudantes. O modelo de transação depende da entrega física presencial e sem frete em pontos públicos seguros da cidade (conforme Spec 009).

Para garantir a viabilidade operacional e a integridade da proposta de valor durante o lançamento da versão beta, o sistema deve restringir estritamente as operações à cidade de **Piripiri, PI**. Anúncios cadastrados devem pertencer obrigatoriamente a Piripiri, com a indicação do bairro local.

---

## 2. Escopo

### O que faz parte (In-Scope)
- **Declaração Geográfica Explícita:** O modelo de anúncio (`Book`) passa a registrar a cidade (`city`), estado (`state`) e opcionalmente o bairro (`neighborhood`).
- **Validação de Regra de Negócio (Camada de Domínio / UseCase):** Rejeição imediata de qualquer payload de anúncio que indique cidade diferente de `"Piripiri"` ou UF diferente de `"PI"`.
- **Lista Curada de Bairros de Piripiri:** Bairros oficiais e conhecidos de Piripiri, PI disponibilizados como constantes de domínio para seleção no cadastro e filtro.
- **Interface Transparente:** Na tela de anúncio e visualização do livro, a cidade é fixada de forma clara como `"Piripiri, PI"`, permitindo à pessoa usuária selecionar seu bairro.
- **Mensagem Amigável de Restrição:** Quando houver tentativa de contorno ou envio de cidade divergente: *"O Ipebook está em fase beta exclusivamente em Piripiri, PI. Em breve expandiremos para outras regiões!"*.

### O que está fora de escopo (Out-of-Scope)
- Uso de geolocalização por GPS ou permissões nativas de dispositivo (`ACCESS_FINE_LOCATION`).
- Mapas interativos pesados ou dependências de terceiros (como SDKs de mapa).
- Expansão para outros municípios nesta versão beta.

---

## 3. Critérios de Aceite (Gherkin)

### Cenário 1: Publicação de anúncio com localização válida em Piripiri, PI
- **Dado** que um usuário autenticado está na tela de cadastro de anúncio,
- **Quando** ele preenche os dados do livro e informa ou confirma o bairro em Piripiri, PI,
- **Então** o anúncio é criado com sucesso com `city = "Piripiri"`, `state = "PI"` e o respectivo bairro.

### Cenário 2: Tentativa de publicação com cidade fora de Piripiri
- **Dado** que uma requisição ou payload externo tente cadastrar um livro com cidade `"Teresina"` ou qualquer valor diferente de `"Piripiri"`,
- **Quando** o caso de uso `BookUseCases.createListing` processa a entrada,
- **Então** o sistema lança um `ValidationError` informando que a beta atende exclusivamente Piripiri, PI, e nenhuma linha é persistida.

### Cenário 3: Exibição da localidade na Home e Detalhe do Anúncio
- **Dado** um livro cadastrado em Piripiri,
- **Quando** qualquer visitante ou leitor visualiza o detalhe do livro,
- **Então** a localização comunitária (ex: "Centro, Piripiri - PI") é apresentada de forma nítida.

---

## 4. Impacto em Privacidade e LGPD

A restrição por **declaração de cidade/bairro** respeita integralmente os princípios de **finalidade, adequação e necessidade (minimização)** da Lei Geral de Proteção de Dados (Lei 13.709/2018, Art. 6º, III), ao evitar a coleta de coordenadas GPS precisas e dispensar rastreamento contínuo em segundo plano.
