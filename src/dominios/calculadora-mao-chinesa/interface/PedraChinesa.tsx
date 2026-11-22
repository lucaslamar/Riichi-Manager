import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { usePreferencias } from '@/compartilhado/preferencias/PreferenciasProvider'
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
/**
 * Endereço da arte chinesa na cor das pedras escolhida, como no Riichi: brancas
 * (bege) ou pretas, e as pretas do tema escuro com o rosa
 * (scripts/gerar-pedras-chinesas-pretas.ts).
 */
export function urlPedraChinesa(arquivo: string, cor: 'brancas' | 'pretas', temaEscuro: boolean) {
  const pasta = cor === 'pretas' ? (temaEscuro ? 'chines-black-rosa' : 'chines-black') : 'chines'
  return `${import.meta.env.BASE_URL}tiles/${pasta}/${arquivo}.svg?v=3`
}

function ImagemPedra({ arquivo, nome }: { arquivo: string; nome: string }) {
  const { pedrasEfetivas, temaEfetivo } = usePreferencias()
  return (
    <img
      className="tile-img tile-img-chinesa"
      src={urlPedraChinesa(arquivo, pedrasEfetivas, temaEfetivo === 'escuro')}
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
