/**
 * Tutorial do modo Chinês (MCR), no mesmo formato do Aprender a jogar do Riichi:
 * o livro, o índice, os ranks e os quizzes são os mesmos; só o conteúdo muda.
 *
 * Fonte: "Guia do Mahjong Chinês (MCR) para quem já sabe jogar Riichi Mahjong", do
 * Cerrado Mahjong Club (o uso foi autorizado, sem crédito na tela). O que o guia marca em
 * vermelho (as diferenças para o Riichi) aparece com `==...==`, também em vermelho.
 */
import { calcularPagamentoMcr } from '@/dominios/calculadora-mao-chinesa/logica/pontuacao-mcr'
import { conteudoPtBR } from '../pt-BR'
import type { ConteudoTutorial } from '../tipos'
import { GLOSSARIO_MCR } from './glossario'

/** Linha da tabela de exemplos, calculada pelo mesmo pagamento da calculadora. */
function exemplo(forma: 'ron' | 'tsumo', pontos: number): string[] {
  const { ganhadorRecebe, pagamentos } = calcularPagamentoMcr(pontos, forma)
  const quemPaga =
    forma === 'ron'
      ? `quem descartou ${pagamentos[0].valor}, os outros ${pagamentos[1].valor} e ${pagamentos[2].valor}`
      : `cada um ${pagamentos[0].valor}`
  return [`${forma === 'ron' ? 'Ron' : 'Tsumo'}, ${pontos} pts`, quemPaga, String(ganhadorRecebe)]
}

