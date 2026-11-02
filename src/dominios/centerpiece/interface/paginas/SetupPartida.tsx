import { useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { alterarConfig, type ConfigMesa } from '../../logica/configMesa'
import { CADEIRAS, KANJI_VENTO, ORDEM_VENTOS, sortearAssentos, type Cadeira } from '../../logica/partida'
import { carregarUltimaConfig, salvarUltimaConfig } from '../../persistencia/repositorioConfigMesa'
import ConfigMesaSheet from '../componentes/ConfigMesaSheet'
import ResumoRegrasCalculo from '../componentes/ResumoRegrasCalculo'
import { usePartidas } from '../hooks/usePartidas'

/** Setup: tipo de partida, assentos 2×2, resumo das regras e "Iniciar mesa". */
export default function SetupPartida({
  aoVoltar,
  aoIniciar,
}: {
  aoVoltar: () => void
  aoIniciar: (id: string) => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { criar } = usePartidas()
  const [config, setConfig] = useState<ConfigMesa>(() => carregarUltimaConfig(armazenamentoLocal))
  const [assentos, setAssentos] = useState<(string | null)[]>([null, null, null, null])
  const [escolhendo, setEscolhendo] = useState<Cadeira | null>(null)
  const [regrasAbertas, setRegrasAbertas] = useState(false)

  const preenchidos = assentos.filter((id): id is string => id !== null)
  const completos = preenchidos.length === 4
  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : null
  }

  const iniciar = () => {
    if (!completos) return
    salvarUltimaConfig(armazenamentoLocal, config)
    aoIniciar(
      criar(
        config,
        preenchidos as unknown as readonly [string, string, string, string],
        preenchidos.map((id) => nomeDe(id) ?? ''),
      ),
    )
  }

  return (
    <section className="ptd-setup">
      <TituloTela titulo={t('match.setup.title')} aoVoltar={aoVoltar} />

      <div className="ptd-segmentos" role="group" aria-label={t('tableConfig.gameType')}>
        {(['leste', 'hanchan'] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={`ptd-segmento${config.tipoPartida === tipo ? ' ptd-segmento--ativo' : ''}`}
            aria-pressed={config.tipoPartida === tipo}
            onClick={() => {
              if (config.tipoPartida !== tipo) setConfig(alterarConfig(config, { tipoPartida: tipo }))
            }}
          >
            {t(tipo === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')}
          </button>
        ))}
      </div>

      <div className="ptd-assentos">
        {CADEIRAS.map((cadeira) => {
          const nome = nomeDe(assentos[cadeira])
          const vento = t(`winds.${['east', 'south', 'west', 'north'][cadeira]}`)
          return (
            <button
              key={cadeira}
              type="button"
              className={`ptd-assento${nome ? ' ptd-assento--ocupado' : ''}`}
              aria-label={t(nome ? 'match.setup.seatFilled' : 'match.setup.seatEmpty', {
                wind: vento,
                name: nome ?? '',
              })}
              onClick={() => setEscolhendo(cadeira)}
            >
              <span className="ptd-assento-kanji" aria-hidden="true">
                {KANJI_VENTO[ORDEM_VENTOS[cadeira]]}
              </span>
              <span>{nome ?? t('match.setup.assign')}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="btn-contorno ptd-btn-largo"
        disabled={!completos}
        onClick={() => setAssentos(sortearAssentos(assentos, Math.random))}
      >
        <i className="fas fa-shuffle" aria-hidden="true" />
        {t('match.setup.randomSeats')}
      </button>

      <button type="button" className="ptd-resumo-regras" onClick={() => setRegrasAbertas(true)}>
        <span>
          <strong>{t(`tableConfig.presets.${config.preset}`)}</strong>
          <span className="ptd-apoio">
            {t('match.setup.rulesSummary', {
              start: numero(config.pontosPartida),
              target: numero(config.pontosRetorno),
              uma:
                config.uma.tipo === 'fixa'
                  ? config.uma.valores.slice(0, 2).join('/')
                  : t('tableConfig.umaFloating'),
            })}
          </span>
          <ResumoRegrasCalculo regras={config.regrasCalculo} className="ptd-apoio" />
        </span>
        <i className="fas fa-wrench" aria-hidden="true" />
        <span className="sr-only">{t('tableConfig.title')}</span>
      </button>

      <div className="ptd-rodape-fixo">
        <button type="button" className="btn-primario ptd-btn-largo" disabled={!completos} onClick={iniciar}>
          {t('match.setup.start')}
        </button>
      </div>

      {escolhendo !== null && (
        <SeletorJogador
          titulo={KANJI_VENTO[ORDEM_VENTOS[escolhendo]]}
          idsEscolhidos={preenchidos.filter((id) => id !== assentos[escolhendo])}
          aoFechar={() => setEscolhendo(null)}
          aoEscolher={(jogador) => {
            setAssentos((atuais) =>
              atuais.map((id, indice) => (indice === escolhendo ? jogador.id : id)),
            )
            setEscolhendo(null)
          }}
        />
      )}

      {regrasAbertas && (
        <ConfigMesaSheet
          inicial={config}
          aoFechar={() => setRegrasAbertas(false)}
          aoConcluir={(nova) => {
            setConfig(nova)
            setRegrasAbertas(false)
          }}
        />
      )}
    </section>
  )
}
