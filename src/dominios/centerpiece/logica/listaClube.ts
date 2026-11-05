/**
 * Lista de presença do encontro do clube, em TypeScript puro: um nome por linha,
 * como numa folha de bloco de notas.
 *
 * Uma linha é "vinculada" quando o texto bate com um jogador do cadastro (nome,
 * apelido ou nome exibido, sem acento e sem diferença de maiúsculas). As outras
 * entram como convidados: jogam, mas não vão para o cadastro nem para o ranking.
 */
import { nomeExibido, normalizarTexto, type Jogador } from '@/dominios/jogadores/logica/jogadores'
import { KANJI_VENTO, type Vento } from './partida'
import type { MesaSorteada } from './sorteioClube'

export interface EntradaLista {
  nome: string
  /** Só para quem está no cadastro. */
  jogadorId?: string
}

/** Prefixo do id de quem joga sem cadastro: o nome fica guardado no assento. */
export const PREFIXO_CONVIDADO = 'convidado-'

export function ehConvidado(jogadorId: string) {
  return jogadorId.startsWith(PREFIXO_CONVIDADO)
}

/** Linhas como a pessoa escreveu, sem espaços sobrando. Vazias continuam lá. */
export function linhasDoTexto(texto: string): string[] {
  return texto.split(/\r?\n/).map((linha) => linha.trim().replace(/\s+/g, ' '))
}

/** Jogador do cadastro (não arquivado) com esse nome, apelido ou nome exibido. */
export function jogadorDaLinha(jogadores: readonly Jogador[], linha: string): Jogador | undefined {
  const procurado = normalizarTexto(linha)
  if (!procurado) return undefined
  const ativos = jogadores.filter((jogador) => !jogador.arquivado)
  return (
    ativos.find((jogador) => normalizarTexto(nomeExibido(jogador)) === procurado) ??
    ativos.find(
      (jogador) =>
        normalizarTexto(jogador.nome) === procurado || normalizarTexto(jogador.apelido ?? '') === procurado,
    )
  )
}

/**
 * Texto limpo: sem linhas vazias e sem repetidos. Repetido é o mesmo nome sem
 * acento e sem maiúsculas, ou duas linhas que apontam para o mesmo cadastro.
 */
export function limparLista(texto: string, jogadores: readonly Jogador[]) {
  const vistos = new Set<string>()
  const nomes: string[] = []
  let repetidos = 0
  for (const linha of linhasDoTexto(texto)) {
    if (!linha) continue
    const jogador = jogadorDaLinha(jogadores, linha)
    const chave = jogador ? `id:${jogador.id}` : `nome:${normalizarTexto(linha)}`
    if (vistos.has(chave)) {
      repetidos += 1
      continue
    }
    vistos.add(chave)
    nomes.push(linha)
  }
  return { texto: nomes.join('\n'), nomes, repetidos }
}

/** Quem está na lista, já sem vazias e repetidos, com o vínculo de cada um. */
export function entradasDaLista(texto: string, jogadores: readonly Jogador[]): EntradaLista[] {
  return limparLista(texto, jogadores).nomes.map((nome) => {
    const jogador = jogadorDaLinha(jogadores, nome)
    return jogador ? { nome: nomeExibido(jogador), jogadorId: jogador.id } : { nome }
  })
}

/**
 * Sugestões do cadastro para a linha que está sendo digitada. Some quando a linha
 * já é um jogador e não repete quem já está em outra linha.
 */
export function sugestoesParaLinha(
  jogadores: readonly Jogador[],
  linha: string,
  idsNaLista: ReadonlySet<string>,
  limite = 5,
): Jogador[] {
  const procurado = normalizarTexto(linha)
  if (!procurado || jogadorDaLinha(jogadores, linha)) return []
  return jogadores
    .filter((jogador) => !jogador.arquivado && !idsNaLista.has(jogador.id))
    .filter((jogador) =>
      [jogador.nome, jogador.apelido ?? ''].some((texto) => normalizarTexto(texto).includes(procurado)),
    )
    .sort((um, outro) => {
      // Quem começa com o texto vem antes de quem só o contém no meio.
      const comeca = (jogador: Jogador) => (normalizarTexto(nomeExibido(jogador)).startsWith(procurado) ? 0 : 1)
      return comeca(um) - comeca(outro) || nomeExibido(um).localeCompare(nomeExibido(outro))
    })
    .slice(0, limite)
}

/**
 * Põe nomes na lista, um por linha, pulando quem já está lá. `posicao` é quantos
 * nomes ficam antes dos novos; sem ela, entram no fim.
 */
export function acrescentarNomes(
  texto: string,
  nomes: readonly string[],
  jogadores: readonly Jogador[],
  posicao?: number,
) {
  const atuais = limparLista(texto, jogadores).nomes
  const corte = Math.min(posicao ?? atuais.length, atuais.length)
  const juntos = limparLista(
    [...atuais.slice(0, corte), ...nomes, ...atuais.slice(corte)].join('\n'),
    jogadores,
  )
  return { texto: juntos.texto, repetidos: juntos.repetidos }
}

/** Texto simples para compartilhar o resultado do sorteio. */
export function textoDasMesas(
  mesas: readonly MesaSorteada<EntradaLista>[],
  rotulos: { titulo: string; mesa: (numero: number) => string; vento: (vento: Vento) => string },
) {
  const blocos = mesas.map((mesa) =>
    [
      rotulos.mesa(mesa.numero),
      ...mesa.assentos.map(
        ({ vento, jogador }) => `${KANJI_VENTO[vento]} ${rotulos.vento(vento)}: ${jogador.nome}`,
      ),
    ].join('\n'),
  )
  return [rotulos.titulo, ...blocos].join('\n\n')
}
