/**
 * Exportar e importar um torneio inteiro entre aparelhos: o torneio, as partidas
 * dele, os jogadores e a temporada. Sem tela, sem armazenamento: só dados.
 */
import LZString from 'lz-string'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { Jogador } from '@/dominios/jogadores/logica/jogadores'
import type { Temporada, Torneio } from './tipos'

export const VERSAO_PACOTE = 1
export const EXTENSAO_PACOTE = '.mojoca.json'
/**
 * Tamanho de cada pedaço do código. Com 800 o QR ficava denso demais (versão 20,
 * 97 módulos) e a câmera de outro celular não lia na tela. Com 300 fica
 * na versão 11 (61 módulos): mais QRs na sequência, mas cada um lê de primeira.
 */
export const TAMANHO_PEDACO_QR = 300

export type ModoExportacao = 'copia' | 'transferencia'

export interface PacoteTorneio {
  app: 'mojoca'
  tipo: 'torneio'
  versao: number
  exportadoEm: string
  modo: ModoExportacao
  torneio: Torneio
  partidas: Partida[]
  jogadores: { id: string; nome: string; apelido?: string }[]
  temporada?: Temporada
  /** Soma de conferência do conteúdo: acusa arquivo cortado ou mexido. */
  hash: string
}

/** FNV-1a 32 bits em hexadecimal. Não é segurança, é conferência. */
function hashTexto(texto: string): string {
  let hash = 0x811c9dc5
  for (let indice = 0; indice < texto.length; indice += 1) {
    hash ^= texto.charCodeAt(indice)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

function hashDoPacote(pacote: Omit<PacoteTorneio, 'hash'>): string {
  return hashTexto(
    JSON.stringify([
      pacote.versao,
      pacote.torneio,
      pacote.partidas,
      pacote.jogadores,
      pacote.temporada ?? null,
    ]),
  )
}

export function exportarTorneio(
  torneio: Torneio,
  dados: {
    partidas: readonly Partida[]
    jogadores: readonly Jogador[]
    temporadas: readonly Temporada[]
  },
  opcoes: { modo: ModoExportacao; agora: string },
): PacoteTorneio {
  const partidas = dados.partidas.filter(
    (partida) => partida.vinculoTorneio?.torneioId === torneio.id,
  )
  const ids = new Set(torneio.jogadorIds)
  for (const partida of partidas)
    for (const cadeira of [0, 1, 2, 3] as const) ids.add(partida.assentos[cadeira].jogadorId)
  const jogadores = dados.jogadores
    .filter((jogador) => ids.has(jogador.id))
    .map(({ id, nome, apelido }) => (apelido ? { id, nome, apelido } : { id, nome }))
  const temporada =
    torneio.formato.tipo === 'temporada'
      ? dados.temporadas.find(
          (item) => item.id === (torneio.formato as { temporadaId: string }).temporadaId,
        )
      : undefined
  const semTransferencia = { ...torneio }
  delete semTransferencia.transferidoEm
  const base: Omit<PacoteTorneio, 'hash'> = {
    app: 'mojoca',
    tipo: 'torneio',
    versao: VERSAO_PACOTE,
    exportadoEm: opcoes.agora,
    modo: opcoes.modo,
    torneio: semTransferencia,
    partidas,
    jogadores,
    ...(temporada ? { temporada } : {}),
  }
  return { ...base, hash: hashDoPacote(base) }
}

export type ErroPacote = 'invalido' | 'corrompido' | 'versaoNova'

export type Validacao = { ok: true; pacote: PacoteTorneio } | { ok: false; erro: ErroPacote }

/** Aceita o texto do arquivo (JSON) ou o objeto já lido. */
export function validarPacote(entrada: unknown): Validacao {
  let dado = entrada
  if (typeof dado === 'string') {
    try {
      dado = JSON.parse(dado)
    } catch {
      return { ok: false, erro: 'invalido' }
    }
  }
  if (!dado || typeof dado !== 'object') return { ok: false, erro: 'invalido' }
  const pacote = dado as Partial<PacoteTorneio>
  if (pacote.app !== 'mojoca' || pacote.tipo !== 'torneio' || typeof pacote.versao !== 'number') {
    return { ok: false, erro: 'invalido' }
  }
  if (pacote.versao > VERSAO_PACOTE) return { ok: false, erro: 'versaoNova' }
  const dadosTorneio = pacote.torneio
  if (
    !dadosTorneio ||
    typeof dadosTorneio.id !== 'string' ||
    !Array.isArray(dadosTorneio.jogadorIds) ||
    !Array.isArray(dadosTorneio.rodadas) ||
    !Array.isArray(pacote.partidas) ||
    !Array.isArray(pacote.jogadores) ||
    typeof pacote.hash !== 'string'
  ) {
    return { ok: false, erro: 'corrompido' }
  }
  const { hash, ...resto } = pacote as PacoteTorneio
  if (hashDoPacote(resto) !== hash) return { ok: false, erro: 'corrompido' }
  return { ok: true, pacote: pacote as PacoteTorneio }
}

/* ---------- Código e QR ---------- */

export function pacoteParaCodigo(pacote: PacoteTorneio): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(pacote))
}

