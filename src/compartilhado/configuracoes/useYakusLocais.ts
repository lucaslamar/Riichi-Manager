import { useCallback, useSyncExternalStore } from 'react'
import { localStorageDireto } from '@/compartilhado/persistencia/armazenamento'

const CHAVE_YAKUS_LOCAIS = 'riichi-manager-yakus-locais'

/** Yakus locais que começam ligados (easter egg do clube); valem também para quem já tinha a config salva. */
export const YAKUS_LOCAIS_LIGADOS_POR_PADRAO: readonly string[] = ['aniversarioCerrado']

/** 1: 8 vitórias seguidas de um jogador · 2: 8 como dealer sem empate · 3: 8 honba como dealer. */
export type VariacaoPaarenchan = 1 | 2 | 3

interface ConfigYakusLocais {
  /** Ids ligados. Só os de `YAKUS_LOCAIS_LIGADOS_POR_PADRAO` começam ligados. */
  ativos: string[]
  /** Ligados por padrão que a pessoa desligou. */
  desligados: string[]
  paarenchan: {
    variacao: VariacaoPaarenchan
    /** A partir do 5º honba, a mão precisa de 2 han sem contar dora. */
    ryanhanShibari: boolean
    /** Depois do Paarenchan: a banca passa sozinha ou o dealer continua. */
    depois: 'passa' | 'continua'
  }
  renhou: 'mangan' | 'baiman' | 'yakuman'
}

export const YAKUS_LOCAIS_PADRAO: ConfigYakusLocais = {
  ativos: [...YAKUS_LOCAIS_LIGADOS_POR_PADRAO],
  desligados: [],
  paarenchan: { variacao: 1, ryanhanShibari: false, depois: 'passa' },
  renhou: 'mangan',
}

const ouvintes = new Set<() => void>()
let atual: ConfigYakusLocais | null = null

function normalizar(valor: Partial<ConfigYakusLocais> | null | undefined): ConfigYakusLocais {
  const paarenchan: Partial<ConfigYakusLocais['paarenchan']> = valor?.paarenchan ?? {}
  const ativos = Array.isArray(valor?.ativos) ? valor.ativos.filter((id) => typeof id === 'string') : []
  const desligados = Array.isArray(valor?.desligados) ? valor.desligados.filter((id) => typeof id === 'string') : []
  return {
    ativos: [...ativos, ...YAKUS_LOCAIS_LIGADOS_POR_PADRAO.filter((id) => !ativos.includes(id) && !desligados.includes(id))],
    desligados,
    paarenchan: {
      variacao: paarenchan.variacao === 2 || paarenchan.variacao === 3 ? paarenchan.variacao : 1,
      ryanhanShibari: paarenchan.ryanhanShibari === true,
      depois: paarenchan.depois === 'continua' ? 'continua' : 'passa',
    },
    renhou: valor?.renhou === 'baiman' || valor?.renhou === 'yakuman' ? valor.renhou : 'mangan',
  }
}

function ler(): ConfigYakusLocais {
  try {
    return normalizar(JSON.parse(localStorageDireto.ler(CHAVE_YAKUS_LOCAIS) ?? 'null'))
  } catch {
    return normalizar(null)
  }
}

/** Config de agora, fora do React. */
export function lerYakusLocais(): ConfigYakusLocais {
  atual ??= ler()
  return atual
}

function gravar(nova: ConfigYakusLocais) {
  atual = nova
  localStorageDireto.gravar(CHAVE_YAKUS_LOCAIS, JSON.stringify(nova))
  for (const ouvinte of ouvintes) ouvinte()
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  const aoMudarOutraAba = (evento: StorageEvent) => {
    if (evento.key !== CHAVE_YAKUS_LOCAIS) return
    atual = ler()
    ouvinte()
  }
  window.addEventListener('storage', aoMudarOutraAba)
  return () => {
    ouvintes.delete(ouvinte)
    window.removeEventListener('storage', aoMudarOutraAba)
  }
}

/** Ligados por padrão que ficaram fora da lista de ativos. */
function desligadosDe(ativos: readonly string[]): string[] {
  return YAKUS_LOCAIS_LIGADOS_POR_PADRAO.filter((id) => !ativos.includes(id))
}

/** Yakus locais ligados em Regras de cálculo → Yakus locais, iguais em todas as telas. */
export function useYakusLocais() {
  const config = useSyncExternalStore(inscrever, lerYakusLocais, lerYakusLocais)
  const mudar = useCallback((parcial: Partial<ConfigYakusLocais>) => {
    const desligados = parcial.ativos ? desligadosDe(parcial.ativos) : lerYakusLocais().desligados
    gravar(normalizar({ ...lerYakusLocais(), ...parcial, desligados }))
  }, [])
  const alternar = useCallback((id: string, ligado: boolean) => {
    const outros = lerYakusLocais().ativos.filter((outro) => outro !== id)
    const ativos = ligado ? [...outros, id] : outros
    gravar({ ...lerYakusLocais(), ativos, desligados: desligadosDe(ativos) })
  }, [])
  return { yakusLocais: config, mudarYakusLocais: mudar, alternarYakuLocal: alternar }
}
