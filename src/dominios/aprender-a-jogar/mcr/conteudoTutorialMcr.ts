/**
 * Tutorial do MCR para quem já joga Riichi. Fonte: "Guia do Mahjong Chinês (MCR)
 * para quem já sabe jogar Riichi Mahjong", Cerrado Mahjong Club (Juliana Visoni e
 * Gabriel Souza). Conteúdo longo do guia fica no domínio, como o Aprender a jogar.
 * Os trechos `riichi` são as diferenças que o guia marca em vermelho.
 */

export type BlocoTutorialMcr =
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'termos'; itens: { termo: string; definicao: string }[] }
  | { tipo: 'riichi'; texto: string }
  | { tipo: 'exemplosPontuacao' }
  | { tipo: 'linkGuiaBolso' }

export interface SecaoTutorialMcr {
  id: string
  titulo: string
  blocos: BlocoTutorialMcr[]
}

/** As diferenças para o Riichi, repetidas no resumo da última seção. */
export const DIFERENCAS_RIICHI = {
  honba: 'Não há Honba nem Renchan. O dealer passa a cada mão, vencendo ou não.',
  dealer: 'O dealer (Leste) não recebe nem paga a mais.',
  kuikae: 'Kuikae é permitido (ex.: Chi com 123 e descartar o 4).',
  kongOculto: 'O Kong oculto fica virado para baixo durante o jogo e só é revelado no fim.',
  furiten: 'Furiten não é penalizado. Você pode vencer com uma peça que descartou.',
  umVencedor:
    'Só existe um vencedor. Se mais de um jogador pedir Hu no mesmo descarte, vence o mais próximo de quem descartou, na ordem do jogo.',
  abrirMao: 'Abrir a mão só invalida os fan que são especificamente de mão oculta.',
  semRiichi: 'Riichi, Daburu Riichi, Ippatsu, Tenhou e Chiihou não existem.',
  placar: 'A pontuação de uma rodada não passa para a próxima.',
} as const

