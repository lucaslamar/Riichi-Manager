import { useState } from 'react'
import type { CodigoPedra, Meld } from '../../../logica/mao'
import { arquivoPedra, nomePedraAcessivel, urlPedra } from '../../constantes'

export function PedraSvg({
  pedra,
  virada = false,
  deLado = false,
}: {
  pedra?: CodigoPedra
  virada?: boolean
  deLado?: boolean
}) {
  const [formato, setFormato] = useState<'png' | 'svg' | 'texto'>('png')
  const nomeArquivo = virada ? 'Back' : pedra ? arquivoPedra(pedra) : 'Blank'
  const alt = virada ? 'Pedra virada' : nomePedraAcessivel(pedra)

  if (formato === 'texto') {
    return (
      <span className={`tile-img tile-fallback ${deLado ? 'tile-img-lado' : ''}`} aria-label={alt}>
        {virada ? '' : pedra}
      </span>
    )
  }

  return (
    <img
      className={`tile-img ${pedra === '5z' ? 'tile-img-haku' : ''} ${deLado ? 'tile-img-lado' : ''}`}
      src={urlPedra(nomeArquivo, formato)}
      alt={alt}
      draggable={false}
      onError={() => setFormato(formato === 'png' ? 'svg' : 'texto')}
    />
  )
}

export function PedrasMeld({ meld, indiceAgari }: { meld: Meld; indiceAgari?: number }) {
  const renderizarPedra = ({
    chave,
    pedra,
    virada = false,
    deLado = false,
    agari = false,
  }: {
    chave: string | number
    pedra?: CodigoPedra
    virada?: boolean
    deLado?: boolean
    agari?: boolean
  }) => (
    <span key={chave} className={`meld-tile ${deLado ? 'de-lado' : ''} ${agari ? 'agari' : ''}`}>
      <PedraSvg pedra={pedra} virada={virada} deLado={deLado} />
    </span>
  )

  if (meld.tipo === 'kanFechado') {
    const pedraAka = meld.pedras.find((pedra) => pedra.startsWith('0'))
    const pedrasCentrais = pedraAka
      ? [pedraAka, meld.pedras.find((pedra) => pedra !== pedraAka) ?? meld.pedras[1]]
      : [meld.pedras[1], meld.pedras[2]]

    return (
      <span className="meld-pedras">
        {renderizarPedra({ chave: 'back-left', virada: true, agari: indiceAgari === 0 })}
        {renderizarPedra({ chave: 'middle-left', pedra: pedrasCentrais[0], agari: indiceAgari === 1 })}
        {renderizarPedra({ chave: 'middle-right', pedra: pedrasCentrais[1], agari: indiceAgari === 2 })}
        {renderizarPedra({ chave: 'back-right', virada: true, agari: indiceAgari === 3 })}
      </span>
    )
  }

  return (
    <span className="meld-pedras">
      {meld.pedras.map((pedra, j) =>
        renderizarPedra({ chave: j, pedra, deLado: j === 0, agari: indiceAgari === j }),
      )}
    </span>
  )
}

/** Seletor de vento da rodada (Leste/Sul) e do assento (todos os 4). */
