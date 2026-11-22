/**
 * Parte 6, opcional: a única do livro que compara com o Riichi. Não conta
 * para o rank.
 */
import { FANS_MCR, YAKUS_SEM_EQUIVALENTE_MCR } from '@/compartilhado/mahjong/mcr/fans-mcr'
import type { TutorialBlock, TutorialPart } from '../tipos'
import { criarModulo, pagina, quiz, texto, type Traduzir } from './auxiliares'

const LINHAS_POR_PAGINA = 8

/** Um yaku pode virar mais de um fan (Yakuhai: dragão, vento da mesa e da posição). */
function equivalentes(): string[][] {
  const porYaku = new Map<string, string[]>()
  for (const fan of FANS_MCR) {
    if (!fan.yakuRiichi) continue
    const lista = porYaku.get(fan.yakuRiichi) ?? []
    lista.push(`${fan.pt} ${fan.hanzi} (${fan.pontos})`)
    porYaku.set(fan.yakuRiichi, lista)
  }
  return [...porYaku].map(([yaku, fans]) => [yaku, fans.join(', ')])
}

export function parteParaQuemVemDoRiichi(t: Traduzir): TutorialPart {
  const diferencas = (...itens: string[]): TutorialBlock => ({
    type: 'differences',
    label: t('glossario.mcr.diferenteRiichi'),
    items: itens,
  })
  const linhas = equivalentes()
  const totalPaginas = Math.ceil(linhas.length / LINHAS_POR_PAGINA)
  const tituloEquivalentes = t('tutorial.mcr.equivalentes.titulo')

  return {
    id: 'mcr-parte-6',
    number: 6,
    optional: t('tutorial.mcr.parte6.opcional'),
    title: t('tutorial.mcr.parte6.titulo'),
    cover: t('tutorial.mcr.parte6.capa'),
    milestone: {
      title: t('tutorial.mcr.parte6.marco'),
      md: t('tutorial.mcr.parte6.marcoTexto'),
    },
    modules: [
      criarModulo(
        'mcr-diferencas',
        23,
        t('tutorial.mcr.diferencas.titulo'),
        t('tutorial.mcr.diferencas.capa'),
        [
          pagina(t('tutorial.mcr.diferencas.naoExiste'), [
            diferencas(
              t('tutorial.mcr.diferencas.semRiichi'),
              t('tutorial.mcr.diferencas.semDora'),
              t('tutorial.mcr.diferencas.semFu'),
              t('tutorial.mcr.diferencas.semHonba'),
              t('tutorial.mcr.diferencas.semMuroMorto'),
            ),
          ]),
          pagina(t('tutorial.mcr.diferencas.naMesa'), [
            diferencas(
              t('tutorial.mcr.diferencas.dealer'),
              t('tutorial.mcr.diferencas.kuikae'),
              t('tutorial.mcr.diferencas.kanFechado'),
              t('tutorial.mcr.diferencas.maoAberta'),
              t('tutorial.mcr.diferencas.flores'),
            ),
          ]),
          pagina(t('tutorial.mcr.diferencas.naVitoria'), [
            diferencas(
              t('tutorial.mcr.diferencas.furiten'),
              t('tutorial.mcr.diferencas.umVencedor'),
              t('tutorial.mcr.diferencas.todosPagam'),
              t('tutorial.mcr.diferencas.chombo'),
            ),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.diferencas.q1', 2, 0),
          quiz(t, 'tutorial.mcr.diferencas.q2', 2, 1),
          quiz(t, 'tutorial.mcr.diferencas.q3', 2, 1),
        ],
      ),
      criarModulo(
        'mcr-equivalentes',
        24,
        tituloEquivalentes,
        t('tutorial.mcr.equivalentes.capa'),
        [
          ...Array.from({ length: totalPaginas }, (_, indice) =>
            pagina(`${tituloEquivalentes} (${indice + 1}/${totalPaginas})`, [
              {
                type: 'table',
                headers: [t('tutorial.mcr.equivalentes.yaku'), t('tutorial.mcr.equivalentes.fan')],
                rows: linhas.slice(indice * LINHAS_POR_PAGINA, (indice + 1) * LINHAS_POR_PAGINA),
              },
            ]),
          ),
          pagina(t('tutorial.mcr.equivalentes.sem'), [
            { type: 'heading', text: t('tutorial.mcr.equivalentes.semExato') },
            texto(
              YAKUS_SEM_EQUIVALENTE_MCR.semEquivalenteExato.map((yaku) => `- ${yaku}`).join('\n'),
            ),
            { type: 'heading', text: t('tutorial.mcr.equivalentes.naoExistem') },
            texto(YAKUS_SEM_EQUIVALENTE_MCR.naoExistem.map((yaku) => `- ${yaku}`).join('\n')),
          ]),
        ],
        [
          quiz(t, 'tutorial.mcr.equivalentes.q1', 3, 1),
          quiz(t, 'tutorial.mcr.equivalentes.q2', 3, 0),
          quiz(t, 'tutorial.mcr.equivalentes.q3', 3, 2),
        ],
      ),
    ],
  }
}
