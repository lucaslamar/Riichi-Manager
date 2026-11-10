import { acoesJogadores, useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { acoesPartidas, usePartidas } from '../hooks/usePartidas'
import { PREFIXO_TESTE, gerarJogadoresDeTeste, gerarPartidasDeTeste } from '../../logica/dadosDeTeste'

/**
 * Só em `npm run dev` (fica fora do build): gera ou apaga jogadores e partidas
 * de teste. Texto fixo em português, sem i18n, por não chegar ao usuário.
 */
export default function FerramentasDev() {
  const { jogadores } = useJogadores()
  const { partidas } = usePartidas()
  const ehTeste = (id: string) => id.startsWith(PREFIXO_TESTE)
  const temTeste = jogadores.some((jogador) => ehTeste(jogador.id)) || partidas.some((partida) => ehTeste(partida.id))

  const gerar = () => {
    const agora = new Date()
    acoesJogadores.incluir(gerarJogadoresDeTeste(agora))
    acoesPartidas.trocarDoTorneio(undefined, gerarPartidasDeTeste(agora))
  }
  const apagar = () => {
    partidas.filter((partida) => ehTeste(partida.id)).forEach((partida) => acoesPartidas.descartar(partida.id))
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
