import { useState } from 'react'
import { traduzirGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import type { CodigoPedra, Meld } from '../../../logica/mao'
import { arquivoPedra, nomePedraAcessivel, urlPedra } from '../../constantes'

export function PedraSvg({
  pedra,
  virada = false,
  deLado = false,
  arquivo,
}: {
  pedra?: CodigoPedra
  virada?: boolean
  deLado?: boolean
  /** Outra arte para a mesma pedra (ex.: 'Ton-Vermelho'); o nome acessível não muda. */
  arquivo?: string
}) {
  const [formato, setFormato] = useState<'png' | 'svg' | 'texto'>('png')
  const nomeArquivo = virada ? 'Back' : (arquivo ?? (pedra ? arquivoPedra(pedra) : 'Blank'))
  const alt = virada ? traduzirGlobal('tiles.back') : nomePedraAcessivel(pedra)

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
      // Em telas de alta densidade (iPhone 16, Pixel, Galaxy) o Chrome adiava a
      // decodificação das pedras e o teclado aparecia pedra por pedra ao voltar
      // da finalização. "sync" faz a tela só aparecer com as pedras prontas.
      decoding="sync"
      onError={() => setFormato(formato === 'png' ? 'svg' : 'texto')}
    />
  )
}

/**
 * Pedras de um meld na disposição da mesa: a chamada de lado e, no kan fechado,
 * as pontas viradas. Com `pendente`, `meld.pedras` são só números (notação ainda
 * sem naipe) e cada pedra mostra o número numa face branca.
 */
export function PedrasMeld({
  meld,
  indiceAgari,
  pendente = false,
}: {
  meld: Meld
  indiceAgari?: number
  pendente?: boolean
}) {
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
    <span
      key={chave}
      className={`meld-tile ${deLado ? 'de-lado' : ''} ${agari ? 'agari' : ''} ${
        pendente && !virada ? 'pendente' : ''
      } ${pendente && pedra === '0' ? 'vermelha' : ''}`}
    >
      {pendente && !virada ? (
        <span className="numero-meld-pendente">{pedra === '0' ? '5' : pedra}</span>
      ) : (
        <PedraSvg pedra={pedra} virada={virada} deLado={deLado} />
      )}
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
        {renderizarPedra({
          chave: 'middle-left',
          pedra: pedrasCentrais[0],
          agari: indiceAgari === 1,
        })}
        {renderizarPedra({
          chave: 'middle-right',
          pedra: pedrasCentrais[1],
          agari: indiceAgari === 2,
        })}
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
