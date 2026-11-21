import { acoesJogadores, useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { acoesTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import { acoesPlacaresMcr, usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { gerarDadosMcrDeTeste } from '@/dominios/placar-mcr/logica/dadosDeTesteMcr'
import { acoesPartidas, usePartidas } from '../hooks/usePartidas'
import { acoesClube } from '../hooks/useClube'
import {
  PREFIXO_TESTE,
  gerarClubeDeTeste,
  gerarJogadoresDeTeste,
  gerarPartidasDeTeste,
  gerarTorneiosDeTeste,
} from '../../logica/dadosDeTeste'

/**
 * Só em `npm run dev` (fica fora do build): gera ou apaga a massa de teste
 * (jogadores, partidas avulsas, torneios, temporada e encontros do clube, e os
 * placares e o torneio do modo Chinês).
 * Texto fixo em português, sem i18n, por não chegar ao usuário.
 */
export default function FerramentasDev() {
  const { jogadores } = useJogadores()
  const { partidas } = usePartidas()
  const placaresMcr = usePlacaresMcr()
  const ehTeste = (id: string) => id.startsWith(PREFIXO_TESTE)
  const temTeste = jogadores.some((jogador) => ehTeste(jogador.id)) || partidas.some((partida) => ehTeste(partida.id)) || placaresMcr.some((placar) => ehTeste(placar.id))

  const gerar = () => {
    const agora = new Date()
    const torneios = gerarTorneiosDeTeste(agora)
    const clube = gerarClubeDeTeste(agora)
    const mcr = gerarDadosMcrDeTeste(agora)
    acoesJogadores.incluir(gerarJogadoresDeTeste(agora))
    acoesPartidas.substituirTeste(PREFIXO_TESTE, [
      ...gerarPartidasDeTeste(agora),
      ...torneios.partidas,
      ...clube.partidas,
    ])
    acoesTorneios.substituirTeste(PREFIXO_TESTE, { ...torneios, torneios: [...torneios.torneios, mcr.torneio] })
    acoesPlacaresMcr.substituirTeste(PREFIXO_TESTE, mcr.placares)
    acoesClube.substituirTeste(PREFIXO_TESTE, clube)
  }
  const apagar = () => {
    acoesPartidas.substituirTeste(PREFIXO_TESTE, [])
    acoesTorneios.substituirTeste(PREFIXO_TESTE, { torneios: [], temporadas: [] })
    acoesClube.substituirTeste(PREFIXO_TESTE, { encontros: [], sorteio: null })
    acoesPlacaresMcr.substituirTeste(PREFIXO_TESTE, [])
    jogadores.filter((jogador) => ehTeste(jogador.id)).forEach((jogador) => acoesJogadores.excluir(jogador.id))
  }

  return (
    <div className="rkf-dev">
      <span>DEV</span>
      <button type="button" onClick={gerar}>
        {temTeste ? 'Gerar de novo' : 'Gerar dados de teste'}
      </button>
      {temTeste && (
        <button type="button" onClick={apagar}>
          Apagar dados de teste
        </button>
      )}
    </div>
  )
}
