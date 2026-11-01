import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import type { Cadeira, Partida } from '../../logica/partida'
import { origemDaPartida, partidasDoHistorico } from '../../logica/ranking'
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

  const nomeDoId = (id: string) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : '—'
  }
  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoId(partida.assentos[cadeira].jogadorId)
  const data = (iso: string | undefined) =>
    iso
      ? new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
      : ''
  const rotuloOrigem = (partida: Partida) => t(`match.history.origin.${origemDaPartida(partida)}`)

  if (aberta) {
    return (
      <section className="ptd-inicio ptd-detalhe-historico">
        <TituloTela titulo={data(aberta.finalizadaEm)} aoVoltar={() => setAbertaId(null)} />
        <p className="ptd-apoio">{rotuloOrigem(aberta)}</p>
        <ListaResultado linhas={aberta.resultado ?? []} nomeDe={nomeNa(aberta)} />
        <h3 className="ptd-rotulo">{t('match.hands.title')}</h3>
        <ListaMaos partida={aberta} nomeDe={nomeNa(aberta)} />
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
                <span className="ptd-item-historico-topo">
                  <strong>{data(partida.finalizadaEm)}</strong>
                  <span className="ptd-apoio">{rotuloOrigem(partida)}</span>
                </span>
                <ol className="ptd-placar-historico">
                  {(partida.resultado ?? []).map((linha) => (
                    <li key={linha.cadeira}>
                      <span>
                        {t('match.result.place', { place: linha.colocacao })}{' '}
                        {nomeDoId(linha.jogadorId)}
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
