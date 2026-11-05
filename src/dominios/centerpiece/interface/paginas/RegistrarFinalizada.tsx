import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  configDoPreset,
  IDS_PRESET,
  type ConfigMesa,
  type IdPreset,
} from '../../logica/configMesa'
import type { MesaDoSorteio } from '../../logica/encontroClube'
import { criarPartidaManual } from '../../logica/partidaManual'
import { umaValida, type UmaMesa } from '../../logica/uma'
import { carregarUltimaConfig } from '../../persistencia/repositorioConfigMesa'
import CampoUma, { CampoInteiro, TECLADO_COM_SINAL } from '../componentes/CampoUma'
import EscolhaOka from '../componentes/EscolhaOka'
import ListaResultado from '../componentes/ListaResultado'
import { assentosDaMesa, configDoClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
const PONTOS_VALIDOS = /^-?\d+$/

/**
 * Ponto e vírgula são separadores de milhar (22.300 ou 22,300): saem antes da conta.
 * Pontos de mesa são sempre inteiros, então não há casa decimal para confundir.
 */
const semSeparadores = (texto: string) => texto.replace(/[.,]/g, '')
const pontosValidos = (texto: string) => PONTOS_VALIDOS.test(semSeparadores(texto))

/**
 * Partida jogada fora do app: regras, jogadores, pontos, uma e oka. Com `clube`,
 * vem de uma mesa sorteada: os quatro já preenchidos na ordem dos ventos (convidados
 * pelo nome), as regras de clube e a partida ligada ao encontro.
 */
export default function RegistrarFinalizada({
  aoVoltar,
  aoRegistrar,
  clube,
}: {
  aoVoltar: () => void
  aoRegistrar: (id: string) => void
  clube?: { mesa: MesaDoSorteio; encontroId: string }
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { adicionar } = usePartidas()
  const [base, setBase] = useState<ConfigMesa>(() =>
    clube ? configDoClube() : carregarUltimaConfig(armazenamentoLocal),
  )
  // Convidados do clube: id gerado na hora e o nome escrito na lista.
  const [mesaClube] = useState(() => (clube ? assentosDaMesa(clube.mesa) : null))
  const convidados = new Map(
    mesaClube ? mesaClube.ids.map((id, indice) => [id, mesaClube.nomes[indice]] as const) : [],
  )
  const [assentos, setAssentos] = useState<(string | null)[]>(() =>
    mesaClube ? [...mesaClube.ids] : [null, null, null, null],
  )
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
    if (jogador) return nomeExibido(jogador)
    return (id && convidados.get(id)) || null
  }

  const totalMesa = pontosPartida * 4
  const preenchidos = pontos.filter(pontosValidos)
  const indiceVazio = pontos.findIndex((texto) => texto === '')
  // O último campo vazio fecha a soma sozinho, até a pessoa digitar nele.
  const quanto =
    preenchidos.length === 3 && indiceVazio >= 0
      ? totalMesa - preenchidos.reduce((soma, texto) => soma + Number(semSeparadores(texto)), 0)
      : null
  const efetivos = pontos.map((texto, indice) =>
    indice === indiceVazio && quanto !== null ? String(quanto) : texto,
  )
  const pontosCompletos = efetivos.every(pontosValidos)
  const pontosNumeros = pontosCompletos
    ? efetivos.map((texto) => Number(semSeparadores(texto)))
    : undefined
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
      <TituloTela
        titulo={clube ? t('match.table.number', { number: clube.mesa.numero }) : t('match.manual.title')}
        aoVoltar={aoVoltar}
      />

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
                  inputMode={TECLADO_COM_SINAL}
                  aria-label={rotulo}
                  autoComplete="off"
                  value={pontos[lugar]}
                  placeholder={preenchidoSozinho ? numero(quanto ?? 0) : undefined}
                  onChange={(evento) => {
                    const texto = evento.target.value
                    // Números, ponto e vírgula (milhar) e o menos só no começo.
                    const limpo = `${texto.trim().startsWith('-') ? '-' : ''}${texto.replace(/[^\d.,]/g, '')}`
                    mudarPontos(lugar, limpo)
                  }}
                />
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
            // Sem oka, o retorno acompanha a partida.
            aoMudar={(novo) => {
              if (pontosRetorno <= pontosPartida) setPontosRetorno(novo)
              setPontosPartida(novo)
            }}
          />
        </label>
        {pontosRetorno > pontosPartida && (
          <label className="cfg-campo">
            <span>{t('tableConfig.returnPoints')}</span>
            <CampoInteiro
              rotulo={t('tableConfig.returnPoints')}
              valor={pontosRetorno}
              negativo={false}
              aoMudar={setPontosRetorno}
            />
          </label>
        )}
      </div>
      <EscolhaOka
        pontosPartida={pontosPartida}
        pontosRetorno={pontosRetorno}
        aoMudarRetorno={setPontosRetorno}
      />

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
          const id = gerarId()
          adicionar({
            ...previa,
            id,
            ...(clube ? { encontro: { id: clube.encontroId, mesa: clube.mesa.numero } } : {}),
          })
          aoRegistrar(id)
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
