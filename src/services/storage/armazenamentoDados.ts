/**
 * Armazenamento dos dados sobre o banco local. As telas continuam síncronas:
 * tudo é lido do banco uma vez, na abertura, e fica em memória. Cada gravação
 * atualiza a memória na hora e vai para o banco em segundo plano, em fila.
 *
 * Na primeira abertura, copia os dados do localStorage para o banco, confere a
 * cópia e só então apaga as chaves antigas.
 */
import type { ArmazenamentoChaveValor } from '@/compartilhado/persistencia/armazenamento'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import type { BancoDados, ConteudoBanco } from './banco'
import {
  dividirPartida,
  idsParaPodar,
  lerLimiteDetalhes,
  montarPartida,
  type DetalhesPartida,
  type ResumoPartida,
} from './partidaArmazenada'

export const CHAVE_PARTIDAS = 'riichi-manager-partidas'
/** Ajuste "Guardar detalhes das últimas N partidas". */
export const CHAVE_LIMITE_DETALHES = 'riichi-manager-limite-detalhes'

/** Chaves que moram no banco. Preferências e chaves antigas seguem no localStorage. */
export const CHAVES_DE_DADOS: readonly string[] = [
  'riichi-manager-jogadores',
  CHAVE_PARTIDAS,
  'riichi-manager-torneios',
  'riichi-manager-torneio-lista',
  'riichi-manager-clube-lista',
  'riichi-manager-clube-sorteio',
  'riichi-manager-clube-encontros',
  'riichi-manager-config-mesa',
  'riichi-manager-regras-registro',
  'riichi-manager-centerpiece-simples',
  'riichi-manager-ranking-filtros',
  'riichi-manager-eu',
  CHAVE_LIMITE_DETALHES,
]

/** Marca no banco: a cópia do localStorage já foi feita e conferida. */
const MARCA_MIGRACAO = 'mojoca:migrado-do-localstorage'
/** Versão do formato das partidas (o `versao` que o repositório grava). */
const VERSAO_PARTIDAS = 'mojoca:versao-partidas'

export interface ArmazenamentoDados extends ArmazenamentoChaveValor {
  /** Espera tudo o que está na fila chegar ao banco (antes de recarregar o app). */
  aguardar(): Promise<void>
}

/** Divide as partidas e separa os detalhes que não devem ficar. */
function partesDasPartidas(partidas: readonly Partida[], limite: number) {
  const podar = new Set(idsParaPodar(partidas, limite))
  const resumos: ResumoPartida[] = []
  const detalhes: DetalhesPartida[] = []
  for (const partida of partidas) {
    const partes = dividirPartida(partida)
    resumos.push(partes.resumo)
    if (!podar.has(partida.id)) detalhes.push(partes.detalhes)
  }
  return { resumos, detalhes, podar }
}

function lerPartidasDoTexto(texto: string): { versao: number; partidas: Partida[] } {
  const lido = JSON.parse(texto) as { versao?: number; partidas?: Partida[] }
  return { versao: lido.versao ?? 1, partidas: Array.isArray(lido.partidas) ? lido.partidas : [] }
}

/** Copia o localStorage para o banco e confere. Erro aqui não apaga nada. */
async function migrar(banco: BancoDados, origem: ArmazenamentoChaveValor, agora: Date): Promise<ConteudoBanco> {
  const novo: ConteudoBanco = { chaves: {}, resumos: [], detalhes: [] }
  const limite = lerLimiteDetalhes(origem.ler(CHAVE_LIMITE_DETALHES))
  let esperadas = 0
  for (const chave of CHAVES_DE_DADOS) {
    const valor = origem.ler(chave)
    if (valor === null) continue
    if (chave === CHAVE_PARTIDAS) {
      const { versao, partidas } = lerPartidasDoTexto(valor)
      const partes = partesDasPartidas(partidas, limite)
      novo.resumos = partes.resumos
      novo.detalhes = partes.detalhes
      novo.chaves[VERSAO_PARTIDAS] = String(versao)
      esperadas = partidas.length
    } else {
      novo.chaves[chave] = valor
    }
  }
  novo.chaves[MARCA_MIGRACAO] = agora.toISOString()
  await banco.substituirTudo(novo)

  // Conferência: o que voltou do banco tem de ser igual ao que foi.
  const lido = await banco.lerTudo()
  const iguais =
    Object.entries(novo.chaves).every(([chave, valor]) => lido.chaves[chave] === valor) &&
    lido.resumos.length === esperadas &&
    lido.detalhes.length === novo.detalhes.length
  if (!iguais) throw new Error('A cópia para o banco local não conferiu; os dados seguem no localStorage.')
  return lido
}

/**
 * Abre o banco (migrando na primeira vez) e devolve o armazenamento síncrono.
 * `podeApagarOrigem` diz se ainda vale apagar o localStorage: se a abertura
 * demorou e o app já começou com os dados antigos, nada é apagado.
 */
