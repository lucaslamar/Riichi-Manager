import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useVoltarPorDeslize } from '@/compartilhado/interface/hooks/voltarInterno'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import EstatisticasJogador from '@/dominios/estatisticas/interface/EstatisticasJogador'
import TextoMao from '@/dominios/estatisticas/interface/TextoMao'
import { useFormatoEstatisticas } from '@/dominios/estatisticas/interface/useFormatoEstatisticas'
import { useVisaoDoEscopo } from '@/dominios/estatisticas/interface/useVisaoDoEscopo'
import { maiorMaoDoEscopo } from '@/dominios/estatisticas/logica/estatisticas'
import type { Torneio } from '../../logica/tipos'
import '@/dominios/estatisticas/interface/estatisticas.css'
import '../torneio.css'

/** Aberta pelo menu ⋮: a maior mão do torneio e, por jogador, o mesmo componente do card. */
export default function PaginaEstatisticasTorneio({
  torneio,
  aoVoltar,
}: {
  torneio: Torneio
  aoVoltar: () => void
}) {
  const { t } = useI18n()
  useVoltarPorDeslize(aoVoltar)
  const { comSinal } = useFormatoEstatisticas()
  const { visao, nome } = useVisaoDoEscopo({ tipo: 'torneio', id: torneio.id })
  const jogaram = visao.linhas.filter((linha) => linha.partidas > 0)
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const maior = maiorMaoDoEscopo(visao.partidas)

  return (
    <section className="ptd-inicio trn-pagina est-pagina">
      <TituloTela titulo={t('stats.tournamentTitle')} aoVoltar={aoVoltar} />
      <p className="ptd-faixa-titulo">
        <i className="fas fa-trophy" aria-hidden="true" />
        <span>{torneio.nome}</span>
      </p>

      {jogaram.length === 0 ? (
        <p className="ptd-vazio">{t('stats.empty')}</p>
      ) : (
        <>
          {maior && (
            <dl className="est-maos est-destaque">
              <div>
                <dt>{t('stats.best.torneio')}</dt>
                <dd>
                  <TextoMao mao={maior} />
                  <small>{nome(maior.jogadorId, maior.nome)}</small>
                </dd>
              </div>
            </dl>
          )}

          <ul className="est-jogadores">
            {jogaram.map((linha) => {
              const aberto = abertoId === linha.jogadorId
              return (
                <li key={linha.jogadorId}>
                  <button
                    type="button"
                    className="est-jogador-topo"
                    aria-expanded={aberto}
                    onClick={() => setAbertoId(aberto ? null : linha.jogadorId)}
                  >
                    <span className="trn-colocacao">
                      {t('tournament.podiumGap.ordinal', { place: linha.posicao })}
                    </span>
                    <strong>{nome(linha.jogadorId)}</strong>
                    <span className={linha.pontos < 0 ? 'trn-negativo' : 'trn-positivo'}>
                      {comSinal(linha.pontos)}
                    </span>
                    <i className="fas fa-chevron-down est-chevron" aria-hidden="true" />
                  </button>
                  {aberto && (
                    <EstatisticasJogador
                      escopo={{ tipo: 'torneio', id: torneio.id }}
                      jogadorId={linha.jogadorId}
                      semMaiorDeTodos
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
