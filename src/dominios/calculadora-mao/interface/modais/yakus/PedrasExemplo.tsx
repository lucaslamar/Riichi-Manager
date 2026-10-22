import { Fragment } from 'react'
import type { CodigoPedra } from '../../../logica/mao'
import { parseMpsz } from '../../../logica/yakus'
import { PedraSvg } from '../../compartilhado/componentes/PedraSvg'
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

/** Nome japonês das honras, como se fala na mesa. */
const NOME_JAPONES_HONRA: Record<CodigoPedra, string> = {
  '1z': 'Ton',
  '2z': 'Nan',
  '3z': 'Shaa',
  '4z': 'Pei',
  '5z': 'Haku',
  '6z': 'Hatsu',
  '7z': 'Chun',
}

/**
 * Fileira de pedras que quebra linha sem rolar para o lado. Cada grupo
 * (bloco da notação mpsz) fica junto, para um par ou trinca nunca ser
 * partido entre duas linhas. `numerar` mostra em cima de cada pedra o número
 * (naipes) ou o nome japonês (honras).
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
  const rotuloPedra = (pedra: CodigoPedra) =>
    NOME_JAPONES_HONRA[pedra] ?? pedra[0].replace('0', '5')

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

/** Ordem em que o indicador aponta a dora: cada pedra indica a seguinte. */
const CICLOS_DORA = [
  { titulo: 'Números', detalhe: 'Sobe um; o 9 volta para o 1.', mpsz: '789p1p' },
  { titulo: 'Ventos', detalhe: 'Leste → Sul → Oeste → Norte → Leste.', mpsz: '12341z' },
  { titulo: 'Dragões', detalhe: 'Branco → Verde → Vermelho → Branco.', mpsz: '5675z' },
]

/** As três sequências do indicador de dora, com setas entre as pedras. */
export function CiclosDora() {
  return (
    <div className="yaku-ciclos">
      {CICLOS_DORA.map((ciclo) => (
        <div key={ciclo.titulo} className="yaku-ciclo__linha">
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
      ))}
    </div>
  )
}
