import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import type { Cadeira, Partida } from '../../logica/partida'
import { partidasDoHistorico } from '../../logica/ranking'
import ListaResultado from '../componentes/ListaResultado'
import { ListaMaos } from '../componentes/ModaisPartida'
import { usePartidas } from '../hooks/usePartidas'

/** Partidas finalizadas; abrir uma mostra o resultado e o histórico de mãos. */
export default function PaginaHistorico({ aoVoltar }: { aoVoltar: () => void }) {
  const { t, idioma } = useI18n()
  const { partidas } = usePartidas()
  const { jogadores } = useJogadores()
  const [abertaId, setAbertaId] = useState<string | null>(null)

  const historico = useMemo(() => partidasDoHistorico(partidas), [partidas])
  const aberta = historico.find((partida) => partida.id === abertaId)

  // Quem saiu do cadastro aparece com o nome guardado na partida.
  const nomeNa = (partida: Partida) => (cadeira: Cadeira) => {
    const assento = partida.assentos[cadeira]
    const jogador = jogadores.find((item) => item.id === assento.jogadorId)
    return jogador ? nomeExibido(jogador) : t('players.deletedName', { name: assento.nome ?? '—' })
  }
  const data = (iso: string | undefined) =>
    iso
      ? new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
      : ''

  if (aberta) {
    return (
      <section className="ptd-inicio ptd-detalhe-historico">
        <TituloTela titulo={data(aberta.finalizadaEm)} aoVoltar={() => setAbertaId(null)} />
        <ListaResultado linhas={aberta.resultado ?? []} nomeDe={nomeNa(aberta)} />
        <h3 className="ptd-rotulo">{t('match.hands.title')}</h3>
        {aberta.registradaManual ? (
          <p className="ptd-vazio">{t('match.manual.noHands')}</p>
        ) : (
          <ListaMaos partida={aberta} nomeDe={nomeNa(aberta)} />
        )}
      </section>
    )
  }

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={t('match.home.history')} aoVoltar={aoVoltar} />
      {historico.length === 0 ? (
        <p className="ptd-vazio">{t('match.history.empty')}</p>
      ) : (
        <ul className="ptd-lista-historico">
          {historico.map((partida) => (
            <li key={partida.id}>
              <button
                type="button"
                className="ptd-item-historico"
                onClick={() => setAbertaId(partida.id)}
              >
                <strong>{data(partida.finalizadaEm)}</strong>
                <ol className="ptd-placar-historico">
                  {(partida.resultado ?? []).map((linha) => (
                    <li key={linha.cadeira}>
                      <span>
                        {t('match.result.place', { place: linha.colocacao })}{' '}
                        {nomeNa(partida)(linha.cadeira)}
                      </span>
                      <span className={linha.final < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
                        {linha.final > 0 ? '+' : ''}
                        {new Intl.NumberFormat(idioma).format(linha.final)}
                      </span>
                    </li>
                  ))}
                </ol>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
