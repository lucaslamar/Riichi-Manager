import { useState } from 'react'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import { alterarConfig, type ConfigMesa } from '../../logica/configMesa'
import { CADEIRAS, CADEIRAS_SANMA, KANJI_VENTO, ORDEM_VENTOS, sortearAssentos, type Cadeira } from '../../logica/partida'
import { carregarUltimaConfig, salvarUltimaConfig } from '../../persistencia/repositorioConfigMesa'
import ConfigMesaSheet from '../componentes/ConfigMesaSheet'
import ResumoRegrasCalculo from '../componentes/ResumoRegrasCalculo'
import { usePartidas } from '../hooks/usePartidas'
import { useConfigSanma } from '@/compartilhado/configuracoes/useConfigSanma'
import { useVarianteModulo } from '@/compartilhado/configuracoes/useVarianteModulo'
import { jogadoresDaVariante, type Variante } from '@/compartilhado/mahjong/variante'

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
  const { regrasSanma } = useConfigSanma()
  const [variante, setVariante] = useVarianteModulo('partida')
  const sanma = variante === 'sanma'
  const lugares = jogadoresDaVariante(variante)
  const cadeiras = sanma ? CADEIRAS_SANMA : CADEIRAS
  // Sanma: pontos de partida e de retorno vêm das Regras de Sanma.
  const configDaMesa: ConfigMesa = sanma
    ? { ...config, pontosPartida: regrasSanma.pontosIniciais, pontosRetorno: regrasSanma.pontosRetorno }
    : config
  const trocarVariante = (nova: Variante) => {
    setVariante(nova)
    // A cadeira do Norte não existe no Sanma: quem estava nela sai.
    if (nova === 'sanma') setAssentos((atuais) => atuais.map((id, indice) => (indice === 3 ? null : id)))
  }

  const preenchidos = cadeiras.map((cadeira) => assentos[cadeira]).filter((id): id is string => id !== null)
  const completos = preenchidos.length === lugares
  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : null
  }

  const iniciar = () => {
    if (!completos) return
    salvarUltimaConfig(armazenamentoLocal, config)
    const ids = (sanma ? [...preenchidos, ''] : preenchidos) as unknown as readonly [string, string, string, string]
    aoIniciar(
      criar(
        configDaMesa,
        ids,
        ids.map((id) => nomeDe(id) ?? ''),
        sanma ? { regras: regrasSanma } : undefined,
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

      <div className={`ptd-assentos${sanma ? ' ptd-assentos--sanma' : ''}`}>
        {cadeiras.map((cadeira) => {
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
        onClick={() =>
          setAssentos(sanma ? [...sortearAssentos(assentos.slice(0, 3), Math.random), null] : sortearAssentos(assentos, Math.random))
        }
      >
        <i className="fas fa-shuffle" aria-hidden="true" />
        {t('match.setup.randomSeats')}
      </button>

      <button type="button" className="ptd-resumo-regras" onClick={() => setRegrasAbertas(true)}>
        <span>
          <strong>
            {sanma && `${t('sanma.variante3')} · `}
            {t(`tableConfig.presets.${config.preset}`)}
          </strong>
          <span className="ptd-apoio">
            {t('match.setup.rulesSummary', {
              start: numero(configDaMesa.pontosPartida),
              target: numero(configDaMesa.pontosRetorno),
              uma: sanma
                ? regrasSanma.uma.slice(0, 2).join('/')
                : config.uma.tipo === 'fixa'
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
            const proximos = assentos.map((id, indice) => (indice === escolhendo ? jogador.id : id))
            setAssentos(proximos)
            // A folha segue aberta no próximo vento vazio (東 → 南 → 西 → 北), e só
            // fecha quando os quatro estão preenchidos.
            const seguinte = Array.from({ length: lugares - 1 }, (_vazio, indice) => indice + 1)
              .map((passo) => ((escolhendo + passo) % lugares) as Cadeira)
              .find((cadeira) => proximos[cadeira] === null)
            setEscolhendo(seguinte ?? null)
          }}
        />
      )}

      {regrasAbertas && (
        <ConfigMesaSheet
          inicial={config}
          variante={variante}
          aoMudarVariante={trocarVariante}
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
