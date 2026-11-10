/**
 * Dados de teste para desenvolvimento: jogadores com nomes reais e partidas
 * finalizadas espalhadas pelos últimos meses. Só a tela em modo dev usa isto.
 * A semente fixa gera sempre os mesmos dados, para comparar antes e depois.
 * Tudo tem o prefixo `teste-` no id, para apagar sem tocar no resto.
 */
import type { Jogador } from '@/dominios/jogadores/logica/jogadores'
import { alterarConfig, configDoPreset } from './configMesa'
import { umaFixa } from './uma'
import { criarPartidaManual } from './partidaManual'
import type { Partida } from './partida'

export const PREFIXO_TESTE = 'teste-'

const PESSOAS: readonly { nome: string; apelido?: string; forca: number }[] = [
  { nome: 'Ana Carolina Souza', apelido: 'Carol', forca: 1.4 },
  { nome: 'Bruno Henrique Lima', apelido: 'Brunão', forca: 1.1 },
  { nome: 'Camila Ferreira', forca: 1.0 },
  { nome: 'Diego Nakamura', apelido: 'Naka', forca: 1.5 },
  { nome: 'Eduardo Martins', apelido: 'Dudu', forca: 0.8 },
  { nome: 'Fernanda Oliveira', apelido: 'Fê', forca: 1.2 },
  { nome: 'Gabriel Tanaka', apelido: 'Gabi', forca: 0.9 },
  { nome: 'Helena Rocha', forca: 1.0 },
  { nome: 'Igor Santos', apelido: 'Igor', forca: 0.7 },
  { nome: 'Juliana Yamamoto', apelido: 'Ju', forca: 1.3 },
  { nome: 'Lucas Pereira', apelido: 'Luquinha', forca: 0.9 },
  { nome: 'Mariana Costa', apelido: 'Mari', forca: 1.1 },
]

/** Gerador pseudoaleatório com semente (mulberry32). */
function sorteador(semente: number) {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let valor = estado
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1)
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61)
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296
  }
}

export function gerarJogadoresDeTeste(agora: Date): Jogador[] {
  return PESSOAS.map((pessoa, indice) => ({
    id: `${PREFIXO_TESTE}jogador-${indice + 1}`,
    nome: pessoa.nome,
    ...(pessoa.apelido ? { apelido: pessoa.apelido } : {}),
    criadoEm: agora.toISOString(),
    arquivado: false,
  }))
}

/**
 * Partidas finalizadas nos últimos ~10 meses. Os pontos saem de trocas entre os
 * quatro, pesadas pela força de cada um, para surgirem rivais e fregueses.
 */
export function gerarPartidasDeTeste(agora: Date, quantidade = 80, semente = 2026): Partida[] {
  const sortear = sorteador(semente)
  const inteiro = (maximo: number) => Math.floor(sortear() * maximo)
  const jogadores = gerarJogadoresDeTeste(agora)

  return Array.from({ length: quantidade }, (_, indice) => {
    // Quatro jogadores distintos, em ordem aleatória (a ordem define o vento inicial).
    const mesa: number[] = []
    while (mesa.length < 4) {
      const escolhido = inteiro(jogadores.length)
      if (!mesa.includes(escolhido)) mesa.push(escolhido)
    }
    const leste = sortear() < 0.4
    const pontos = [25000, 25000, 25000, 25000]
    const trocas = (leste ? 5 : 10) + inteiro(5)
    for (let troca = 0; troca < trocas; troca += 1) {
      const forcas = mesa.map((pessoa) => PESSOAS[pessoa].forca)
      let alvo = sortear() * forcas.reduce((soma, forca) => soma + forca, 0)
      const vencedor = forcas.findIndex((forca) => (alvo -= forca) < 0)
      const perdedor = (vencedor + 1 + inteiro(3)) % 4
      const valor = (10 + inteiro(110)) * 100
      pontos[vencedor] += valor
      pontos[perdedor] -= valor
    }
    const dias = inteiro(300)
    const quando = new Date(agora.getTime() - dias * 86_400_000 - inteiro(12) * 3_600_000)
    const partida = criarPartidaManual(
      `${PREFIXO_TESTE}partida-${indice + 1}`,
      alterarConfig(configDoPreset('padrao'), { tipoPartida: leste ? 'leste' : 'hanchan' }),
      {
        jogadorIds: mesa.map((pessoa) => jogadores[pessoa].id) as [string, string, string, string],
        nomes: mesa.map((pessoa) => jogadores[pessoa].apelido ?? jogadores[pessoa].nome),
        pontos: pontos as [number, number, number, number],
        pontosPartida: 25000,
        pontosRetorno: 30000,
        uma: umaFixa([15, 5, -5, -15]),
      },
      quando.toISOString(),
    )
    // Parte delas como se tivesse sido jogada no placar do app.
    return sortear() < 0.35 ? { ...partida, registradaManual: false } : partida
  })
}
