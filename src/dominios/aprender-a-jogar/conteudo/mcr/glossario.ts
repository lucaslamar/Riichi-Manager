import type { ItemGlossario, SecaoGlossario } from '@/dominios/calculadora-mao/logica/glossario'
import type { TermoGlossarioGuia } from '../tipos'

/** Item do MCR: `diferente` vira a nota "Diferente do Riichi" no fim, como as dicas do glossário japonês. */
type ItemMcr = Omit<ItemGlossario, 'aliases'> & { diferente?: string }

const NOTA_DIFERENTE = 'Diferente do Riichi: '

const item = ({ diferente, ...resto }: ItemMcr): ItemGlossario => ({
  ...resto,
  aliases: [],
  nota: diferente ? NOTA_DIFERENTE + diferente : resto.nota,
})

/**
 * Glossário do MCR (guia do Cerrado Mahjong Club, seção 1) no formato do
 * glossário do Riichi: assuntos em blocos, com pedras de exemplo. É o mesmo do
 * livro e da aba Glossário do Guia de bolso no modo Chinês.
 */
export const SECOES_GLOSSARIO_MCR: SecaoGlossario[] = [
  {
    id: 'mcr-pecas',
    titulo: 'Peças',
    intro: '144 peças: 136 iguais às do Riichi, sem as vermelhas, mais 8 flores.',
    itens: [
      item({
        id: 'mcr-naipes',
        nome: 'Naipes',
        texto: 'Caracteres, círculos e bambus, numerados de 1 a 9.',
        pedras: { tipo: 'mpsz', mpsz: '123456789m', numerar: true },
      }),
      item({
        id: 'mcr-honras',
        nome: 'Honras',
        texto: 'Ventos (Leste, Sul, Oeste, Norte) e Dragões (Branco, Verde, Vermelho).',
        pedras: { tipo: 'mpsz', mpsz: '1234567z', numerar: true },
      }),
      item({
        id: 'mcr-terminais',
        nome: 'Terminais',
        texto: 'Peças 1 e 9 de cada naipe.',
        pedras: { tipo: 'mpsz', mpsz: '19m 19p 19s' },
      }),
      item({
        id: 'mcr-flor',
        nome: 'Flor',
        kanji: '花',
        leitura: 'Hua / Bu Hua',
        texto:
          'Flores e Estações. Expor, dizer "Hua" e pegar reposição do fim do muro. Cada uma vale 1 ponto e não conta para o mínimo de 8.',
        diferente: 'o Riichi não tem flores.',
      }),
    ],
  },
  {
    id: 'mcr-conjuntos',
    titulo: 'Conjuntos',
    intro: 'A mão normal tem 4 conjuntos e 1 par.',
    exemplo: {
      mpsz: '123m 456p 777s 222z 55m',
      rotulos: ['Chow', 'Chow', 'Pung', 'Pung', 'Par'],
    },
    itens: [
      item({
        id: 'mcr-par',
        nome: 'Par',
        apelido: 'Cabeça',
        texto: 'As duas peças iguais da estrutura normal da mão.',
        pedras: { tipo: 'mpsz', mpsz: '55m' },
      }),
      item({
        id: 'mcr-chow',
        nome: 'Chow',
        kanji: '吃',
        leitura: 'Chi',
        texto:
          'Sequência de 3 números seguidos do mesmo naipe. Só pode pegar descarte do jogador à esquerda.',
        pedras: { tipo: 'mpsz', mpsz: '123m' },
        diferente: 'Kuikae é permitido.',
      }),
      item({
        id: 'mcr-pung',
        nome: 'Pung',
        kanji: '碰',
        leitura: 'Peng',
        texto:
          'Três peças iguais. Pode pegar descarte de qualquer jogador. Tem prioridade sobre Chow.',
        pedras: { tipo: 'mpsz', mpsz: '777s' },
      }),
      item({
        id: 'mcr-kong',
        nome: 'Kong',
        kanji: '杠',
        leitura: 'Gang',
        texto: 'Quatro peças iguais. Exige peça de reposição do fim do muro.',
        pedras: { tipo: 'mpsz', mpsz: '2222p' },
      }),
      item({
        id: 'mcr-kong-oculto',
        nome: 'Kong Oculto',
        texto: 'Kong com as 4 peças próprias.',
        diferente: 'fica virado para baixo até o fim da mão.',
      }),
      item({
        id: 'mcr-ocultas',
        nome: 'Peças ocultas',
        texto: 'Peças não combinadas em conjuntos expostos antes do Hu.',
      }),
    ],
  },
  {
    id: 'mcr-partida',
    titulo: 'Partida',
    itens: [
      item({
        id: 'mcr-lun',
        nome: 'Lun',
        apelido: 'Uma volta',
        texto: 'Todos descartaram uma peça, cada um na sua vez.',
      }),
      item({
        id: 'mcr-pan',
        nome: 'Pan',
        apelido: 'Mão',
        texto: 'Da distribuição das peças até alguém declarar Hu ou empate.',
      }),
      item({
        id: 'mcr-quan',
        nome: 'Quan',
        apelido: 'Rodada',
        texto: 'Todos foram dealer uma vez. Um jogo tem 4 rodadas.',
      }),
      item({
        id: 'mcr-ju',
        nome: 'Ju',
        apelido: 'Jogo completo / Sessão',
        texto: 'Quatro rodadas ou o fim do tempo do torneio.',
      }),
      item({
        id: 'mcr-vento-rodada',
        nome: 'Vento da Rodada',
        texto: 'Leste, Sul, Oeste e Norte, um para cada rodada.',
        pedras: { tipo: 'mpsz', mpsz: '1234z' },
      }),
      item({
        id: 'mcr-vento-posicao',
        nome: 'Vento da Posição',
        texto:
          'Posição do jogador: o dealer é Leste, à direita Sul, em frente Oeste e à esquerda Norte.',
      }),
      item({
        id: 'mcr-dealer',
        nome: 'Dealer',
        texto:
          'Jogador na posição Leste. Passa os dados para a direita ao fim de toda mão, vencendo ou não.',
        diferente: 'não tem bônus nem Honba.',
      }),
      item({ id: 'mcr-muro', nome: 'Muro', texto: 'As 4 fileiras de 18 pilhas.' }),
      item({
        id: 'mcr-piso',
        nome: 'Piso',
        texto: 'Área central entre os muros, onde ficam os descartes.',
      }),
      item({ id: 'mcr-empate', nome: 'Empate', texto: 'O muro acabou sem ninguém vencer.' }),
    ],
  },
  {
    id: 'mcr-vitoria',
    titulo: 'Vitória',
    itens: [
      item({
        id: 'mcr-espera',
        nome: 'Espera',
        texto: 'Aguardar uma peça para completar a mão.',
        diferente: 'não há furiten. Dá para vencer com uma peça que você descartou.',
      }),
      item({
        id: 'mcr-hu',
        nome: 'Hu',
        kanji: '和',
        texto: 'Declarar vitória. A mão precisa de estrutura válida e no mínimo 8 pontos.',
      }),
      item({
        id: 'mcr-zimo',
        nome: 'Zimo',
        kanji: '自摸',
        texto: 'Vitória por compra própria (Tsumo).',
      }),
      item({
        id: 'mcr-dianhe',
        nome: 'Dianhe',
        kanji: '点和',
        texto: 'Vitória por descarte (Ron).',
      }),
      item({
        id: 'mcr-peca-vitoria',
        nome: 'Peça da Vitória',
        texto: 'Peça da batida. Fica separada para conferência.',
      }),
      item({ id: 'mcr-falso-hu', nome: 'Falso Hu', texto: 'Declarar Hu sem mão válida.' }),
    ],
  },
  {
    id: 'mcr-pontuacao',
    titulo: 'Pontuação',
    itens: [
      item({
        id: 'mcr-fan',
        nome: 'Fan',
        kanji: '番',
        texto: 'Cada elemento de pontuação. São 81.',
      }),
      item({
        id: 'mcr-obrigatorios',
        nome: 'Pontos Obrigatórios',
        texto: 'Os 8 pontos que cada perdedor paga ao vencedor.',
      }),
    ],
  },
  {
    id: 'mcr-penalidades',
    titulo: 'Penalidades',
    itens: [
      item({
        id: 'mcr-descarte-obrigatorio',
        nome: 'Descarte Obrigatório',
        texto: 'Peça que deve ser descartada no turno seguinte por exposição incorreta.',
      }),
      item({
        id: 'mcr-contagem-incorreta',
        nome: 'Contagem Incorreta',
        texto: 'Ter mais ou menos de 13 peças entre turnos (sem flores). Impede o Hu.',
      }),
    ],
  },
]

/** A mesma lista em termos soltos, para o glossário do livro (Tutorial). */
export const GLOSSARIO_MCR: TermoGlossarioGuia[] = SECOES_GLOSSARIO_MCR.flatMap((secao) =>
  secao.itens.map(({ nome, apelido, leitura, texto, nota }) => {
    const diferenteRiichi = !!nota?.startsWith(NOTA_DIFERENTE)
    return {
      term: [nome, leitura ?? apelido].filter(Boolean).join(' / '),
      definition: [texto, diferenteRiichi ? nota?.slice(NOTA_DIFERENTE.length) : undefined]
        .filter(Boolean)
        .join(' '),
      diferenteRiichi,
    }
  }),
)
