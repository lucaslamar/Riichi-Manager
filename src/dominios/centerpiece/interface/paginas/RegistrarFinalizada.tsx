import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { ehIos } from '@/compartilhado/adaptadores/instalacao'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import AjudaCampo from '@/compartilhado/interface/componentes/AjudaCampo'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  calcularOka,
  configDoPreset,
  IDS_PRESET,
  type ConfigMesa,
  type IdPreset,
} from '../../logica/configMesa'
import { criarPartidaManual } from '../../logica/partidaManual'
import { umaValida, type UmaMesa } from '../../logica/uma'
import { carregarUltimaConfig } from '../../persistencia/repositorioConfigMesa'
import CampoUma, { CampoInteiro } from '../componentes/CampoUma'
import ListaResultado from '../componentes/ListaResultado'
import { usePartidas } from '../hooks/usePartidas'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
/** O teclado numérico do iPhone não tem a tecla de menos. */
const PRECISA_SINAL = ehIos()
const PONTOS_VALIDOS = /^-?\d+$/

/** Partida jogada fora do app: regras, jogadores, pontos, uma e oka. */
export default function RegistrarFinalizada({
  aoVoltar,
  aoRegistrar,
}: {
  aoVoltar: () => void
  aoRegistrar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { adicionar } = usePartidas()
  const [base, setBase] = useState<ConfigMesa>(() => carregarUltimaConfig(armazenamentoLocal))
  const [assentos, setAssentos] = useState<(string | null)[]>([null, null, null, null])
  const [pontos, setPontos] = useState(['', '', '', ''])
  const [pontosPartida, setPontosPartida] = useState(base.pontosPartida)
  const [pontosRetorno, setPontosRetorno] = useState(base.pontosRetorno)
  const [uma, setUma] = useState<UmaMesa>(base.uma)
  const [escolhendo, setEscolhendo] = useState<number | null>(null)

  const escolherPreset = (preset: string) => {
    if (preset === 'personalizado') {
      setBase({ ...base, preset: 'personalizado' })
      return
    }
    const nova = configDoPreset(preset as IdPreset)
    setBase(nova)
    setPontosPartida(nova.pontosPartida)
    setPontosRetorno(nova.pontosRetorno)
    setUma(nova.uma)
  }

  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : null
  }

  const totalMesa = pontosPartida * 4
  const preenchidos = pontos.filter((texto) => PONTOS_VALIDOS.test(texto))
  const indiceVazio = pontos.findIndex((texto) => texto === '')
  // O último campo vazio fecha a soma sozinho, até a pessoa digitar nele.
  const quanto =
    preenchidos.length === 3 && indiceVazio >= 0
      ? totalMesa - preenchidos.reduce((soma, texto) => soma + Number(texto), 0)
      : null
  const efetivos = pontos.map((texto, indice) =>
    indice === indiceVazio && quanto !== null ? String(quanto) : texto,
  )
  const pontosCompletos = efetivos.every((texto) => PONTOS_VALIDOS.test(texto))
  const pontosNumeros = pontosCompletos ? efetivos.map(Number) : undefined
  const diferenca = pontosNumeros
    ? pontosNumeros.reduce((soma, valor) => soma + valor, 0) - totalMesa
    : 0

  const completo = assentos.every(Boolean) && pontosCompletos && umaValida(uma)

  const previa = useMemo(
    () =>
      completo && pontosNumeros
        ? criarPartidaManual(
            'previa',
            base,
            {
              jogadorIds: assentos as unknown as readonly [string, string, string, string],
              nomes: assentos.map((id) => nomeDe(id) ?? ''),
              pontos: pontosNumeros as unknown as readonly [number, number, number, number],
              pontosPartida,
              pontosRetorno,
              uma,
            },
            new Date().toISOString(),
          )
        : null,
    // A prévia só depende do que foi digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completo, assentos, efetivos.join(), pontosPartida, pontosRetorno, uma, base],
  )

  const nomeDaPrevia = (cadeira: number) => nomeDe(assentos[cadeira]) ?? '—'
  const mudarPontos = (lugar: number, valor: string) =>
    setPontos(pontos.map((atual, indice) => (indice === lugar ? valor : atual)))

  return (
    <section className="ptd-inicio fin-tela">
      <TituloTela titulo={t('match.manual.title')} aoVoltar={aoVoltar} />

      <p className="ptd-rotulo">{t('match.manual.players')}</p>
      <div className="fin-linhas">
        {LUGARES.map((lugar) => {
          const nome = nomeDe(assentos[lugar])
          const rotulo = t('match.manual.points', { name: nome ?? lugar + 1 })
          const preenchidoSozinho = lugar === indiceVazio && quanto !== null
          return (
            <div key={lugar} className="fin-linha">
              <button
                type="button"
                className={`ptd-assento fin-jogador${nome ? ' ptd-assento--ocupado' : ''}`}
                aria-label={nome ?? t('match.manual.choosePlayer', { number: lugar + 1 })}
                onClick={() => setEscolhendo(lugar)}
              >
                {nome ?? t('match.setup.assign')}
              </button>
              <div className="fin-campo">
                <input
                  className="cfg-entrada"
                  type="text"
                  inputMode="decimal"
                  aria-label={rotulo}
                  autoComplete="off"
                  value={pontos[lugar]}
                  placeholder={preenchidoSozinho ? String(quanto) : undefined}
                  onChange={(evento) => {
                    const texto = evento.target.value
                    const limpo = `${texto.trim().startsWith('-') ? '-' : ''}${texto.replace(/\D/g, '')}`
                    mudarPontos(lugar, limpo)
                  }}
                />
                {PRECISA_SINAL && (
                  <button
                    type="button"
                    className="fin-sinal"
                    aria-label={t('match.manual.toggleSign', { field: rotulo })}
                    onClick={() =>
                      mudarPontos(
                        lugar,
                        pontos[lugar].startsWith('-') ? pontos[lugar].slice(1) : `-${pontos[lugar]}`,
                      )
                    }
                  >
                    ±
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {pontosCompletos && diferenca !== 0 && (
        <p className="cfg-aviso fin-aviso-soma" role="status">
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          {t('match.manual.sumWarning', { difference: numero(diferenca), total: numero(totalMesa) })}
        </p>
      )}

      <label className="cfg-campo">
        <span>{t('tableConfig.preset')}</span>
        <select
          className="cfg-entrada"
          value={base.preset}
          onChange={(evento) => escolherPreset(evento.target.value)}
        >
          {IDS_PRESET.map((preset) => (
            <option key={preset} value={preset}>
              {t(`tableConfig.presets.${preset}`)}
            </option>
          ))}
          <option value="personalizado">{t('tableConfig.presets.personalizado')}</option>
        </select>
      </label>

      <div className="cfg-duas-colunas">
        <label className="cfg-campo">
          <span>{t('tableConfig.startPoints')}</span>
          <CampoInteiro
            rotulo={t('tableConfig.startPoints')}
            valor={pontosPartida}
            negativo={false}
            aoMudar={setPontosPartida}
          />
        </label>
        <label className="cfg-campo">
          <span>{t('tableConfig.returnPoints')}</span>
          <CampoInteiro
            rotulo={t('tableConfig.returnPoints')}
            valor={pontosRetorno}
            negativo={false}
            aoMudar={setPontosRetorno}
          />
        </label>
      </div>
      <p className="cfg-ajuda cfg-ajuda--com-botao">
        {t('tableConfig.okaValue', { points: numero(calcularOka({ pontosPartida, pontosRetorno })) })}
        <AjudaCampo rotulo={t('tableConfig.okaLabel')}>
          <p>{t('tableConfig.okaHelp')}</p>
        </AjudaCampo>
      </p>

      <CampoUma
        valor={uma}
        aoMudar={setUma}
        pontosRetorno={pontosRetorno}
        pontosAtuais={pontosNumeros}
      />

      {previa?.resultado && (
        <>
          <p className="ptd-rotulo">{t('match.manual.preview')}</p>
          <ListaResultado linhas={previa.resultado} nomeDe={nomeDaPrevia} />
        </>
      )}

      <button
        type="button"
        className="mesa-btn-principal"
        disabled={!previa}
        onClick={() => {
          if (!previa) return
          adicionar({ ...previa, id: gerarId() })
          aoRegistrar()
        }}
      >
        {t('match.manual.save')}
      </button>

      {escolhendo !== null && (
        <SeletorJogador
          idsEscolhidos={assentos.filter((id): id is string => !!id)}
          aoEscolher={(jogador) => {
            setAssentos(assentos.map((atual, i) => (i === escolhendo ? jogador.id : atual)))
            setEscolhendo(null)
          }}
          aoFechar={() => setEscolhendo(null)}
        />
      )}
    </section>
  )
}
