/**
 * Backup completo do app para levar os dados a outro aparelho. Puro: não lê nem
 * grava nada (isso fica em `lojaBackup.ts`), para reaproveitar no React Native.
 *
 * Formato: `{ app, appVersion, schemaVersion, exportadoEm, dados }`. Mudou a forma
 * de `dados` de um jeito que versões antigas não entendem? Sobe `SCHEMA_BACKUP`.
 */
import type { Jogador } from '@/dominios/jogadores/logica/jogadores'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { ConfigMesa } from '@/dominios/centerpiece/logica/configMesa'
import type { EncontroClube, SorteioClube } from '@/dominios/centerpiece/logica/encontroClube'
import type { ListaSalva, Temporada, Torneio } from '@/dominios/torneio/logica/tipos'

export const SCHEMA_BACKUP = 1
const MARCA = 'mojoca-backup'

export interface DadosBackup {
  jogadores: Jogador[]
  /** Todas as partidas: o histórico e as mesas abertas. */
  partidas: Partida[]
  torneios: Torneio[]
  temporadas: Temporada[]
  listasTorneio: ListaSalva[]
  clube: { lista: string; sorteio: SorteioClube | null; encontros: EncontroClube[] }
  /** Configurações de mesa: a última usada e as regras do Registrar partida. */
  configMesa: ConfigMesa | null
  regrasRegistro: unknown
}

export interface ArquivoBackup {
  app: typeof MARCA
  appVersion: string
  schemaVersion: number
  exportadoEm: string
  dados: DadosBackup
}

export type ErroBackup = 'naoEhJson' | 'naoEhBackup' | 'versaoNova' | 'corrompido'
export type ValidacaoBackup = { ok: true; backup: ArquivoBackup } | { ok: false; erro: ErroBackup }

export function montarBackup(dados: DadosBackup, appVersion: string, agora: Date): ArquivoBackup {
  return { app: MARCA, appVersion, schemaVersion: SCHEMA_BACKUP, exportadoEm: agora.toISOString(), dados }
}

