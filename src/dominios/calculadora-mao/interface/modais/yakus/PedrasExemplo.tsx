import { Fragment } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { conteudoGuiaBolso } from '../../../conteudo/guia-bolso'
import type { CodigoPedra } from '../../../logica/mao'
import { parseMpsz } from '../../../logica/yakus'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
import TextoGlossario from '../glossario/TextoGlossario'
import './pedras-exemplo.css'

/** Uma pedra pequena com a face branca, como nas mãos do app. */
export function PedraYaku({ pedra, numero }: { pedra: CodigoPedra; numero?: string }) {
  const face = (
    <span className="yaku-tile">
      <PedraSvg pedra={pedra} />
    </span>
  )
  if (!numero) return face
  return (
    <span className="yaku-tile-numerada">
      <span className="yaku-tile-numerada__numero" aria-hidden="true">
        {numero}
      </span>
      {face}
    </span>
  )
}

/**
 * Fileira de pedras que quebra linha sem rolar para o lado. Cada grupo
 * (bloco da notação mpsz) fica junto, para um par ou trinca nunca ser
 * partido entre duas linhas. `numerar` mostra em cima de cada pedra o número
 * (naipes) ou o nome da honra como se fala na mesa no idioma (Ton, 東…).
 */
export function PedrasExemplo({
  grupos,
  rotulo,
  numerar = false,
}: {
  grupos: CodigoPedra[][]
  rotulo: string
  numerar?: boolean
}) {
  const { idioma } = useI18n()
  const { nomesHonras } = conteudoGuiaBolso(idioma)
  const rotuloPedra = (pedra: CodigoPedra) => nomesHonras[pedra] ?? pedra[0].replace('0', '5')

  return (
    <div className="yaku-tiles" role="img" aria-label={rotulo}>
      {grupos.map((grupo, indiceGrupo) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: exemplo fixo
        <span key={indiceGrupo} className="yaku-tiles__grupo">
          {grupo.map((pedra, indicePedra) => (
            <PedraYaku
              // biome-ignore lint/suspicious/noArrayIndexKey: exemplo fixo
              key={indicePedra}
              pedra={pedra}
              numero={numerar ? rotuloPedra(pedra) : undefined}
            />
          ))}
        </span>
      ))}
    </div>
  )
}

/**
 * Mão de exemplo com um rótulo embaixo de cada grupo (ex.: Sequência, Par),
 * que vira link para o verbete. Cada grupo fica inteiro numa linha.
 */
export function MaoRotulada({
  grupos,
  rotulos,
  ignorar,
}: {
  grupos: CodigoPedra[][]
  rotulos: string[]
  ignorar?: (string | undefined)[]
}) {
  return (
    <div className="yaku-mao-rotulada">
      {grupos.map((grupo, indiceGrupo) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: exemplo fixo
        <span key={indiceGrupo} className="yaku-mao-rotulada__grupo">
          <span className="yaku-tiles__grupo" role="img" aria-label={grupo.join(' ')}>
            {grupo.map((pedra, indicePedra) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: exemplo fixo
              <PedraYaku key={indicePedra} pedra={pedra} />
            ))}
          </span>
          {rotulos[indiceGrupo] && (
            <span className="yaku-mao-rotulada__rotulo">
              <TextoGlossario texto={rotulos[indiceGrupo]} ignorar={ignorar} />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

/** Ordem em que o indicador aponta a dora: cada pedra indica a seguinte. */
const CICLOS_DORA = [
  { chave: 'numeros', mpsz: '789p1p' },
  { chave: 'ventos', mpsz: '12341z' },
  { chave: 'dragoes', mpsz: '5675z' },
] as const

/** As três sequências do indicador de dora, com setas entre as pedras. */
export function CiclosDora() {
  const { idioma } = useI18n()
  const textos = conteudoGuiaBolso(idioma).ciclosDora
  return (
    <div className="yaku-ciclos">
      {CICLOS_DORA.map(({ chave, mpsz }) => {
        const ciclo = { ...textos[chave], mpsz }
        return (
          <div key={chave} className="yaku-ciclo__linha">
            <p className="yaku-ciclo__titulo">
              {ciclo.titulo} <span className="yaku-ciclo__detalhe">{ciclo.detalhe}</span>
            </p>
            <div
              className="yaku-tiles yaku-ciclo"
              role="img"
              aria-label={`${ciclo.titulo}: ${ciclo.detalhe}`}
            >
              {parseMpsz(ciclo.mpsz).map((pedra, indice) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: sequência fixa
                <Fragment key={indice}>
                  {indice > 0 && (
                    <i className="fas fa-arrow-right yaku-ciclo__seta" aria-hidden="true" />
                  )}
                  <PedraYaku pedra={pedra} />
                </Fragment>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
