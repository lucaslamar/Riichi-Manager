/**
 * 16 jogadores em mesas de 4 fecham 5 rodadas sem repetir adversário, e 9 em mesas
 * de 3 fecham 4 (planos afins). Sortear uma rodada por vez pode cair num beco sem
 * saída: aqui a rodada só sai se as que faltam ainda fecharem sem repetição.
 */
import { embaralhar, type InteiroAleatorio } from './aleatorio'
import {
  chaveDoPar,
  contarPares,
  contarVentos,
  ocupantes,
  paresDaMesa,
  type JogadoresPorMesa,
  type MesaDaRodada,
  type RodadaDoSorteio,
} from './contagens'
import { mesasDaFila } from './mesas'

/** Um começo ruim não se conserta no fundo da busca: recomeçar curto acha mais rápido. */
const LIMITE_DE_PASSOS = 1_500
const RECOMECOS = 60

/** A próxima rodada, ou null fora desses casos ou se não dá mais para fechar sem repetir. */
export function rodadaSemRepetir(
  jogadores: readonly string[],
  anteriores: readonly RodadaDoSorteio[],
  porMesa: JogadoresPorMesa,
  comVentos: boolean,
  aleatorio: InteiroAleatorio,
): MesaDaRodada[] | null {
  const totalJogadores = porMesa * porMesa
  const totalRodadas = porMesa + 1
  if (jogadores.length !== totalJogadores || anteriores.length >= totalRodadas) return null
  // Vale para a lista fixa: quem chegou ou saiu no meio muda a grade.
  const mesmaLista = anteriores.every(({ mesas }) => {
    const sentados = new Set(mesas.flatMap((mesa) => ocupantes(mesa.assentos)))
    return sentados.size === totalJogadores && jogadores.every((id) => sentados.has(id))
  })
  if (!mesmaLista) return null
  const historico = contarPares(anteriores)
  if ([...historico.values()].some((vezes) => vezes > 1)) return null

  const juntos = new Set(historico.keys())
  let passos = 0

  function completar(rodadas: readonly RodadaDoSorteio[]): MesaDaRodada[] | null {
    const ventos = contarVentos(rodadas)
    const menorLeste = Math.min(...jogadores.map((id) => ventos.get(id)?.[0] ?? 0))
    const semLesteDaVez = (grupo: readonly string[]) =>
      comVentos && grupo.every((id) => (ventos.get(id)?.[0] ?? 0) > menorLeste)

    function formarMesas(livres: readonly string[], grupos: string[][]): MesaDaRodada[] | null {
      if (++passos > LIMITE_DE_PASSOS) return null
      if (livres.length === 0) return fechar(grupos)
      const [primeiro, ...resto] = livres
      return completarMesa([primeiro], resto, 0, grupos)
    }

    function completarMesa(
      grupo: string[],
      candidatos: readonly string[],
      de: number,
      grupos: string[][],
    ): MesaDaRodada[] | null {
      if (grupo.length === porMesa) {
        if (semLesteDaVez(grupo)) return null
        return formarMesas(
          candidatos.filter((id) => !grupo.includes(id)),
          [...grupos, grupo],
        )
      }
      for (let indice = de; indice < candidatos.length; indice++) {
        const candidato = candidatos[indice]
        if (grupo.some((id) => juntos.has(chaveDoPar(id, candidato)))) continue
        const mesas = completarMesa([...grupo, candidato], candidatos, indice + 1, grupos)
        if (mesas || passos > LIMITE_DE_PASSOS) return mesas
      }
      return null
    }

    function fechar(grupos: string[][]): MesaDaRodada[] | null {
      // A ordem dentro do grupo desempata quem é Leste.
      const fila = grupos.flatMap((grupo) => embaralhar(grupo, aleatorio))
      const mesas = mesasDaFila(fila, rodadas, porMesa, comVentos)
      if (rodadas.length + 1 === totalRodadas) return mesas
      const novos = grupos.flatMap(paresDaMesa).map(([um, outro]) => chaveDoPar(um, outro))
      novos.forEach((par) => juntos.add(par))
      const fecha = completar([...rodadas, { mesas }])
      novos.forEach((par) => juntos.delete(par))
      return fecha ? mesas : null
    }

    return formarMesas(embaralhar(jogadores, aleatorio), [])
  }

  for (let vez = 0; vez < RECOMECOS; vez++) {
    passos = 0
    const mesas = completar(anteriores)
    if (mesas) return mesas
    // Sem ventos, uma busca que não bateu no limite já viu tudo.
    if (!comVentos && passos <= LIMITE_DE_PASSOS) return null
  }
  return null
}
