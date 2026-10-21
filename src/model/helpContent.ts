export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: "funcionamento" | "seguranca" | "regras" | "suporte";
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "faq-1",
    category: "funcionamento",
    question: "Como funciona o IpêBook?",
    answer:
      "O IpêBook é uma plataforma comunitária voltada para os leitores de Piripiri, PI. Você pode anunciar livros físicos que já leu para doação, troca ou venda a preços justos, combinando a entrega diretamente com outros leitores.",
  },
  {
    id: "faq-2",
    category: "regras",
    question: "O IpêBook cobra alguma taxa ou comissão?",
    answer:
      "Não. O IpêBook é 100% gratuito e comunitário. Não cobramos comissões por trocas, doações ou vendas. Nas vendas, o valor é acertado diretamente entre as partes no momento do encontro.",
  },
  {
    id: "faq-3",
    category: "seguranca",
    question: "Onde devo realizar a entrega ou troca do livro em Piripiri?",
    answer:
      "Sempre priorize locais públicos, iluminados e movimentados durante o dia. Recomendamos os seguintes pontos de encontro em Piripiri: Campus do IFPI Piripiri, Praça da Bandeira (Centro), Memorial Espedito Resende e a Estação Ferroviária.",
  },
  {
    id: "faq-4",
    category: "seguranca",
    question: "Posso levar acompanhante no encontro?",
    answer:
      "Sim, incentivamos que você avise alguém de confiança sobre o encontro ou vá acompanhado, especialmente se for a sua primeira negociação com a outra pessoa.",
  },
  {
    id: "faq-5",
    category: "regras",
    question: "Quais livros podem ser anunciados?",
    answer:
      "Apenas livros físicos em bom estado de conservação. É proibido anunciar cópias xerocadas, impressões piratas, materiais com conteúdo preconceituoso ou livros de distribuição restrita.",
  },
  {
    id: "faq-6",
    category: "suporte",
    question: "Como denunciar um anúncio abusivo ou falso?",
    answer:
      "Abra a tela de detalhes do livro e toque em 'Denunciar anúncio'. Escolha o motivo e informe os detalhes. Nossa equipe de moderação avaliará a denúncia em até 24 horas.",
  },
  {
    id: "faq-7",
    category: "suporte",
    question: "Como falar com a equipe do IpêBook?",
    answer:
      "Você pode entrar em contato conosco pelo e-mail contato@ipebook.com.br ou pessoalmente com a coordenação comunitária do projeto no IFPI Piripiri.",
  },
];