/** `mojoca-backup-AAAA-MM-DD.json`, com a data local. */
export function nomeDoBackup(agora: Date): string {
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  const dia = `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
  return `mojoca-backup-${dia}.json`
}

const ehLista = (valor: unknown) => Array.isArray(valor)
/** Todos os itens com `id` texto: o mínimo para mesclar sem duplicar. */
const comIds = (valor: unknown) =>
  ehLista(valor) && (valor as { id?: unknown }[]).every((item) => !!item && typeof item.id === 'string')

/** Confere a casca do arquivo e as listas que a mescla usa. Texto ou objeto já lido. */
export function validarBackup(entrada: string | unknown): ValidacaoBackup {
  let lido: unknown = entrada
  if (typeof entrada === 'string') {
    try {
      lido = JSON.parse(entrada)
    } catch {
      return { ok: false, erro: 'naoEhJson' }
    }
  }
  const arquivo = lido as Partial<ArquivoBackup> | null
  if (!arquivo || typeof arquivo !== 'object' || arquivo.app !== MARCA) return { ok: false, erro: 'naoEhBackup' }
  if (typeof arquivo.schemaVersion !== 'number' || arquivo.schemaVersion > SCHEMA_BACKUP) {
    return { ok: false, erro: 'versaoNova' }
  }
  const dados = arquivo.dados as Partial<DadosBackup> | undefined
  const clube = dados?.clube as Partial<DadosBackup['clube']> | undefined
  const valido =
    !!dados &&
    comIds(dados.jogadores) &&
    comIds(dados.partidas) &&
    comIds(dados.torneios) &&
    comIds(dados.temporadas) &&
    comIds(dados.listasTorneio ?? []) &&
    !!clube &&
    comIds(clube.encontros)
  if (!valido) return { ok: false, erro: 'corrompido' }
  return {
    ok: true,
    backup: {
      ...(arquivo as ArquivoBackup),
      dados: {
        ...(dados as DadosBackup),
        listasTorneio: dados.listasTorneio ?? [],
        clube: { lista: typeof clube.lista === 'string' ? clube.lista : '', sorteio: clube.sorteio ?? null, encontros: clube.encontros ?? [] },
        configMesa: dados.configMesa ?? null,
        regrasRegistro: dados.regrasRegistro ?? null,
      },
    },
  }
}

/** O que mostrar antes de confirmar a importação. */
export function resumoBackup(dados: DadosBackup) {
  return {
    jogadores: dados.jogadores.length,
    partidas: dados.partidas.filter((partida) => partida.status === 'finalizada').length,
    torneios: dados.torneios.length,
  }
}

/** Os locais primeiro; do backup, só o que tiver `id` novo. */
function somarPorId<T extends { id: string }>(locais: readonly T[], vindos: readonly T[]): T[] {
  const ids = new Set(locais.map((item) => item.id))
  return [...locais, ...vindos.filter((item) => !ids.has(item.id))]
}

/**
 * Mesclar: adiciona o que não existe aqui, identificando por `id`. O que já
 * existe fica como está (inclusive configurações, lista e sorteio do clube).
 */
export function mesclarBackup(locais: DadosBackup, vindos: DadosBackup): DadosBackup {
  return {
    ...locais,
    jogadores: somarPorId(locais.jogadores, vindos.jogadores),
    partidas: somarPorId(locais.partidas, vindos.partidas),
    torneios: somarPorId(locais.torneios, vindos.torneios),
    temporadas: somarPorId(locais.temporadas, vindos.temporadas),
    listasTorneio: somarPorId(locais.listasTorneio, vindos.listasTorneio),
    clube: {
      ...locais.clube,
      sorteio: locais.clube.sorteio ?? vindos.clube.sorteio,
      encontros: somarPorId(locais.clube.encontros, vindos.clube.encontros),
    },
  }
}

/** Mesmo texto sem acento, maiúscula ou espaço sobrando. */
const comparavel = (texto: string | undefined) =>
  (texto ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * Pessoas do backup que parecem ser alguém daqui: id diferente, mas o mesmo nome
 * ou o mesmo apelido. É o caso de quem foi cadastrado nos dois aparelhos.
 */
export function sugerirMesmasPessoas(locais: readonly Jogador[], vindos: readonly Jogador[]) {
  const idsLocais = new Set(locais.map((jogador) => jogador.id))
  return vindos.flatMap((vindo) => {
    if (idsLocais.has(vindo.id)) return []
    const nomes = [comparavel(vindo.nome), comparavel(vindo.apelido)].filter(Boolean)
    const local = locais.find((jogador) =>
      [comparavel(jogador.nome), comparavel(jogador.apelido)].some((nome) => nome && nomes.includes(nome)),
    )
    return local ? [{ vindo, local }] : []
  })
}

/**
 * Troca, nos dados que chegaram, cada pessoa do backup pela daqui (`mapa`: id do
 * backup → id local). Ela some da lista de jogadores do backup, e partidas,
 * torneios e clube passam a apontar para o jogador local.
 */
export function unificarJogadores(dados: DadosBackup, mapa: Readonly<Record<string, string>>): DadosBackup {
  const pares = Object.entries(mapa)
  if (pares.length === 0) return dados
  // Os ids são UUIDs: trocar o valor exato "id" no JSON não acerta mais nada.
  const trocar = <T>(valor: T): T => {
    let texto = JSON.stringify(valor)
    for (const [vindo, local] of pares) texto = texto.split(JSON.stringify(vindo)).join(JSON.stringify(local))
    return JSON.parse(texto) as T
  }
  return {
    ...dados,
    jogadores: dados.jogadores.filter((jogador) => !(jogador.id in mapa)),
    partidas: trocar(dados.partidas),
    torneios: trocar(dados.torneios),
    clube: trocar(dados.clube),
  }
}