export function codigoParaPacote(codigo: string): Validacao {
  const texto = LZString.decompressFromEncodedURIComponent(codigo.replace(/\s+/g, ''))
  if (!texto) return { ok: false, erro: 'invalido' }
  return validarPacote(texto)
}

/** Pedaços numerados "MJC:2/5:…" para uma sequência de QRs. */
export function pedacosDoCodigo(codigo: string, tamanho = TAMANHO_PEDACO_QR): string[] {
  const total = Math.max(1, Math.ceil(codigo.length / tamanho))
  return Array.from(
    { length: total },
    (_, indice) =>
      `MJC:${indice + 1}/${total}:${codigo.slice(indice * tamanho, (indice + 1) * tamanho)}`,
  )
}

export interface LeituraQr {
  total: number
  pedacos: Record<number, string>
}

/** Junta um pedaço lido. Devolve a leitura atualizada, ou null se não é um QR do Riichi Manager. */
export function juntarPedaco(leitura: LeituraQr | null, texto: string): LeituraQr | null {
  const casamento = /^MJC:(\d+)\/(\d+):(.*)$/s.exec(texto)
  if (!casamento) return null
  const numero = Number(casamento[1])
  const total = Number(casamento[2])
  const base = leitura && leitura.total === total ? leitura : { total, pedacos: {} }
  return { total, pedacos: { ...base.pedacos, [numero]: casamento[3] } }
}

export function leituraCompleta(leitura: LeituraQr): string | null {
  const partes: string[] = []
  for (let numero = 1; numero <= leitura.total; numero += 1) {
    const parte = leitura.pedacos[numero]
    if (parte === undefined) return null
    partes.push(parte)
  }
  return partes.join('')
}

/* ---------- Importação ---------- */

export type CasamentoJogador =
  | { tipo: 'id'; localId: string }
  | { tipo: 'nome'; localId: string }
  | { tipo: 'novo' }

export interface PlanoImportacao {
  resumo: {
    nome: string
    formato: Torneio['formato']['tipo']
    rodadas: number
    jogadores: number
    partidas: number
  }
  /** Por id do pacote. `nome` pede confirmação: pode ser outra pessoa com o mesmo nome. */
  jogadores: Record<string, CasamentoJogador>
  /** Já existe um torneio com o mesmo id aqui. */
  conflito: boolean
}

const normalizar = (nome: string) => nome.trim().toLocaleLowerCase()

export function planejarImportacao(
  pacote: PacoteTorneio,
  local: { torneios: readonly Torneio[]; jogadores: readonly Jogador[] },
): PlanoImportacao {
  const jogadores: Record<string, CasamentoJogador> = {}
  for (const jogador of pacote.jogadores) {
    const porId = local.jogadores.find((item) => item.id === jogador.id)
    const porNome = local.jogadores.find(
      (item) => !item.arquivado && normalizar(item.nome) === normalizar(jogador.nome),
    )
    jogadores[jogador.id] = porId
      ? { tipo: 'id', localId: porId.id }
      : porNome
        ? { tipo: 'nome', localId: porNome.id }
        : { tipo: 'novo' }
  }
  return {
    resumo: {
      nome: pacote.torneio.nome,
      formato: pacote.torneio.formato.tipo,
      rodadas: pacote.torneio.rodadas.length,
      jogadores: pacote.torneio.jogadorIds.length,
      partidas: pacote.partidas.length,
    },
    jogadores,
    conflito: local.torneios.some((item) => item.id === pacote.torneio.id),
  }
}

