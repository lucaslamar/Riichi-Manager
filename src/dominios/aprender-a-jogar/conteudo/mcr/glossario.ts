import type { TermoGlossarioGuia } from '../tipos'

/**
 * Glossário do MCR (guia do Cerrado Mahjong Club, seção 1). O mesmo do livro e
 * da aba Glossário do Guia de bolso no modo Chinês. `diferenteRiichi` marca o
 * que muda em relação ao Riichi.
 */
export const GLOSSARIO_MCR: TermoGlossarioGuia[] = [
  { term: 'Lun (Uma volta)', definition: 'Todos descartaram uma peça, cada um na sua vez.' },
  { term: 'Pan (Mão)', definition: 'Da distribuição das peças até alguém declarar Hu ou empate.' },
  { term: 'Quan (Rodada)', definition: 'Todos foram dealer uma vez. Um jogo tem 4 rodadas.' },
  {
    term: 'Ju (Jogo completo / Sessão)',
    definition: 'Quatro rodadas ou o fim do tempo do torneio.',
  },
  { term: 'Vento da Rodada', definition: 'Leste, Sul, Oeste e Norte, um para cada rodada.' },
  {
    term: 'Vento da Posição',
    definition:
      'Posição do jogador: o dealer é Leste, à direita Sul, em frente Oeste e à esquerda Norte.',
  },
  {
    term: 'Dealer',
    definition:
      'Jogador na posição Leste. Passa os dados para a direita ao fim de toda mão, vencendo ou não. Não tem bônus nem Honba.',
    diferenteRiichi: true,
  },
  { term: 'Peças ocultas', definition: 'Peças não combinadas em conjuntos expostos antes do Hu.' },
  { term: 'Par (Cabeça)', definition: 'As duas peças iguais da estrutura normal da mão.' },
  {
    term: 'Chow (Chi)',
    definition:
      'Sequência de 3 números seguidos do mesmo naipe. Só pode pegar descarte do jogador à esquerda. Kuikae é permitido.',
    diferenteRiichi: true,
  },
  {
    term: 'Pung (Peng)',
    definition:
      'Três peças iguais. Pode pegar descarte de qualquer jogador. Tem prioridade sobre Chow.',
  },
  {
    term: 'Kong (Gang)',
    definition: 'Quatro peças iguais. Exige peça de reposição do fim do muro.',
  },
  {
    term: 'Kong Oculto',
    definition: 'Kong com as 4 peças próprias, virado para baixo até o fim da mão.',
    diferenteRiichi: true,
  },
  {
    term: 'Honras',
    definition: 'Ventos (Leste, Sul, Oeste, Norte) e Dragões (Branco, Vermelho, Verde).',
  },
  { term: 'Terminais', definition: 'Peças 1 e 9 de cada naipe.' },
  {
    term: 'Flor (Hua / Bu Hua)',
    definition:
      'Flores e Estações. Expor, dizer "Hua" e pegar reposição do fim do muro. Cada uma vale 1 ponto e não conta para o mínimo de 8.',
    diferenteRiichi: true,
  },
  {
    term: 'Espera',
    definition:
      'Aguardar uma peça para completar a mão. Não há furiten: dá para vencer com uma peça que você descartou.',
    diferenteRiichi: true,
  },
  {
    term: 'Hu',
    definition: 'Declarar vitória. A mão precisa de estrutura válida e no mínimo 8 pontos.',
  },
  { term: 'Zimo', definition: 'Vitória por compra própria (Tsumo).' },
  { term: 'Dianhe', definition: 'Vitória por descarte (Ron).' },
  { term: 'Fan', definition: 'Cada elemento de pontuação. São 81.' },
  { term: 'Pontos Obrigatórios', definition: 'Os 8 pontos que cada perdedor paga ao vencedor.' },
  {
    term: 'Descarte Obrigatório',
    definition: 'Peça que deve ser descartada no turno seguinte por exposição incorreta.',
  },
  { term: 'Peça da Vitória', definition: 'Peça da batida. Fica separada para conferência.' },
  {
    term: 'Contagem Incorreta',
    definition: 'Ter mais ou menos de 13 peças entre turnos (sem flores). Impede o Hu.',
  },
  { term: 'Falso Hu', definition: 'Declarar Hu sem mão válida.' },
  { term: 'Empate', definition: 'O muro acabou sem ninguém vencer.' },
  { term: 'Muro', definition: 'As 4 fileiras de 18 pilhas.' },
  { term: 'Piso', definition: 'Área central entre os muros, onde ficam os descartes.' },
]
