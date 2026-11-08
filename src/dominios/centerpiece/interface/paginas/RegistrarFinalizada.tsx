import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import type { ConfigMesa } from '../../logica/configMesa'
import type { MesaDoSorteio } from '../../logica/encontroClube'
import type { Partida } from '../../logica/partida'
import { criarPartidaManual } from '../../logica/partidaManual'
import {
  configBaseDoConjunto,
  regrasDoPreset,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../../logica/regrasPontuacao'
import { umaValida } from '../../logica/uma'
import { carregarRegrasRegistro, salvarRegrasRegistro } from '../../persistencia/repositorioRegrasRegistro'
import { TECLADO_COM_SINAL } from '../componentes/CampoUma'
import ListaResultado from '../componentes/ListaResultado'
import RegrasPontuacaoRegistro from '../componentes/RegrasPontuacaoRegistro'
import { assentosDaMesa } from '../hooks/useClube'
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
 * pelo nome), as regras de clube e a partida ligada ao encontro. Com `torneio`, os
 * quatro e as regras vêm travados da mesa do torneio (e os pontos, ao corrigir).
 */
export default function RegistrarFinalizada({
  aoVoltar,
  aoRegistrar,
  clube,
  torneio,
}: {
  aoVoltar: () => void
  aoRegistrar: (id: string) => void
  clube?: { mesa: MesaDoSorteio; encontroId: string }
  torneio?: {
    titulo: string
    config: ConfigMesa
    jogadorIds: readonly [string, string, string, string]
    /** Nomes dos assentos: convidados do torneio não estão no cadastro. */
    nomes?: readonly string[]
    vinculo: NonNullable<Partida['vinculoTorneio']>
    /** Corrigir: os pontos do resultado que já existe. */
    pontosIniciais?: readonly number[]
  }
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { adicionar } = usePartidas()
  // Conjunto de regras: o último usado aqui (mesa do clube sempre começa no Clube).
  const [salvas] = useState(() => carregarRegrasRegistro(armazenamentoLocal))
  const [conjunto, setConjunto] = useState<ConjuntoRegistro>(clube ? 'padrao' : salvas.conjunto)
  const [personalizado, setPersonalizado] = useState(salvas.personalizado)
  const regras = torneio
    ? {
        pontosPartida: torneio.config.pontosPartida,
        pontosRetorno: torneio.config.pontosRetorno,
        uma: torneio.config.uma,
      }
    : conjunto === 'personalizado' && personalizado
      ? personalizado
      : regrasDoPreset(conjunto === 'personalizado' ? 'padrao' : conjunto)
  const { pontosPartida, pontosRetorno, uma } = regras
  const base = torneio?.config ?? configBaseDoConjunto(conjunto)
  const guardar = (novo: ConjuntoRegistro, valores: RegrasPontuacao | null) => {
    setConjunto(novo)
    setPersonalizado(valores)
    salvarRegrasRegistro(armazenamentoLocal, { conjunto: novo, personalizado: valores })
  }
  // Convidados do clube: id gerado na hora e o nome escrito na lista.
  const [mesaClube] = useState(() => (clube ? assentosDaMesa(clube.mesa) : null))
  const convidados = new Map(
    mesaClube
      ? mesaClube.ids.map((id, indice) => [id, mesaClube.nomes[indice]] as const)
      : torneio?.nomes
        ? torneio.jogadorIds.map((id, indice) => [id, torneio.nomes?.[indice] ?? ''] as const)
        : [],
  )
  const [assentos, setAssentos] = useState<(string | null)[]>(() =>
    torneio ? [...torneio.jogadorIds] : mesaClube ? [...mesaClube.ids] : [null, null, null, null],
  )
  const [pontos, setPontos] = useState(() =>
    torneio?.pontosIniciais ? torneio.pontosIniciais.map(String) : ['', '', '', ''],
  )
  const [escolhendo, setEscolhendo] = useState<number | null>(null)

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
        titulo={
          torneio
            ? torneio.titulo
            : clube
              ? t('match.table.number', { number: clube.mesa.numero })
              : t('match.manual.title')
        }
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
                // Mesa do torneio: os quatro vêm do sorteio e não mudam aqui.
                disabled={!!torneio}
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

      {torneio ? (
        <p className="cfg-ajuda">{t('tournament.tables.rulesLocked')}</p>
      ) : (
      <RegrasPontuacaoRegistro
        conjunto={conjunto}
        regras={regras}
        pontosAtuais={pontosNumeros}
        aoSalvar={(novo, editadas) => guardar(novo, novo === 'personalizado' ? editadas : personalizado)}
      />
      )}

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
            ...(torneio ? { vinculoTorneio: torneio.vinculo } : {}),
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
