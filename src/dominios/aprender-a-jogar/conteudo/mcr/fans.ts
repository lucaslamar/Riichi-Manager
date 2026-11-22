/** Parte 5: os 81 fan. Cartões, mãos e respostas saem de `fans-mcr.ts` e do motor. */
import { FANS_MCR, fanMcrPorId, type CategoriaFanMcr } from '@/compartilhado/mahjong/mcr/fans-mcr'
import { lerNotacaoMcr } from '@/compartilhado/mahjong/mcr/notacao'
import { calcularNotacaoMcr } from '@/dominios/calculadora-mao-chinesa/logica/notacao-mcr'
import type { TutorialBlock, TutorialPart } from '../tipos'
import { criarModulo, pagina, texto, type Quiz, type Traduzir } from './auxiliares'

/** Fan para começar, dos mais simples aos que valem 8 ou mais sozinhos. */
const PARA_COMECAR = [63, 62, 80, 59, 60, 61, 48, 49, 39, 41, 43, 19, 22]
const CARTOES_POR_PAGINA = 3

const fanDe = (id: number) => {
  const fan = fanMcrPorId(id)
  if (!fan) throw new Error(`Fan do MCR inexistente: ${id}`)
  return fan
}

/** Id do motor (1–34) para mpsz: C F P do motor são 7z, 6z e 5z. */
function codigoPedra(id: number) {
  if (id <= 9) return `${id}m`
  if (id <= 18) return `${id - 9}s`
  if (id <= 27) return `${id - 18}p`
  return `${[1, 2, 3, 4, 7, 6, 5][id - 28]}z`
}

/** Grupos na tela: as chamadas, as ocultas por naipe e, separada, a pedra da batida. */
export function mpszDoExemplo(notacao: string) {
  const { chamadas, pedras } = lerNotacaoMcr(notacao)
  const juntar = (ids: number[]) =>
    [...'mpsz']
      .map((naipe) => {
        const numeros = ids
          .map(codigoPedra)
          .filter((codigo) => codigo.endsWith(naipe))
          .map((codigo) => codigo[0])
          .sort()
        return numeros.length ? `${numeros.join('')}${naipe}` : ''
      })
      .filter(Boolean)
      .join(' ')
  return [
    ...chamadas.map((chamada) => juntar(chamada.pedras)),
    juntar(pedras.slice(0, -1)),
    juntar(pedras.slice(-1)),
  ].join(' ')
}

/** A certa muda de lugar de uma pergunta para outra, sempre igual para o mesmo fan. */
function opcoes(certa: string, erradas: string[], semente: number) {
  const lista: NonNullable<Quiz['options']> = erradas.map((label) => ({ label }))
  lista.splice(semente % (erradas.length + 1), 0, { label: certa, correct: true })
  return lista
}

const situacao = (t: Traduzir, notacao: string) =>
  lerNotacaoMcr(notacao).tsumo ? t('tutorial.mcr.fans.porZimo') : t('tutorial.mcr.fans.porDianhe')

function qualFan(t: Traduzir, id: number): Quiz {
  const fan = fanDe(id)
  const naMao = new Set(calcularNotacaoMcr(fan.exemplo).fans.map((contado) => contado.id))
  // Só erra por um fan que o motor não contou nesta mão.
  const erradas = FANS_MCR.filter((outro) => !naMao.has(outro.id) && outro.id !== 81)
    .sort((a, b) => Math.abs(a.id - id) - Math.abs(b.id - id) || a.id - b.id)
    .slice(0, 2)
  return {
    type: 'quiz',
    question: `${t('tutorial.mcr.fans.qualFan')} ${situacao(t, fan.exemplo)}`,
    hand: mpszDoExemplo(fan.exemplo),
    answer: `${fan.pt} ${fan.hanzi}: ${fan.descricao}`,
    options: opcoes(
      fan.pt,
      erradas.map((outro) => outro.pt),
      id,
    ),
  }
}

function quantosFan(t: Traduzir, id: number): Quiz {
  const { exemplo } = fanDe(id)
  const { fans, fanTotal } = calcularNotacaoMcr(exemplo)
  const contados = [...new Set(fans.map((contado) => contado.id))]
    .map((contado) => fanMcrPorId(contado)?.pt)
    .filter(Boolean)
    .join(', ')
  return {
    type: 'quiz',
    question: `${t('tutorial.mcr.fans.quantosFan')} ${situacao(t, exemplo)}`,
    hand: mpszDoExemplo(exemplo),
    answer: `${t('mcr.resultado.fanTotal', { total: fanTotal })}: ${contados}.`,
    options: opcoes(String(fanTotal), [String(fanTotal + 2), String(fanTotal + 6)], id),
  }
}