export interface EscolhasImportacao {
  /** Por id do pacote: true usa o jogador local de mesmo nome, false cria outro. Ausente = true. */
  mesmoNome?: Record<string, boolean>
  /** Só vale quando há conflito. */
  conflito?: 'substituir' | 'manterAmbos'
  sufixoImportado: string
}

export interface ResultadoImportacao {
  torneio: Torneio
  partidas: Partida[]
  jogadoresNovos: Jogador[]
  temporada?: Temporada
  /** Torneio local a substituir (as partidas dele saem junto). */
  substituirId?: string
}

export function importarTorneio(
  pacote: PacoteTorneio,
  plano: PlanoImportacao,
  escolhas: EscolhasImportacao,
  contexto: { gerarId: () => string; agora: string },
): ResultadoImportacao {
  const mapa = new Map<string, string>()
  const jogadoresNovos: Jogador[] = []
  for (const jogador of pacote.jogadores) {
    const casamento = plano.jogadores[jogador.id] ?? { tipo: 'novo' }
    const usarLocal =
      casamento.tipo === 'id' ||
      (casamento.tipo === 'nome' && escolhas.mesmoNome?.[jogador.id] !== false)
    if (usarLocal) {
      mapa.set(jogador.id, casamento.localId)
    } else {
      // Mantém o id de origem quando está livre: na volta, casa por id.
      const id = casamento.tipo === 'novo' ? jogador.id : contexto.gerarId()
      mapa.set(jogador.id, id)
      jogadoresNovos.push({
        id,
        nome: jogador.nome,
        ...(jogador.apelido ? { apelido: jogador.apelido } : {}),
        criadoEm: contexto.agora,
        arquivado: false,
      })
    }
  }
  const trocar = (id: string) => mapa.get(id) ?? id

  const manterAmbos = plano.conflito && escolhas.conflito === 'manterAmbos'
  const torneioId = manterAmbos ? contexto.gerarId() : pacote.torneio.id
  const torneio: Torneio = {
    ...pacote.torneio,
    id: torneioId,
    nome: manterAmbos ? `${pacote.torneio.nome} ${escolhas.sufixoImportado}` : pacote.torneio.nome,
    jogadorIds: pacote.torneio.jogadorIds.map(trocar),
    rodadas: pacote.torneio.rodadas.map((rodada) => ({
      ...rodada,
      mesas: rodada.mesas.map((mesa) => ({
        ...mesa,
        assentos: mesa.assentos.map(trocar) as typeof mesa.assentos,
      })),
    })),
    atualizadoEm: contexto.agora,
  }

  const partidas = pacote.partidas.map((partida): Partida => {
    const assentos = { ...partida.assentos }
    for (const cadeira of [0, 1, 2, 3] as const) {
      assentos[cadeira] = { ...assentos[cadeira], jogadorId: trocar(assentos[cadeira].jogadorId) }
    }
    return {
      ...partida,
      id: manterAmbos ? contexto.gerarId() : partida.id,
      assentos,
      ...(partida.resultado
        ? {
            resultado: partida.resultado.map((linha) => ({
              ...linha,
              jogadorId: trocar(linha.jogadorId),
            })),
          }
        : {}),
      ...(partida.vinculoTorneio
        ? { vinculoTorneio: { ...partida.vinculoTorneio, torneioId } }
        : {}),
    }
  })

  return {
    torneio,
    partidas,
    jogadoresNovos,
    ...(pacote.temporada ? { temporada: pacote.temporada } : {}),
    ...(plano.conflito && !manterAmbos ? { substituirId: pacote.torneio.id } : {}),
  }
}

/** Nome do arquivo: "encontro-do-clube.mojoca.json". */
export function nomeDoArquivo(torneio: Torneio): string {
  const base = torneio.nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `${base || 'torneio'}${EXTENSAO_PACOTE}`
}

/** Fim da rodada: lembrete discreto de backup, uma vez por rodada. */
export function deveLembrarBackup(
  torneio: Torneio,
  rodadaFechada: boolean,
  ultimoLembrete: number | undefined,
): boolean {
  return (
    rodadaFechada &&
    torneio.status === 'em_andamento' &&
    !torneio.transferidoEm &&
    ultimoLembrete !== torneio.rodadas.length
  )
}
