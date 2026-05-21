import { useState } from 'react'
import type { CodigoPedra, Meld } from '../../logica/mao'
import { arquivoPedra, urlPedra } from '../constantes'

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
  const alt = virada ? 'Pedra virada' : (pedra ?? 'Pedra vazia')

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
      alt=""
      aria-label={alt}
      draggable={false}
      onError={() => setFormato(formato === 'png' ? 'svg' : 'texto')}
    />
  )
}

export function PedrasMeld({ meld }: { meld: Meld }) {
  const renderizarPedra = ({
    chave,
    pedra,
    virada = false,
    deLado = false,
  }: {
    chave: string | number
    pedra?: CodigoPedra
    virada?: boolean
    deLado?: boolean
  }) => (
    <span key={chave} className={`meld-tile ${deLado ? 'de-lado' : ''}`}>
      <PedraSvg pedra={pedra} virada={virada} deLado={deLado} />
    </span>
  )

  if (meld.tipo === 'kanFechado') {
    return (
      <span className="meld-pedras">
        {renderizarPedra({ chave: 'back-left', virada: true })}
        {renderizarPedra({ chave: 'middle-left', pedra: meld.pedras[1] })}
        {renderizarPedra({ chave: 'middle-right', pedra: meld.pedras[2] })}
        {renderizarPedra({ chave: 'back-right', virada: true })}
      </span>
    )
  }

  return (
    <span className="meld-pedras">
      {meld.pedras.map((pedra, j) =>
        renderizarPedra({ chave: j, pedra, deLado: j === 0 }),
      )}
    </span>
  )
}

/** Seletor de vento da rodada (Leste/Sul) e do assento (todos os 4). */