export const SECOES_TUTORIAL_MCR: SecaoTutorialMcr[] = [
  {
    id: 'o-que-e',
    titulo: 'O que é o MCR',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'O Mahjong Competition Rules (MCR), ou Guobiao, é o Mahjong Chinês oficial de competição. Ele tem 81 fan, organizados em 9 categorias e 12 patamares de pontos, de 1 a 88.',
      },
      { tipo: 'paragrafo', texto: 'Para vencer, a mão precisa somar no mínimo 8 pontos.' },
    ],
  },
  {
    id: 'glossario',
    titulo: 'Glossário',
    blocos: [
      {
        tipo: 'termos',
        itens: [
          { termo: 'Lun', definicao: 'Uma volta: cada jogador foi dealer uma vez.' },
          { termo: 'Pan', definicao: 'Uma mão.' },
          { termo: 'Quan', definicao: 'Uma rodada, com o mesmo Vento da Rodada.' },
          { termo: 'Ju', definicao: 'O jogo completo, ou a sessão.' },
          { termo: 'Vento da Rodada', definicao: 'O vento da rodada atual, igual para todos.' },
          { termo: 'Vento da Posição', definicao: 'O vento do lugar de cada jogador.' },
          { termo: 'Dealer', definicao: 'O jogador Leste, que começa a mão.' },
          { termo: 'Peças ocultas', definicao: 'As peças da mão que não foram expostas.' },
          { termo: 'Par / Cabeça', definicao: 'Duas peças iguais, o par da mão.' },
          { termo: 'Chow', definicao: 'Sequência de três números seguidos do mesmo naipe.' },
          { termo: 'Pung', definicao: 'Trinca de três peças iguais.' },
          { termo: 'Kong', definicao: 'Quadra de quatro peças iguais.' },
          { termo: 'Honras', definicao: 'Ventos e Dragões.' },
          { termo: 'Terminais', definicao: 'As peças 1 e 9 dos naipes.' },
          { termo: 'Bu Hua', definicao: 'Repor uma Flor: expor a Flor e comprar outra peça.' },
          { termo: 'Espera', definicao: 'As peças que completam a sua mão.' },
          { termo: 'Hu', definicao: 'Vencer a mão.' },
          { termo: 'Falso Hu', definicao: 'Declarar Hu sem ter uma mão válida.' },
          { termo: 'Muro', definicao: 'As peças ainda não compradas.' },
          { termo: 'Piso', definicao: 'A área dos descartes, no centro da mesa.' },
        ],
      },
    ],
  },
  {
    id: 'chamadas',
    titulo: 'Chamadas verbais',
    blocos: [
      {
        tipo: 'lista',
        itens: [
          '"Chi": para fazer um Chow com o descarte de quem joga antes de você.',
          '"Pung" (Peng): para fazer uma trinca com um descarte.',
          '"Kong" (Gang): para fazer uma quadra.',
          '"Hua": ao expor uma Flor.',
          '"Hu": ao vencer.',
        ],
      },
      { tipo: 'paragrafo', texto: 'A chamada precisa ser dita antes da ação.' },
    ],
  },
  {
    id: 'como-jogar',
    titulo: 'Como jogar',
    blocos: [
      {
        tipo: 'lista',
        itens: [
          'Joga-se no sentido anti-horário, começando pelo dealer. Depois de cada mão, os dados passam para o próximo jogador no sentido anti-horário.',
          'Você não pode comprar antes de o jogador anterior descartar.',
          'Os descartes ficam à vista de todos, da esquerda para a direita, em fileiras de 6.',
          'Prioridade das chamadas: Hu, depois Kong ou Pung, depois Chow.',
          'Você não pode fazer Kong no mesmo turno em que fez Chow ou Pung.',
          'Kong exposto: a mão deixa de ser oculta. Kong oculto: a mão continua podendo ser oculta.',
          'Flor: exponha, diga "Hua" e compre a reposição do fim do muro.',
          'Quem estiver com o número errado de peças entre os turnos (diferente de 13, sem contar as Flores) não pode pedir Hu.',
        ],
      },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.honba },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.dealer },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.kuikae },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.kongOculto },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.abrirMao },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.semRiichi },
    ],
  },
  {
    id: 'como-vencer',
    titulo: 'Como vencer',
    blocos: [
      {
        tipo: 'lista',
        itens: [
          'Ter uma estrutura válida: quatro conjuntos e um par, ou uma das mãos especiais.',
          'Somar 8 pontos ou mais. As Flores não contam para os 8.',
          'Conseguir a última peça de um jeito válido: compra própria ou descarte.',
          'A peça da vitória fica separada para a conferência.',
        ],
      },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.furiten },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.umVencedor },
    ],
  },
  {
    id: 'pontuacao',
    titulo: 'Pontuação',
    blocos: [
      {
        tipo: 'paragrafo',
        texto: 'Todo jogador que não venceu paga 8 pontos: os Pontos Obrigatórios.',
      },
      {
        tipo: 'lista',
        itens: [
          'Tsumo: (8 + Pontos da Mão) × 3. Cada um dos três paga 8 + Pontos da Mão.',
          'Ron: (8 × 3) + Pontos da Mão. Todos pagam 8, e só quem descartou paga também os Pontos da Mão.',
        ],
      },
      { tipo: 'exemplosPontuacao' },
      {
        tipo: 'paragrafo',
        texto:
          'Objeções precisam ser feitas durante a contagem. Depois que o juiz decide, não cabem mais objeções nem fan esquecidos.',
      },
      { tipo: 'riichi', texto: DIFERENCAS_RIICHI.placar },
    ],
  },
  {
    id: 'principios',
    titulo: 'Princípios de contagem dos fan',
    blocos: [
      {
        tipo: 'paragrafo',
        texto:
          'Conte primeiro o fan principal da mão e, depois, os demais seguindo estes princípios:',
      },
      {
        tipo: 'termos',
        itens: [
          {
            termo: 'Não Repetição',
            definicao: 'Um fan que já está implícito em outro não é contado de novo.',
          },
          {
            termo: 'Não Decomposição',
            definicao: 'Um conjunto já usado num fan não é desmontado para formar outro.',
          },
          {
            termo: 'Não Reutilização do Mesmo Fan',
            definicao:
              'Os conjuntos que já formaram um fan não formam o mesmo fan com outro conjunto.',
          },
          {
            termo: 'Prioridade do Fan de Maior Valor',
            definicao: 'Quando houver mais de uma forma de contar, vale a que dá mais pontos.',
          },
          {
            termo: 'Contagem Única',
            definicao:
              'Um conjunto pode se combinar com os outros apenas uma vez em fan de combinação.',
          },
        ],
      },
      {
        tipo: 'paragrafo',
        texto: 'O mesmo fan pode contar mais de uma vez na mão, como dois Yakuhai no Riichi.',
      },
    ],
  },
  {
    id: 'diferencas',
    titulo: 'Diferenças para o Riichi',
    blocos: [
      ...Object.values(DIFERENCAS_RIICHI).map(
        (texto): BlocoTutorialMcr => ({ tipo: 'riichi', texto }),
      ),
      { tipo: 'linkGuiaBolso' },
    ],
  },
]

/** Exemplos da seção Pontuação, calculados pelo pagamento MCR. */
export const EXEMPLOS_PONTUACAO_MCR = [
  { forma: 'ron', pontos: 8 },
  { forma: 'ron', pontos: 24 },
  { forma: 'tsumo', pontos: 8 },
  { forma: 'tsumo', pontos: 24 },
] as const