export async function abrirArmazenamentoDados(
  banco: BancoDados,
  origem: ArmazenamentoChaveValor,
  opcoes: { agora?: Date; podeApagarOrigem?: () => boolean } = {},
): Promise<ArmazenamentoDados> {
  let conteudo = await banco.lerTudo()
  if (!conteudo.chaves[MARCA_MIGRACAO]) {
    conteudo = await migrar(banco, origem, opcoes.agora ?? new Date())
    if (!(opcoes.podeApagarOrigem?.() ?? true)) {
      // O app já abriu com o localStorage e pode mudar os dados lá: esta cópia
      // fica sem a marca e a migração refaz tudo na próxima abertura.
      await banco.removerChave(MARCA_MIGRACAO)
      throw new Error('O app abriu antes do banco local; a migração fica para a próxima abertura.')
    }
    for (const chave of CHAVES_DE_DADOS) origem.remover?.(chave)
  }

  // Memória: as chaves como estão e as partidas remontadas no formato do repositório.
  const memoria = new Map<string, string>()
  for (const [chave, valor] of Object.entries(conteudo.chaves)) {
    if (chave !== MARCA_MIGRACAO && chave !== VERSAO_PARTIDAS) memoria.set(chave, valor)
  }
  const detalhesPorId = new Map(conteudo.detalhes.map((detalhes) => [detalhes.id, detalhes]))
  if (conteudo.resumos.length > 0 || conteudo.chaves[VERSAO_PARTIDAS]) {
    const partidas = conteudo.resumos.map((resumo) => montarPartida(resumo, detalhesPorId.get(resumo.id)))
    const versao = Number(conteudo.chaves[VERSAO_PARTIDAS]) || 1
    memoria.set(CHAVE_PARTIDAS, JSON.stringify({ versao, partidas }))
  }

  // O que já está no banco, para gravar só o que mudou.
  const resumosGravados = new Map(conteudo.resumos.map((resumo) => [resumo.id, JSON.stringify(resumo)]))
  const detalhesGravados = new Map(conteudo.detalhes.map((detalhes) => [detalhes.id, JSON.stringify(detalhes)]))
  let versaoGravada = conteudo.chaves[VERSAO_PARTIDAS]

  let fila: Promise<void> = Promise.resolve()
  const enfileirar = (tarefa: () => Promise<void>) => {
    fila = fila.then(tarefa).catch((erro) => console.error('Falha ao gravar no banco local', erro))
  }

  const gravarPartidas = (texto: string) => {
    let lido: { versao: number; partidas: Partida[] }
    try {
      lido = lerPartidasDoTexto(texto)
    } catch {
      return
    }
    const limite = lerLimiteDetalhes(memoria.get(CHAVE_LIMITE_DETALHES) ?? null)
    const partes = partesDasPartidas(lido.partidas, limite)
    const ids = new Set(lido.partidas.map((partida) => partida.id))
    const resumos = partes.resumos.filter((resumo) => resumosGravados.get(resumo.id) !== JSON.stringify(resumo))
    const detalhes = partes.detalhes.filter(
      (item) => detalhesGravados.get(item.id) !== JSON.stringify(item),
    )
    const remover = [...resumosGravados.keys()].filter((id) => !ids.has(id))
    const podar = [...partes.podar].filter((id) => detalhesGravados.has(id))

    for (const resumo of resumos) resumosGravados.set(resumo.id, JSON.stringify(resumo))
    for (const item of detalhes) detalhesGravados.set(item.id, JSON.stringify(item))
    for (const id of [...remover, ...podar]) detalhesGravados.delete(id)
    for (const id of remover) resumosGravados.delete(id)

    const versao = String(lido.versao)
    if (versao !== versaoGravada) {
      versaoGravada = versao
      enfileirar(() => banco.gravarChave(VERSAO_PARTIDAS, versao))
    }
    if (resumos.length || detalhes.length || remover.length || podar.length) {
      enfileirar(() => banco.gravarPartidas({ resumos, detalhes, remover, podar }))
    }
  }

  return {
    ler: (chave) => memoria.get(chave) ?? null,
    gravar(chave, valor) {
      memoria.set(chave, valor)
      if (chave === CHAVE_PARTIDAS) {
        gravarPartidas(valor)
        return
      }
      enfileirar(() => banco.gravarChave(chave, valor))
      // Mudou o limite: poda (ou volta a guardar) os detalhes já agora.
      const partidas = memoria.get(CHAVE_PARTIDAS)
      if (chave === CHAVE_LIMITE_DETALHES && partidas) gravarPartidas(partidas)
    },
    remover(chave) {
      memoria.delete(chave)
      if (chave === CHAVE_PARTIDAS) {
        gravarPartidas(JSON.stringify({ versao: Number(versaoGravada) || 1, partidas: [] }))
        return
      }
      enfileirar(() => banco.removerChave(chave))
    },
    aguardar: () => fila,
  }
}
