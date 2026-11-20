import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Flor } from '../logica/montagem'
import { nomePedra } from './pedras'

/** Honras do motor (E S W N C F P) nos nomes de arquivo das artes. */
const ARQUIVO_HONRAS: Record<number, string> = {
  28: 'Ton',
  29: 'Nan',
  30: 'Shaa',
  31: 'Pei',
  32: 'Chun',
  33: 'Hatsu',
  34: 'Haku',
}

function arquivoDaPedra(id: number): string {
  if (id <= 9) return `Man${id}`
  if (id <= 18) return `Sou${id - 9}`
  if (id <= 27) return `Pin${id - 18}`
  return ARQUIVO_HONRAS[id]
}

const arquivoDaFlor = (flor: Flor) => (flor <= 4 ? `Flor${flor}` : `Estacao${flor - 4}`)

/**
 * Arte do modo Chinês: conjunto da Malásia de samoheen/mahjong-tiles (CC0), em
 * public/tiles/chines. Usa a classe `tile-img`, então ocupa o mesmo lugar das
 * pedras do Riichi no teclado, na mão e nos conjuntos.
 */
function ImagemPedra({ arquivo, nome }: { arquivo: string; nome: string }) {
  return (
    <img
      className="tile-img tile-img-chinesa"
      src={`${import.meta.env.BASE_URL}tiles/chines/${arquivo}.svg?v=1`}
      alt={nome}
      draggable={false}
      decoding="sync"
    />
  )
}

export function PedraChinesa({ id }: { id: number }) {
  return <ImagemPedra arquivo={arquivoDaPedra(id)} nome={nomePedra(id)} />
}

export function PedraFlor({ flor }: { flor: Flor }) {
  const { t } = useI18n()
  return <ImagemPedra arquivo={arquivoDaFlor(flor)} nome={t(`mcr.flores.${flor}`)} />
}