export const conteudoMcrPtBR: ConteudoTutorial = {
  // Três partes: Novato, Adepto e Veterano; com o livro concluído, Mestre do MCR.
  ranks: ['Novato', 'Adepto', 'Veterano', 'Mestre do MCR', 'Mestre do MCR'],
  ilustracoes: conteudoPtBR.ilustracoes,
  dicaRank:
    'Cada módulo concluído vale uma estrela. Complete uma parte para subir de rank: Novato, Adepto, Veterano e Mestre do MCR.',
  textoConclusao: `Agora é jogar! O Placar anota as mãos e o Ranking soma os pontos.`,
  glossary: GLOSSARIO_MCR,
  tutorialParts: [
    {
      id: 'mcr-parte-1',
      number: 1,
      title: 'Do Riichi ao MCR',
      cover: 'O que muda quando você troca o Riichi pelo Mahjong Chinês oficial.',
      modules: [
        {
          id: 'mcr-o-que-e',
          number: 1,
          title: 'O que é o MCR',
          cover: '81 fan, 12 patamares e um mínimo de 8 pontos.',
          pages: [
            {
              id: 'mcr-o-que-e-1',
              number: '1.1',
              title: 'Mahjong Competition Rules',
              blocks: [
                {
                  type: 'text',
                  md: 'O **Mahjong Competition Rules (MCR)**, ou Guobiao, é o Mahjong Chinês oficial de competição.\n- 81 fan (as combinações que pontuam).\n- 9 categorias.\n- 12 patamares de pontos, de 1 a 88.',
                },
                { type: 'text', md: 'Para vencer, a mão precisa somar ==no mínimo 8 pontos==.' },
                {
                  type: 'tip',
                  md: 'Na Calculadora de Mão, o chapéu abre o **Guia de bolso** com os 81 fan e o equivalente de cada um no Riichi.',
                },
              ],
            },
            {
              id: 'mcr-o-que-e-2',
              number: '1.2',
              title: 'O que não existe no MCR',
              blocks: [
                {
                  type: 'text',
                  md: '==Riichi, Daburu Riichi, Ippatsu, Tenhou e Chiihou não existem.==\n\n==Não há dora, ura dora nem aka dora.== E ==não existe fu==: a mão vale só pelos fan.',
                },
                {
                  type: 'text',
                  md: 'Pinfu e Junchan não têm um equivalente exato. Os outros yaku costumam ter um fan parecido, que o Guia de bolso mostra.',
                },
              ],
            },
          ],
          quiz: [
            {
              type: 'quiz',
              question: 'Quantos pontos uma mão precisa ter, no mínimo, para vencer no MCR?',
              answer: '8 pontos, sem contar as Flores.',
              options: [{ label: '1' }, { label: '8', correct: true }, { label: '13' }],
            },
          ],
        },
        {
          id: 'mcr-termos',
          number: 2,
          title: 'Termos e chamadas',
          cover: 'O vocabulário da mesa chinesa e o que dizer em voz alta.',
          pages: [
            {
              id: 'mcr-termos-1',
              number: '2.1',
              title: 'Termos',
              blocks: [
                {
                  type: 'table',
                  headers: ['Termo', 'O que é'],
                  rows: [
                    ['Lun', 'Uma volta: cada jogador foi dealer uma vez.'],
                    ['Pan', 'Uma mão.'],
                    ['Quan', 'Uma rodada, com o mesmo Vento da Rodada.'],
                    ['Ju', 'O jogo completo, ou a sessão.'],
                    ['Chow, Pung, Kong', 'Sequência, trinca e quadra.'],
                    ['Bu Hua', 'Repor uma Flor.'],
                    ['Hu', 'Vencer a mão.'],
                    ['Falso Hu', 'Declarar Hu sem ter uma mão válida.'],
                    ['Muro e Piso', 'As peças por comprar e a área dos descartes.'],
                  ],
                },
                { type: 'tip', md: 'O glossário completo fica no índice do livro.' },
              ],
            },
            {
              id: 'mcr-termos-2',
              number: '2.2',
              title: 'Chamadas verbais',
              blocks: [
                {
                  type: 'text',
                  md: '- **"Chi"**: Chow com o descarte de quem joga antes de você.\n- **"Pung"** (Peng): trinca com um descarte.\n- **"Kong"** (Gang): quadra.\n- **"Hua"**: ao expor uma Flor.\n- **"Hu"**: ao vencer.',
                },
                { type: 'text', md: 'A chamada precisa ser dita ==antes da ação==.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'mcr-parte-2',
      number: 2,
      title: 'Jogando',
      cover: 'Turnos, chamadas, flores e como vencer.',
      milestone: {
        title: 'Você já conhece a base!',
        md: 'Agora é ver como a mão anda na mesa chinesa.',
      },
      modules: [
        {
          id: 'mcr-como-jogar',
          number: 3,
          title: 'Como jogar',
          cover: 'A ordem, os descartes e o que muda nas chamadas.',
          pages: [
            {
              id: 'mcr-como-jogar-1',
              number: '3.1',
              title: 'Turnos e descartes',
              blocks: [
                {
                  type: 'text',
                  md: '- Joga-se no sentido anti-horário, começando pelo dealer.\n- Depois de cada mão, os dados passam para o próximo jogador no sentido anti-horário.\n- Você não pode comprar antes de o jogador anterior descartar.\n- Os descartes ficam à vista, da esquerda para a direita, em fileiras de 6.',
                },
                {
                  type: 'text',
                  md: '==Diferente do Riichi:== não há Honba nem Renchan. O dealer passa a cada mão, vencendo ou não, e ==não recebe nem paga a mais==.',
                },
              ],
            },
            {
              id: 'mcr-como-jogar-2',
              number: '3.2',
              title: 'Chamadas',
              blocks: [
                {
                  type: 'text',
                  md: '- Prioridade: **Hu**, depois **Kong ou Pung**, depois **Chow**.\n- Você não pode fazer Kong no mesmo turno em que fez Chow ou Pung.\n- Kong exposto: a mão deixa de ser oculta. Kong oculto: a mão continua podendo ser oculta.',
                },
                {
                  type: 'text',
                  md: '==Diferente do Riichi:== ==Kuikae é permitido== (ex.: Chi com 123 e descartar o 4). O Kong oculto fica ==virado para baixo== durante o jogo e só é revelado no fim. Abrir a mão só invalida os fan que são de mão oculta.',
                },
              ],
            },
            {
              id: 'mcr-como-jogar-3',
              number: '3.3',
              title: 'Flores',
              blocks: [
                {
                  type: 'text',
                  md: 'Tirou uma Flor ou Estação? Exponha, diga **"Hua"** e compre a reposição do fim do muro.\n\nCada Flor vale **1 ponto** ao vencer, mas ==não conta para o mínimo de 8==. No MCR as oito valem o mesmo: só o desenho muda.',
                },
                {
                  type: 'text',
                  md: 'Quem estiver com o número errado de peças entre os turnos (diferente de 13, sem contar as Flores) não pode pedir Hu.',
                },
              ],
            },
          ],
        },
        {
          id: 'mcr-como-vencer',
          number: 4,
          title: 'Como vencer',
          cover: 'Estrutura, 8 pontos e a última peça.',
          pages: [
            {
              id: 'mcr-como-vencer-1',
              number: '4.1',
              title: 'Hu',
              blocks: [
                {
                  type: 'text',
                  md: '- Uma estrutura válida: quatro conjuntos e um par, ou uma das mãos especiais.\n- **8 pontos ou mais**, sem contar as Flores.\n- A última peça conseguida de um jeito válido: compra própria ou descarte.\n- A peça da vitória fica separada para a conferência.',
                },
              ],
            },
            {
              id: 'mcr-como-vencer-2',
              number: '4.2',
              title: 'Furiten e empate de Hu',
              blocks: [
                {
                  type: 'text',
                  md: '==Diferente do Riichi:== ==furiten não é penalizado==. Você pode vencer com uma peça que descartou.',
                },
                {
                  type: 'text',
                  md: '==Só existe um vencedor.== Se mais de um jogador pedir Hu no mesmo descarte, vence o mais próximo de quem descartou, na ordem do jogo.',
                },
              ],
            },
          ],
          quiz: [
            {
              type: 'quiz',
              question:
                'Você descartou um 5 de Círculos e depois ele completaria a sua mão. Pode vencer com ele no MCR?',
              answer: 'Pode. No MCR o furiten não é penalizado.',
              options: [{ label: 'Pode', correct: true }, { label: 'Não pode, é furiten' }],
            },
          ],
        },
      ],
    },
    {
      id: 'mcr-parte-3',
      number: 3,
      title: 'Pontuação',
      cover: 'Quanto cada um paga e como contar os fan.',
      milestone: { title: 'Você já pode jogar!', md: 'Falta só saber quanto a mão vale.' },
      modules: [
        {
          id: 'mcr-pontuacao',
          number: 5,
          title: 'Pagamentos',
          cover: 'Os 8 pontos obrigatórios e os pontos da mão.',
          pages: [
            {
              id: 'mcr-pontuacao-1',
              number: '5.1',
              title: 'Fórmulas',
              blocks: [
                {
                  type: 'text',
                  md: 'Todo jogador que não venceu paga **8 pontos**: os Pontos Obrigatórios.',
                },
                {
                  type: 'text',
                  md: '- **Tsumo:** (8 + Pontos da Mão) × 3. Cada um dos três paga 8 + Pontos da Mão.\n- **Ron:** (8 × 3) + Pontos da Mão. Todos pagam 8, e só quem descartou paga também os Pontos da Mão.',
                },
                {
                  type: 'text',
                  md: '==Diferente do Riichi:== a pontuação de uma rodada não passa para a próxima.',
                },
              ],
            },
            {
              id: 'mcr-pontuacao-2',
              number: '5.2',
              title: 'Exemplos',
              blocks: [
                {
                  type: 'table',
                  headers: ['Exemplo', 'Quem paga', 'Vencedor recebe'],
                  rows: [
                    exemplo('ron', 8),
                    exemplo('ron', 24),
                    exemplo('tsumo', 8),
                    exemplo('tsumo', 24),
                  ],
                },
                {
                  type: 'text',
                  md: 'Objeções precisam ser feitas durante a contagem. Depois que o juiz decide, não cabem mais objeções nem fan esquecidos.',
                },
                { type: 'appLink', tool: 'calculadora', label: 'Abrir a Calculadora de Mão' },
              ],
            },
          ],
          quiz: [
            {
              type: 'quiz',
              question: 'Ron de 8 pontos: quanto quem descartou paga?',
              answer: '16: os 8 obrigatórios mais os 8 da mão. Os outros dois pagam 8 cada.',
              options: [{ label: '8' }, { label: '16', correct: true }, { label: '24' }],
            },
          ],
        },
        {
          id: 'mcr-contagem',
          number: 6,
          title: 'Contando os fan',
          cover: 'Os princípios que evitam contar a mesma coisa duas vezes.',
          pages: [
            {
              id: 'mcr-contagem-1',
              number: '6.1',
              title: 'Princípios de contagem',
              blocks: [
                {
                  type: 'text',
                  md: 'Conte primeiro o **fan principal** da mão e, depois, os demais seguindo estes princípios:',
                },
                {
                  type: 'table',
                  headers: ['Princípio', 'O que diz'],
                  rows: [
                    ['Não Repetição', 'Um fan já implícito em outro não é contado de novo.'],
                    [
                      'Não Decomposição',
                      'Um conjunto usado num fan não é desmontado para formar outro.',
                    ],
                    [
                      'Não Reutilização do Mesmo Fan',
                      'Conjuntos que já formaram um fan não formam o mesmo fan com outro conjunto.',
                    ],
                    [
                      'Prioridade do Fan de Maior Valor',
                      'Com mais de uma forma de contar, vale a que dá mais pontos.',
                    ],
                    [
                      'Contagem Única',
                      'Um conjunto se combina com os outros só uma vez em fan de combinação.',
                    ],
                  ],
                },
                {
                  type: 'text',
                  md: 'O mesmo fan pode contar mais de uma vez na mão, como dois Yakuhai no Riichi.',
                },
              ],
            },
            {
              id: 'mcr-contagem-2',
              number: '6.2',
              title: 'Resumo: diferenças para o Riichi',
              blocks: [
                {
                  type: 'text',
                  md: '- ==Sem Honba nem Renchan==: o dealer passa a cada mão.\n- ==O dealer não recebe nem paga a mais.==\n- ==Kuikae é permitido.==\n- ==O Kong oculto fica virado para baixo== até o fim.\n- ==Furiten não é penalizado.==\n- ==Só um vencedor== por descarte.\n- Abrir a mão só invalida os fan de mão oculta.\n- ==Riichi, Daburu Riichi, Ippatsu, Tenhou e Chiihou não existem.==\n- A pontuação de uma rodada não passa para a próxima.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
