import { useEffect, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { Partida } from '@/dominios/centerpiece/logica/partida'
import { relogioDaMesa, relogioDaRodada } from '../../logica/mesas'
import { acabou, estaRodando, formatarRelogio, segundosRestantes } from '../../logica/relogio'
import { useTorneios } from '../hooks/useTorneios'
import '../torneio.css'

/**
 * No cabeçalho da partida do Centerpiece: "Torneio · R2 · M1" e o tempo da mesa
 * (ou da rodada, sem timer por mesa). Fica no cabeçalho para não mexer na mesa.
 */
export default function SeloTorneio({ vinculo }: { vinculo: NonNullable<Partida['vinculoTorneio']> }) {
  const { t } = useI18n()
  const { torneios } = useTorneios()
  const torneio = torneios.find((item) => item.id === vinculo.torneioId)
  const rodada = torneio?.rodadas.find((item) => item.numero === vinculo.rodada + 1)
  const mesa = rodada?.mesas.find((item) => item.numero === vinculo.mesa + 1)
  const relogio = torneio && rodada && mesa ? (relogioDaMesa(torneio, mesa) ?? relogioDaRodada(torneio, rodada)) : null
  const rodando = !!relogio && estaRodando(relogio)
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!rodando) return
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(intervalo)
  }, [rodando])

  const esgotado = !!relogio && acabou(relogio, agora)
  return (
    <span className="trn-selo">
      <span className="trn-selo-texto">
        {t('tournament.tables.badgeShort', { round: vinculo.rodada + 1, table: vinculo.mesa + 1 })}
      </span>
      {relogio && (
        <span
          className={`trn-selo-tempo${esgotado ? ' trn-erro' : ''}`}
          role="timer"
          aria-label={esgotado ? t('tournament.tables.lastHand') : undefined}
        >
          <i className={`fas ${esgotado ? 'fa-hourglass-end' : 'fa-clock'}`} aria-hidden="true" />{' '}
          {esgotado ? t('tournament.tables.lastHandShort') : formatarRelogio(segundosRestantes(relogio, agora))}
        </span>
      )}
    </span>
  )
}
