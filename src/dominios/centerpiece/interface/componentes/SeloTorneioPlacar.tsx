import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useRelogioTorneio } from '@/dominios/torneio-fast/interface/hooks/useRelogioTorneio'
import { useTorneios } from '@/dominios/torneio-fast/interface/hooks/useTorneios'
import { segundosRestantesMesa } from '@/dominios/torneio-fast/logica/acoes'
import { formatarDuracao } from '@/dominios/torneio-fast/logica/chaves'
import type { Partida } from '../../logica/partida'
import '@/dominios/torneio-fast/interface/torneio.css'

/** "Torneio · Rodada 2 · Mesa 3", botão para a grade e o tempo da rodada + acréscimos. */
export default function SeloTorneioPlacar({
  vinculo,
  aoVoltarGrade,
}: {
  vinculo: NonNullable<Partida['vinculoTorneio']>
  aoVoltarGrade: () => void
}) {
  const { t } = useI18n()
  const { torneios } = useTorneios()
  const torneio = torneios.find((item) => item.id === vinculo.torneioId)
  const agora = useRelogioTorneio(torneio)

  return (
    <>
      <div className="trn-selo-placar">
        <span>
          {t('tournament.badge', { round: vinculo.rodada + 1, table: vinculo.mesa + 1 })}
        </span>
        <button type="button" className="btn-contorno" onClick={aoVoltarGrade}>
          {t('tournament.backToGrid')}
        </button>
      </div>
      {torneio && torneio.timer.indiceRodada === vinculo.rodada && (
        <p className="trn-tempo-placar" role="timer">
          <i className="fas fa-clock" aria-hidden="true" />{' '}
          {formatarDuracao(segundosRestantesMesa(torneio.timer, vinculo.rodada, vinculo.mesa, agora))}
        </p>
      )}
    </>
  )
}
