/** Partes 3 e 4: a mão em andamento e a pontuação. */
import { fanMcrPorId } from '@/compartilhado/mahjong/mcr/fans-mcr'
import { calcularNotacaoMcr } from '@/dominios/calculadora-mao-chinesa/logica/notacao-mcr'
import { calcularPagamentoMcr } from '@/dominios/calculadora-mao-chinesa/logica/pontuacao-mcr'
import type { TutorialBlock, TutorialPart } from '../tipos'
import { criarModulo, pagina, quiz, texto, type Traduzir } from './auxiliares'
import { mpszDoExemplo } from './fans'

/** Mão do exemplo de contagem: Três Grandes Dragões. */
const FAN_DA_CONTAGEM = 2

export function parteJogando(t: Traduzir): TutorialPart {
  const pedraQueFalta = t('tutorial.mcr.vencer.falta')
  return {
    id: 'mcr-parte-3',
    number: 3,
    title: t('tutorial.mcr.parte3.titulo'),
    cover: t('tutorial.mcr.parte3.capa'),
    milestone: { title: t('tutorial.mcr.parte3.marco'), md: t('tutorial.mcr.parte3.marcoTexto') },
    modules: [
      criarModulo(
        'mcr-turno',
        8,
        t('tutorial.mcr.turno.titulo'),
        t('tutorial.mcr.turno.capa'),
        [
          pagina(t('tutorial.mcr.turno.vez'), [
            texto(t('tutorial.mcr.turno.ordem')),
            {
              type: 'steps',
              items: [
                t('tutorial.mcr.turno.passo1'),
                t('tutorial.mcr.turno.passo2'),
                t('tutorial.mcr.turno.passo3'),
              ],
            },
            texto(t('tutorial.mcr.turno.treze')),
          ]),
          pagina(t('tutorial.mcr.turno.descartes'), [
            texto(t('tutorial.mcr.turno.descartesTexto')),
            { type: 'hand', mpsz: '194m286p 375s', caption: t('tutorial.mcr.turno.fileiras') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.turno.q1', 2, 1),
          quiz(t, 'tutorial.mcr.turno.q2', 2, 0),
          quiz(t, 'tutorial.mcr.turno.q3', 3, 1),
        ],
      ),
      criarModulo(
        'mcr-conjuntos',
        9,
        t('tutorial.mcr.conjuntos.titulo'),
        t('tutorial.mcr.conjuntos.capa'),
        [
          pagina(t('tutorial.mcr.conjuntos.chi'), [
            texto(t('tutorial.mcr.conjuntos.chiTexto')),
            {
              type: 'melds',
              items: [{ mpsz: '213m', deLado: 0, caption: t('tutorial.mcr.conjuntos.chiMesa') }],
            },
          ]),
          pagina(t('tutorial.mcr.conjuntos.peng'), [
            texto(t('tutorial.mcr.conjuntos.pengTexto')),
            {
              type: 'melds',
              items: [
                { mpsz: '777s', deLado: 0, caption: t('tutorial.mcr.conjuntos.daEsquerda') },
                { mpsz: '777s', deLado: 1, caption: t('tutorial.mcr.conjuntos.daFrente') },
                { mpsz: '777s', deLado: 2, caption: t('tutorial.mcr.conjuntos.daDireita') },
              ],
            },
          ]),
          pagina(t('tutorial.mcr.conjuntos.gang'), [
            texto(t('tutorial.mcr.conjuntos.gangTexto')),
            {
              type: 'melds',
              items: [
                { mpsz: '2222p', deLado: 1, caption: t('tutorial.mcr.conjuntos.exposto') },
                {
                  mpsz: '4444s',
                  deLado: 1,
                  empilhada: true,
                  caption: t('tutorial.mcr.conjuntos.adicionado'),
                },
                {
                  mpsz: '9999m',
                  viradas: [0, 1, 2, 3],
                  caption: t('tutorial.mcr.conjuntos.oculto'),
                },
              ],
            },
            texto(t('tutorial.mcr.conjuntos.quando')),
          ]),
          pagina(t('tutorial.mcr.conjuntos.aberta'), [
            texto(t('tutorial.mcr.conjuntos.abertaTexto')),
            texto(t('tutorial.mcr.conjuntos.troca')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.conjuntos.q1', 3, 1),
          quiz(t, 'tutorial.mcr.conjuntos.q2', 3, 1),
          quiz(t, 'tutorial.mcr.conjuntos.q3', 3, 0),
          quiz(t, 'tutorial.mcr.conjuntos.q4', 2, 1),
        ],
      ),
      criarModulo(
        'mcr-chamadas',
        10,
        t('tutorial.mcr.chamadas.titulo'),
        t('tutorial.mcr.chamadas.capa'),
        [
          pagina(t('tutorial.mcr.chamadas.dizer'), [
            {
              type: 'table',
              headers: [t('tutorial.mcr.chamadas.fala'), t('tutorial.mcr.chamadas.para')],
              rows: [
                [t('tutorial.mcr.chamadas.chi'), t('tutorial.mcr.chamadas.paraChi')],
                [t('tutorial.mcr.chamadas.peng'), t('tutorial.mcr.chamadas.paraPeng')],
                [t('tutorial.mcr.chamadas.gang'), t('tutorial.mcr.chamadas.paraGang')],
                [t('tutorial.mcr.chamadas.hua'), t('tutorial.mcr.chamadas.paraHua')],
                [t('tutorial.mcr.chamadas.hu'), t('tutorial.mcr.chamadas.paraHu')],
              ],
            },
          ]),
          pagina(t('tutorial.mcr.chamadas.prioridade'), [
            {
              type: 'steps',
              items: [
                t('tutorial.mcr.chamadas.ordem1'),
                t('tutorial.mcr.chamadas.ordem2'),
                t('tutorial.mcr.chamadas.ordem3'),
              ],
            },
            texto(t('tutorial.mcr.chamadas.doisHu')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.chamadas.q1', 2, 1),
          quiz(t, 'tutorial.mcr.chamadas.q2', 3, 2),
          quiz(t, 'tutorial.mcr.chamadas.q3', 3, 0),
        ],
      ),
      criarModulo(
        'mcr-como-vencer',
        11,
        t('tutorial.mcr.vencer.titulo'),
        t('tutorial.mcr.vencer.capa'),
        [
          pagina(t('tutorial.mcr.vencer.formas'), [
            texto(t('tutorial.mcr.vencer.formasTexto')),
            texto(t('tutorial.mcr.vencer.condicoes')),
            { type: 'tip', md: t('tutorial.mcr.vencer.separada') },
          ]),
          pagina(t('tutorial.mcr.vencer.esperas'), [
            {
              type: 'hand',
              mpsz: '12m',
              after: '3m',
              afterLabel: pedraQueFalta,
              caption: t('tutorial.mcr.vencer.ponta'),
            },
            {
              type: 'hand',
              mpsz: '46p',
              after: '5p',
              afterLabel: pedraQueFalta,
              caption: t('tutorial.mcr.vencer.centro'),
            },
            {
              type: 'hand',
              mpsz: '8s',
              after: '8s',
              afterLabel: pedraQueFalta,
              caption: t('tutorial.mcr.vencer.unica'),
            },
            {
              type: 'hand',
              mpsz: '45s',
              after: '36s',
              afterLabel: pedraQueFalta,
              caption: t('tutorial.mcr.vencer.doisLados'),
            },
            texto(t('tutorial.mcr.vencer.esperasFan')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.vencer.q1', 3, 1),
          quiz(t, 'tutorial.mcr.vencer.q2', 3, 1),
          quiz(t, 'tutorial.mcr.vencer.q3', 2, 0),
        ],
      ),
      criarModulo(
        'mcr-empate-erros',
        12,
        t('tutorial.mcr.erros.titulo'),
        t('tutorial.mcr.erros.capa'),
        [
          pagina(t('tutorial.mcr.erros.empate'), [texto(t('tutorial.mcr.erros.empateTexto'))]),
          pagina(t('tutorial.mcr.erros.erros'), [
            texto(t('tutorial.mcr.erros.falsoHu')),
            texto(t('tutorial.mcr.erros.contagem')),
            texto(t('tutorial.mcr.erros.obrigatorio')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.erros.q1', 3, 1),
          quiz(t, 'tutorial.mcr.erros.q2', 3, 1),
          quiz(t, 'tutorial.mcr.erros.q3', 2, 0),
        ],
      ),
    ],
  }
}

export function partePontuacao(t: Traduzir): TutorialPart {
  const exemploPagamento = (forma: 'ron' | 'tsumo', fan: number) => {
    const { ganhadorRecebe, pagamentos } = calcularPagamentoMcr(fan, forma)
    return [
      `${forma === 'tsumo' ? 'Zimo' : 'Dianhe'} ${fan}`,
      forma === 'tsumo'
        ? t('tutorial.mcr.pagamentos.cadaUm', { valor: pagamentos[0].valor })
        : t('tutorial.mcr.pagamentos.descartador', {
            valor: pagamentos[0].valor,
            outros: pagamentos[1].valor,
          }),
      String(ganhadorRecebe),
    ]
  }
  const principal = fanMcrPorId(FAN_DA_CONTAGEM)
  if (!principal) throw new Error('Fan do exemplo de contagem inexistente')
  const contagem = calcularNotacaoMcr(principal.exemplo)
  const exemploContagem: TutorialBlock[] = [
    { type: 'hand', mpsz: mpszDoExemplo(principal.exemplo) },
    { type: 'heading', text: t('tutorial.mcr.contagem.contam') },
    {
      type: 'table',
      headers: [t('tutorial.mcr.contagem.fan'), t('tutorial.mcr.contagem.pontos')],
      rows: [
        ...[...new Set(contagem.fans.map((fan) => fan.id))].map((id) => [
          fanMcrPorId(id)?.pt ?? '',
          String(fanMcrPorId(id)?.pontos ?? ''),
        ]),
        [t('tutorial.mcr.contagem.total'), `**${contagem.fanTotal}**`],
      ],
    },
    { type: 'heading', text: t('tutorial.mcr.contagem.naoContam') },
    texto((principal.naoCombina ?? []).map((id) => `- ${fanMcrPorId(id)?.pt}`).join('\n')),
  ]

  return {
    id: 'mcr-parte-4',
    number: 4,
    title: t('tutorial.mcr.parte4.titulo'),
    cover: t('tutorial.mcr.parte4.capa'),
    milestone: { title: t('tutorial.mcr.parte4.marco'), md: t('tutorial.mcr.parte4.marcoTexto') },
    modules: [
      criarModulo(
        'mcr-pontuacao',
        13,
        t('tutorial.mcr.pagamentos.titulo'),
        t('tutorial.mcr.pagamentos.capa'),
        [
          pagina(t('tutorial.mcr.pagamentos.quem'), [
            texto(t('tutorial.mcr.pagamentos.obrigatorios')),
            texto(t('tutorial.mcr.pagamentos.formulas')),
            texto(t('tutorial.mcr.pagamentos.dealer')),
          ]),
          pagina(t('tutorial.mcr.pagamentos.exemplos'), [
            {
              type: 'table',
              compact: true,
              headers: [
                t('tutorial.mcr.pagamentos.vitoria'),
                t('tutorial.mcr.pagamentos.quemPaga'),
                t('tutorial.mcr.pagamentos.recebe'),
              ],
              rows: [
                exemploPagamento('ron', 8),
                exemploPagamento('ron', 24),
                exemploPagamento('tsumo', 8),
                exemploPagamento('tsumo', 24),
              ],
            },
            { type: 'appLink', tool: 'calculadora', label: t('tutorial.mcr.pagamentos.abrir') },
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.pagamentos.q1', 3, 1),
          quiz(t, 'tutorial.mcr.pagamentos.q2', 3, 1),
          quiz(t, 'tutorial.mcr.pagamentos.q3', 3, 2),
        ],
      ),
      criarModulo(
        'mcr-contagem',
        14,
        t('tutorial.mcr.contagem.titulo'),
        t('tutorial.mcr.contagem.capa'),
        [
          pagina(t('tutorial.mcr.contagem.principios'), [
            texto(t('tutorial.mcr.contagem.comeco')),
            {
              type: 'table',
              compact: true,
              headers: [t('tutorial.mcr.contagem.principio'), t('tutorial.mcr.contagem.regra')],
              rows: [
                [t('tutorial.mcr.contagem.repeticao'), t('tutorial.mcr.contagem.repeticaoTexto')],
                [
                  t('tutorial.mcr.contagem.decomposicao'),
                  t('tutorial.mcr.contagem.decomposicaoTexto'),
                ],
                [
                  t('tutorial.mcr.contagem.reutilizacao'),
                  t('tutorial.mcr.contagem.reutilizacaoTexto'),
                ],
                [t('tutorial.mcr.contagem.maior'), t('tutorial.mcr.contagem.maiorTexto')],
                [t('tutorial.mcr.contagem.unica'), t('tutorial.mcr.contagem.unicaTexto')],
              ],
            },
            texto(t('tutorial.mcr.contagem.repetido')),
          ]),
          pagina(t('tutorial.mcr.contagem.exemplo'), exemploContagem),
        ],
        [
          quiz(t, 'tutorial.mcr.contagem.q1', 3, 1),
          quiz(t, 'tutorial.mcr.contagem.q2', 2, 1),
          quiz(t, 'tutorial.mcr.contagem.q3', 2, 0),
        ],
      ),
      criarModulo(
        'mcr-rodadas',
        15,
        t('tutorial.mcr.rodadas.titulo'),
        t('tutorial.mcr.rodadas.capa'),
        [
          pagina(t('tutorial.mcr.rodadas.nomes'), [
            {
              type: 'table',
              headers: [t('tutorial.mcr.rodadas.nome'), t('tutorial.mcr.rodadas.oQueE')],
              rows: [
                [t('tutorial.mcr.rodadas.pan'), t('tutorial.mcr.rodadas.panTexto')],
                [t('tutorial.mcr.rodadas.quan'), t('tutorial.mcr.rodadas.quanTexto')],
                [t('tutorial.mcr.rodadas.ju'), t('tutorial.mcr.rodadas.juTexto')],
              ],
            },
            texto(t('tutorial.mcr.rodadas.dealer')),
          ]),
          pagina(t('tutorial.mcr.rodadas.ventos'), [
            texto(t('tutorial.mcr.rodadas.ventosTexto')),
            { type: 'hand', mpsz: '1234z' },
            texto(t('tutorial.mcr.rodadas.torneio')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.rodadas.q1', 2, 1),
          quiz(t, 'tutorial.mcr.rodadas.q2', 3, 2),
          quiz(t, 'tutorial.mcr.rodadas.q3', 3, 1),
        ],
      ),
    ],
  }
}