const linkGuia = (t: Traduzir): TutorialBlock => ({
  type: 'appLink',
  tool: 'guiaBolso',
  label: t('tutorial.mcr.fans.verTodos'),
})

function paginasDeCartoes(t: Traduzir, nome: string, ids: number[]) {
  const total = Math.ceil(ids.length / CARTOES_POR_PAGINA)
  return Array.from({ length: total }, (_, indice) => {
    const blocos: TutorialBlock[] = [
      {
        type: 'fans',
        ids: ids.slice(indice * CARTOES_POR_PAGINA, (indice + 1) * CARTOES_POR_PAGINA),
      },
    ]
    if (indice === total - 1) blocos.push(linkGuia(t))
    return pagina(`${nome} (${indice + 1}/${total})`, blocos)
  })
}

export function parteDosFan(t: Traduzir): TutorialPart {
  const grupo = (
    id: string,
    numero: number,
    nome: string,
    capa: string,
    categorias: CategoriaFanMcr[],
    perguntas: [number, number, number],
  ) => {
    const ids = FANS_MCR.filter((fan) => categorias.includes(fan.categoria)).map((fan) => fan.id)
    return criarModulo(id, numero, nome, capa, paginasDeCartoes(t, nome, ids), [
      qualFan(t, perguntas[0]),
      qualFan(t, perguntas[1]),
      quantosFan(t, perguntas[2]),
    ])
  }
  const soma = (...ids: number[]) => [
    ids.map((id) => fanDe(id).pt).join(' + '),
    String(ids.reduce((total, id) => total + fanDe(id).pontos, 0)),
  ]
  const comecar = t('tutorial.mcr.fans.comecar.titulo')

  return {
    id: 'mcr-parte-5',
    number: 5,
    title: t('tutorial.mcr.parte5.titulo'),
    cover: t('tutorial.mcr.parte5.capa'),
    milestone: {
      title: t('tutorial.mcr.parte5.marco'),
      md: t('tutorial.mcr.parte5.marcoTexto'),
    },
    modules: [
      criarModulo(
        'mcr-fan-comecar',
        16,
        comecar,
        t('tutorial.mcr.fans.comecar.capa'),
        [
          pagina(t('tutorial.mcr.fans.comecar.somar'), [
            texto(t('tutorial.mcr.fans.comecar.texto')),
            {
              type: 'table',
              headers: [
                t('tutorial.mcr.fans.comecar.combinacao'),
                t('tutorial.mcr.fans.comecar.pontos'),
              ],
              rows: [soma(39), soma(41), soma(48, 59), soma(49, 62), soma(19), soma(22)],
            },
            texto(t('tutorial.mcr.fans.comecar.aviso')),
          ]),
          ...paginasDeCartoes(t, comecar, PARA_COMECAR),
        ],
        [qualFan(t, 39), qualFan(t, 48), quantosFan(t, 49)],
      ),
      grupo(
        'mcr-fan-sequencias',
        17,
        t('tutorial.mcr.fans.sequencias.titulo'),
        t('tutorial.mcr.fans.sequencias.capa'),
        ['chows'],
        [28, 41, 39],
      ),
      grupo(
        'mcr-fan-trincas',
        18,
        t('tutorial.mcr.fans.trincas.titulo'),
        t('tutorial.mcr.fans.trincas.capa'),
        ['pungs', 'kongs'],
        [32, 17, 48],
      ),
      grupo(
        'mcr-fan-honras',
        19,
        t('tutorial.mcr.fans.honras.titulo'),
        t('tutorial.mcr.fans.honras.capa'),
        ['ventos', 'dragoes'],
        [38, 54, 59],
      ),
      grupo(
        'mcr-fan-naipes',
        20,
        t('tutorial.mcr.fans.naipes.titulo'),
        t('tutorial.mcr.fans.naipes.capa'),
        ['naipes', 'series-especificas', 'pecas-especificas'],
        [49, 37, 22],
      ),
      grupo(
        'mcr-fan-especiais',
        21,
        t('tutorial.mcr.fans.especiais.titulo'),
        t('tutorial.mcr.fans.especiais.capa'),
        ['maos', 'maos-especiais', 'outros'],
        [7, 34, 19],
      ),
      grupo(
        'mcr-fan-esperas',
        22,
        t('tutorial.mcr.fans.esperas.titulo'),
        t('tutorial.mcr.fans.esperas.capa'),
        ['esperas', 'ultima-peca'],
        [78, 47, 44],
      ),
    ],
  }
}
