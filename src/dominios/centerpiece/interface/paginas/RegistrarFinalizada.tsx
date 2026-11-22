import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import CalcularMaoRegistro from '@/dominios/placar-mcr/interface/CalcularMaoRegistro'
import { acoesPlacaresMcr, usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { useRegistroMcr } from '@/dominios/placar-mcr/interface/useRegistroMcr'
import { partidasDoRankingMcr } from '@/dominios/placar-mcr/logica/rankingMcr'
import {
  digitarTotal,
  placarDoRegistro,
  somarMao,
  trocarLugares,
  type RascunhoRegistro,
} from '@/dominios/placar-mcr/logica/registroFinalizado'
import { alterarConfig, type ConfigMesa } from '../../logica/configMesa'
import type { MesaDoSorteio } from '../../logica/encontroClube'
import { KANJI_VENTO, ORDEM_VENTOS, type Cadeira, type Partida } from '../../logica/partida'
import { criarPartidaManual } from '../../logica/partidaManual'
import {
  configBaseDoConjunto,
  regrasDoPreset,
  type ConjuntoRegistro,
  type RegrasPontuacao,
} from '../../logica/regrasPontuacao'
import { mudancaNoRanking } from '../../logica/ranking'
import { umaValida } from '../../logica/uma'
import {
  carregarRegrasRegistro,
  salvarRegrasRegistro,
} from '../../persistencia/repositorioRegrasRegistro'
import { lerPontos } from '../../logica/entradaPontos'
import CalculadoraPontosSheet from '../componentes/CalculadoraPontosSheet'
import AtrasoRegistro from '../componentes/AtrasoRegistro'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import RodapeRegistro from '../componentes/RodapeRegistro'
import CardAssento from '../componentes/CardAssento'
import ConfirmarRegistro from '../componentes/ConfirmarRegistro'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import {
  fechamentoDoRegistro,
  REGRA_SAIDA_PADRAO,
  type RegraSaida,
} from '../../logica/saidaDaPartida'
import type { MudancaRanking } from '../../logica/ranking'
import RegrasPontuacaoRegistro, { useResumo } from '../componentes/RegrasPontuacaoRegistro'
import { assentosDaMesa } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import { usePartidasPausadas } from '../hooks/usePartidasPausadas'
import { useTextoAndamento } from '../hooks/useTextoAndamento'
import FolhaAndamento from '../componentes/FolhaAndamento'
import {
  ANDAMENTO_INICIAL,
  criarPartidaPausada,
  type Andamento,
  type PartidaPausada,
} from '../../logica/partidaPausada'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
/** Campo completo: "-" sozinho (ainda digitando) não conta. Negativos entram na soma. */
const pontosValidos = (texto: string) => lerPontos(texto) !== null

/**
 * Partida jogada fora do app: regras, jogadores, pontos, uma e oka. Com `clube`,
 * vem de uma mesa sorteada: os quatro já preenchidos na ordem dos ventos (convidados
 * pelo nome), as regras de clube e a partida ligada ao encontro. Com `torneio`, os
 * quatro e as regras vêm travados da mesa do torneio (e os pontos, ao corrigir).
 * No modo Chinês é a mesma tela com a regra MCR (soma zero, sem uma nem oka), e o
 * rascunho fica salvo, para ir somando durante a partida.
 */
export default function RegistrarFinalizada({
  aoVoltar,
  aoRegistrar,
  aoVerSalvas,
  retomar,
  clube,
  torneio,
  mesaMcr,
}: {
  aoVoltar: () => void
  aoRegistrar: (id: string) => void
  /** A lista Partidas em andamento. Sem ela, a tela não salva para continuar. */
  aoVerSalvas?: () => void
  /** Abre com tudo o que foi salvo. */
  retomar?: PartidaPausada
  clube?: { mesa: MesaDoSorteio; encontroId: string }
  /** Mesa sorteada do modo Chinês (torneio ou clube), registrada pelos totais. */
  mesaMcr?: {
    /** Chave do rascunho desta mesa. */
    chave: string
    titulo: string
    inicial: RascunhoRegistro
    /** Nomes de quem joga sem cadastro, por id. */
    nomes: Readonly<Record<string, string>>
    /** Torneio: a soma tem que fechar, e a prévia e o ranking são os dele. */
    torneio?: {
      previa: (registro: RascunhoRegistro) => Partida
      mudancas: (previa: Partida) => MudancaRanking[]
    }
    registrar: (registro: RascunhoRegistro) => string
  }
  torneio?: {
    titulo: string
    config: ConfigMesa
    /** O torneio sorteou os ventos. Falso: os lugares não têm vento. */
    comVentos?: boolean
    jogadorIds: readonly [string, string, string, string]
    /** Nomes dos assentos: convidados do torneio não estão no cadastro. */
    nomes?: readonly string[]
    vinculo: NonNullable<Partida['vinculoTorneio']>
    /** Corrigir: os pontos do resultado que já existe. */
    pontosIniciais?: readonly number[]
    /** Corrigir: quem saiu no meio (W.O.). */
    saidasIniciais?: readonly Cadeira[]
    atraso?: {
      limite: number
      porMinuto: number
      /** Por jogador, para trocar de lugar sem perder. */
      iniciais: Readonly<Record<string, number>>
      aplicar: (previa: Partida, minutos: Readonly<Record<string, number>>) => Partida
    }
    /** Como o ranking do torneio fica com este resultado. */
    mudancas: (previa: Partida) => MudancaRanking[]
  }
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const { partidas, adicionar } = usePartidas()
  const chines = useModoJogoAtual() === 'mcr'
  const placaresMcr = usePlacaresMcr()
  const [registro, mudarRegistro, descartarRegistro] = useRegistroMcr(mesaMcr)
  /** Calcular mão do MCR: de quem é a vitória. */
  const [vencedorMao, setVencedorMao] = useState<Cadeira | null>(null)
  const [calculadoraAberta, setCalculadoraAberta] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [regrasAbertas, setRegrasAbertas] = useState(false)
  const resumoRegras = useResumo()
  const textoAndamento = useTextoAndamento()
  const { pausadas, salvar: salvarPausada, descartar: descartarPausada } = usePartidasPausadas()
  // A mesa do clube aberta pelo sorteio também volta como foi salva.
  const [retomada] = useState(
    () =>
      retomar ??
      (clube
        ? pausadas.find(
            ({ encontro }) =>
              encontro?.id === clube.encontroId && encontro.mesa === clube.mesa.numero,
          )
        : undefined),
  )
  const encontro = clube ? { id: clube.encontroId, mesa: clube.mesa.numero } : retomada?.encontro
  const podeSalvar = !!aoVerSalvas && !torneio && !chines
  const [andamento, setAndamento] = useState<Andamento>(() => {
    if (!retomada) return ANDAMENTO_INICIAL
    const { rodada, honba, cadeiraDealer, palitos } = retomada
    return { rodada, honba, cadeiraDealer, palitos }
  })
  /** 'salvar' guarda e sai para a lista, 'editar' só corrige a retomada. */
  const [folhaAndamento, setFolhaAndamento] = useState<'salvar' | 'editar' | null>(null)
  /** As regras como foram salvas, até alguém editar. */
  const [configSalva, setConfigSalva] = useState(retomada?.config)
  // Conjunto de regras: o último usado aqui (mesa do clube sempre começa no Clube).
  const [salvas] = useState(() => carregarRegrasRegistro(armazenamentoLocal))
  const [conjunto, setConjunto] = useState<ConjuntoRegistro>(
    retomada?.conjunto ?? (clube ? 'padrao' : salvas.conjunto),
  )
  const [personalizado, setPersonalizado] = useState(salvas.personalizado)
  const configFixa = torneio?.config ?? configSalva
  const regras = configFixa
    ? {
        pontosPartida: configFixa.pontosPartida,
        pontosRetorno: configFixa.pontosRetorno,
        uma: configFixa.uma,
        tobi: configFixa.tobi,
      }
    : conjunto === 'personalizado' && personalizado
      ? personalizado
      : regrasDoPreset(conjunto === 'personalizado' ? 'padrao' : conjunto)
  const { pontosPartida, pontosRetorno, uma, tobi } = regras
  const [limpando, setLimpando] = useState(false)
  const baseConjunto = configBaseDoConjunto(conjunto)
  // Tipo de partida: o último usado aqui, senão o do conjunto. No torneio vem da mesa.
  const [tipoPartida, setTipoPartida] = useState<ConfigMesa['tipoPartida']>(
    // Padrão: hanchan.
    retomada?.config.tipoPartida ?? salvas.tipoPartida ?? 'hanchan',
  )
  // Torneio e retomada valem com a regra deles, não com a última usada no registro.
  const [regraSaida, setRegraSaida] = useState<RegraSaida>(
    (configFixa ? configFixa.saida : salvas.saida) ?? REGRA_SAIDA_PADRAO,
  )
  const base = configFixa ?? alterarConfig(baseConjunto, { tipoPartida, tobi })
  const guardar = (
    novo: ConjuntoRegistro,
    valores: RegrasPontuacao | null,
    tipo: ConfigMesa['tipoPartida'],
    saida: RegraSaida,
  ) => {
    setConfigSalva(undefined)
    setRegraSaida(saida)
    setConjunto(novo)
    setPersonalizado(valores)
    setTipoPartida(tipo)
    salvarRegrasRegistro(armazenamentoLocal, {
      conjunto: novo,
      personalizado: valores,
      tipoPartida: tipo,
      saida,
    })
  }
  // Convidados do clube: id gerado na hora e o nome escrito na lista.
  const [mesaClube] = useState(() => (clube ? assentosDaMesa(clube.mesa) : null))
  const convidados = new Map(
    retomada
      ? retomada.assentos.map(({ jogadorId, nome }) => [jogadorId ?? '', nome] as const)
      : mesaClube
      ? mesaClube.ids.map((id, indice) => [id, mesaClube.nomes[indice]] as const)
      : torneio?.nomes
        ? torneio.jogadorIds.map((id, indice) => [id, torneio.nomes?.[indice] ?? ''] as const)
        : Object.entries(mesaMcr?.nomes ?? {}),
  )
  // Clube e torneio já vêm do sorteio com os ventos. Avulsa: a pessoa diz se a lista segue a ordem.
  // Padrão: a lista segue Leste, Sul, Oeste, Norte.
  const [ordemEscolhida, setOrdemEscolhida] = useState(retomada?.ordemDosVentos ?? true)
  const ordemDosVentos = torneio ? torneio.comVentos !== false : !!encontro || ordemEscolhida
  const [assentosRiichi, setAssentosRiichi] = useState<(string | null)[]>(() =>
    retomada
      ? retomada.assentos.map((assento) => assento.jogadorId)
      : torneio
        ? [...torneio.jogadorIds]
        : mesaClube
          ? [...mesaClube.ids]
          : [null, null, null, null],
  )
  const [pontosRiichi, setPontos] = useState(() =>
    retomada
      ? retomada.assentos.map((assento) => assento.pontos?.toString() ?? '')
      : torneio?.pontosIniciais
        ? torneio.pontosIniciais.map(String)
        : ['', '', '', ''],
  )
  const assentos = chines ? registro.assentos : assentosRiichi
  const setAssentos = (proximos: (string | null)[]) =>
    chines ? mudarRegistro({ ...registro, assentos: proximos }) : setAssentosRiichi(proximos)
  const pontos = chines
    ? registro.pontos.map((valor) => (valor === null ? '' : String(valor)))
    : pontosRiichi
  const [saidas, setSaidas] = useState<readonly boolean[]>(() =>
    LUGARES.map(
      (lugar) => retomada?.assentos[lugar].saiu ?? !!torneio?.saidasIniciais?.includes(lugar),
    ),
  )
  const [atrasos, setAtrasos] = useState<Readonly<Record<string, number>>>(() => torneio?.atraso?.iniciais ?? {})
  const [escolhendo, setEscolhendo] = useState<number | null>(null)
  /** Torneio: jogador com a calculadora de pontos aberta. */
  const [calculando, setCalculando] = useState<Cadeira | null>(null)

  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    if (jogador) return nomeExibido(jogador)
    return (id && convidados.get(id)) || null
  }

  // No MCR o que um ganha sai dos outros: a mesa soma zero.
  const totalMesa = chines ? 0 : pontosPartida * 4
  const efetivos = pontos
  const pontosCompletos = efetivos.every(pontosValidos)
  const pontosNumeros = pontosCompletos ? efetivos.map((texto) => lerPontos(texto) ?? 0) : undefined
  // A soma fica vermelha enquanto não fecha. No torneio ela tem que fechar, contando os depósitos de riichi que ficaram na mesa.
  const soma = pontos.reduce((total, texto) => total + (lerPontos(texto) ?? 0), 0)
  const fechar = (valor: number, comSaida: boolean) =>
    fechamentoDoRegistro(valor, totalMesa, {
      palitosRestantes: torneio?.config.palitosRestantes ?? 'primeiro',
      comSaida,
      palitosNaMesa: andamento.palitos,
    })
  const cadeirasQueSairam = LUGARES.filter((lugar) => saidas[lugar])
  const fechamento = fechar(soma, cadeirasQueSairam.length > 0)
  const completo =
    assentos.every(Boolean) &&
    pontosCompletos &&
    (chines || umaValida(uma)) &&
    ((!torneio && !mesaMcr?.torneio) || fechamento.fecha)

  const semAtraso = useMemo(
    () =>
      completo && pontosNumeros && !chines
        ? criarPartidaManual(
            'previa',
            { ...base, saida: regraSaida },
            {
              jogadorIds: assentos as unknown as readonly [string, string, string, string],
              nomes: assentos.map((id) => nomeDe(id) ?? ''),
              pontos: pontosNumeros as unknown as readonly [number, number, number, number],
              pontosPartida,
              pontosRetorno,
              uma,
              ordemDosVentos,
              saidas: cadeirasQueSairam,
              // Os sticks salvos só contam se ainda faltam na soma.
              palitos:
                andamento.palitos > 0 && fechamento.depositosNaMesa === andamento.palitos
                  ? andamento.palitos
                  : 0,
            },
            new Date().toISOString(),
          )
        : null,
    // A prévia só depende do que foi digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completo, assentos, efetivos.join(), pontosPartida, pontosRetorno, uma, base, ordemDosVentos, saidas, regraSaida, andamento.palitos],
  )

  const previaMcr =
    chines && completo
      ? (mesaMcr?.torneio?.previa(registro) ??
        partidasDoRankingMcr([placarDoRegistro(registro, 'previa', new Date().toISOString())])[0])
      : null
  const previa = chines
    ? previaMcr
    : semAtraso && torneio?.atraso
      ? torneio.atraso.aplicar(semAtraso, atrasos)
      : semAtraso

  /**
   * Torneio: põe o jogador no lugar e fecha a folha. Se ele já estava na mesa,
   * troca de lugar com quem sai, levando os pontos junto.
   */
  const trocarNoTorneio = (lugar: number, jogadorId: string) => {
    const origem = assentos.indexOf(jogadorId)
    if (chines) {
      mudarRegistro(
        origem >= 0
          ? trocarLugares(registro, lugar as Cadeira, origem as Cadeira)
          : { ...registro, assentos: assentos.map((id, i) => (i === lugar ? jogadorId : id)) },
      )
      setEscolhendo(null)
      return
    }
    const proximos = [...assentos]
    proximos[lugar] = jogadorId
    if (origem >= 0 && origem !== lugar) {
      proximos[origem] = assentos[lugar]
      const pontosTrocados = [...pontos]
      pontosTrocados[lugar] = pontos[origem]
      pontosTrocados[origem] = pontos[lugar]
      setPontos(pontosTrocados)
      // O W.O. anda com a pessoa.
      setSaidas(LUGARES.map((i) => saidas[i === lugar ? origem : i === origem ? lugar : i]))
    } else if (origem < 0) {
      setSaidas(saidas.map((saiu, i) => i !== lugar && saiu))
    }
    setAssentos(proximos)
    setEscolhendo(null)
  }

  /** A soma da mesa com o que está sendo digitado na folha do lugar. */
  const textoDaSoma = (lugar: number, valor: number | null, saiu: boolean) => {
    const somaAgora = soma - (lerPontos(pontos[lugar]) ?? 0) + (valor ?? 0)
    const { fecha } = fechar(somaAgora, saiu || cadeirasQueSairam.some((outro) => outro !== lugar))
    return (
      <span className={fecha ? undefined : 'cpt-soma--erro'}>
        {t('tournament.points.sum', { sum: numero(somaAgora), total: numero(totalMesa) })}
      </span>
    )
  }
  const resumoSaida = [
    t(regraSaida.ficaEmUltimo ? 'match.leftGame.summaryLast' : 'match.leftGame.summaryPoints'),
    regraSaida.penalidade > 0 ? `−${numero(regraSaida.penalidade)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const nomeDaPrevia = (cadeira: number) => nomeDe(assentos[cadeira]) ?? '—'
  const mudarSaida = (lugar: number, saiu: boolean) =>
    setSaidas((atuais) => atuais.map((atual, indice) => (indice === lugar ? saiu : atual)))
  const mudarPontos = (lugar: number, valor: string) =>
    chines
      ? mudarRegistro(digitarTotal(registro, lugar as Cadeira, lerPontos(valor)))
      : setPontos(pontos.map((atual, indice) => (indice === lugar ? valor : atual)))

  const pausar = (novo: Andamento) => {
    setAndamento(novo)
    salvarPausada(
      criarPartidaPausada({
        ...novo,
        id: retomada?.id ?? gerarId(),
        salvaEm: new Date().toISOString(),
        ordemDosVentos,
        conjunto,
        config: { ...base, pontosPartida, pontosRetorno, uma, saida: regraSaida },
        assentos: LUGARES.map((lugar) => ({
          jogadorId: assentos[lugar],
          nome: nomeDe(assentos[lugar]) ?? '',
          pontos: lerPontos(pontos[lugar]),
          saiu: saidas[lugar],
        })),
        ...(encontro ? { encontro } : {}),
      }),
    )
    setFolhaAndamento(null)
    aoVerSalvas?.()
  }

  /** Torneio e mesa sorteada: quem senta vem do sorteio e fica. */
  const lugaresDoSorteio = !!(torneio || encontro || mesaMcr)
  const temAlgo =
    pontos.some(Boolean) ||
    cadeirasQueSairam.length > 0 ||
    Object.values(atrasos).some(Boolean) ||
    (!lugaresDoSorteio && assentos.some(Boolean))
  const limparMesa = () => {
    const vazios = [null, null, null, null]
    if (chines) {
      mudarRegistro({
        ...registro,
        assentos: lugaresDoSorteio ? registro.assentos : vazios,
        pontos: vazios,
      })
    } else {
      if (!lugaresDoSorteio) setAssentosRiichi(vazios)
      setPontos(['', '', '', ''])
      setSaidas([false, false, false, false])
      setAtrasos({})
      setAndamento(ANDAMENTO_INICIAL)
    }
    setLimpando(false)
  }
  const resumoTobi = t(tobi ? 'tableConfig.negative.summaryEnds' : 'tableConfig.negative.summaryGoesOn')
  const negativado = pontos.some((texto) => (lerPontos(texto) ?? 0) < 0)

  const tirarDoLugar = (jogadorId: string) => {
    setAssentos(assentos.map((id) => (id === jogadorId ? null : id)))
    setSaidas(saidas.map((saiu, lugar) => saiu && assentos[lugar] !== jogadorId))
  }

  return (
    // Com a calculadora de mão aberta, a tela some e o título é o dela.
    <section
      className="ptd-inicio fin-tela"
      style={calculadoraAberta ? { display: 'none' } : undefined}
    >
      {!calculadoraAberta && (
        <TituloTela
          titulo={
            mesaMcr
              ? mesaMcr.titulo
              : torneio
              ? torneio.titulo
              : encontro
                ? t('match.table.number', { number: encontro.mesa })
                : t('match.manual.title')
          }
          aoVoltar={aoVoltar}
          acoes={
            // No topo: a barra de baixo só comporta 3 ícones em 320px.
            podeSalvar && !encontro && !retomada && pausadas.length > 0 ? (
              <button
                type="button"
                className="cm-btn-icone fin-topo-salvas"
                aria-label={t('match.paused.listCount', { count: pausadas.length })}
                title={t('match.paused.listCount', { count: pausadas.length })}
                onClick={aoVerSalvas}
              >
                <i className="fas fa-hourglass-half" aria-hidden="true" />
                <span className="rkf-contagem" aria-hidden="true">
                  {numero(pausadas.length)}
                </span>
              </button>
            ) : undefined
          }
        />
      )}

      {podeSalvar && retomada && (
        <button
          type="button"
          className="ptd-resumo-regras"
          aria-haspopup="dialog"
          onClick={() => setFolhaAndamento('editar')}
        >
          <span>
            <strong>{textoAndamento(andamento)}</strong>
            <span className="ptd-apoio">
              {t('match.paused.dealerIs', { name: nomeDaPrevia(andamento.cadeiraDealer) })}
            </span>
          </span>
          <i className="fas fa-pen" aria-hidden="true" />
          <span className="sr-only">{t('match.paused.edit')}</span>
        </button>
      )}
      <>
        {/* Dica no topo. Na retomada a rodada ocupa o lugar dela. */}
        {!retomada && (
          <p className="fin-dica">
            <i className="fas fa-hand-pointer" aria-hidden="true" />
            <span>{t(lugaresDoSorteio ? 'tournament.points.swapHint' : 'match.manual.tapHint')}</span>
          </p>
        )}
        <div className="ptd-assentos trn-mesa-assentos">
          {LUGARES.map((lugar) => {
            const id = assentos[lugar]
            // Avulsa: lugar ainda sem jogador. Tocar escolhe quem senta.
            if (!id) {
              return (
                <CardAssento
                  key={lugar}
                  cadeira={lugar}
                  marca={ordemDosVentos ? undefined : lugar + 1}
                  principal={t('match.setup.assign')}
                  ocupado={false}
                  rotulo={t('match.manual.choosePlayer', { number: lugar + 1 })}
                  aoTocar={() => setEscolhendo(lugar)}
                />
              )
            }
            const cadastrado = jogadores.find((item) => item.id === id)
            const nomes = cadastrado
              ? nomesNoRanking(cadastrado)
              : { principal: nomeDe(id) ?? '—', apoio: undefined }
            const valor = lerPontos(pontos[lugar])
            const vento = ordemDosVentos
              ? t(`winds.${['east', 'south', 'west', 'north'][lugar]}`)
              : String(lugar + 1)
            const nomeFalado = nomes.apoio ?? nomes.principal
            return (
              <CardAssento
                key={lugar}
                cadeira={lugar}
                marca={ordemDosVentos ? undefined : lugar + 1}
                principal={nomes.principal}
                apoio={nomes.apoio}
                ocupado={valor !== null}
                rotulo={
                  valor === null
                    ? t('tournament.points.seatEmpty', { wind: vento, name: nomeFalado })
                    : t(saidas[lugar] ? 'match.leftGame.seat' : 'tournament.points.seatFilled', {
                        wind: vento,
                        name: nomeFalado,
                        points: numero(valor),
                      })
                }
                destaque={
                  saidas[lugar] ? (
                    <span className="ptd-assento-pontos ptd-assento-pontos--wo">
                      {t('match.leftGame.tag')}
                    </span>
                  ) : (
                    <span
                      className={`ptd-assento-pontos${valor === null ? ' ptd-assento-pontos--vazio' : valor < 0 ? ' fin-negativo' : ''}`}
                    >
                      {valor === null ? t('tournament.points.points') : numero(valor)}
                    </span>
                  )
                }
                aoTocar={() => setCalculando(lugar)}
                // Trocar alguém da mesa: toque longo.
                aoTocarLongo={() => setEscolhendo(lugar)}
              />
            )
          })}
        </div>
      </>

      {torneio?.atraso && (
        <AtrasoRegistro
          jogadores={assentos.flatMap((id) => (id ? [{ id, nome: nomeDe(id) ?? '—' }] : []))}
          minutos={atrasos}
          limite={torneio.atraso.limite}
          porMinuto={torneio.atraso.porMinuto}
          aoMudar={(id, minutos) => setAtrasos({ ...atrasos, [id]: minutos })}
        />
      )}

      {/* Só mostra o preset, rente à barra. Quem muda é o ícone de configs dela. */}
      {chines ? (
        <div className="fin-preset">
          <span>
            <strong>{t('placar.mcr.regrasMcr')}</strong>
            <span className="ptd-apoio">{t('placar.mcr.resumoRegras')}</span>
          </span>
        </div>
      ) : torneio ? (
        <div className="fin-preset">
          <span>
            <strong>
              {`${t(base.tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')} · ${t('match.manual.rulesTitle')}`}
            </strong>
            <span className="ptd-apoio">{resumoRegras(regras)}</span>
            <span className="ptd-apoio">{resumoTobi}</span>
            {cadeirasQueSairam.length > 0 && <span className="ptd-apoio">{resumoSaida}</span>}
          </span>
          <span className="sr-only">{t('tournament.tables.rulesLocked')}</span>
        </div>
      ) : (
        <div className="fin-preset">
          <span>
            <strong>
              {`${t(tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')} · ${t(`match.manual.rulesets.${conjunto}`)}`}
            </strong>
            <span className="ptd-apoio">{resumoRegras(regras)}</span>
            <span className="ptd-apoio">{resumoTobi}</span>
            {cadeirasQueSairam.length > 0 && <span className="ptd-apoio">{resumoSaida}</span>}
            {!encontro && (
              <span className="ptd-apoio">
                {`${t('match.manual.windOrder')}: ${t(ordemEscolhida ? 'match.manual.windOrderYes' : 'match.manual.windOrderNo')}`}
              </span>
            )}
          </span>
        </div>
      )}

      {limpando && (
        <ModalConfirmacao
          titulo={t('match.manual.clearTitle')}
          texto={t(lugaresDoSorteio ? 'match.manual.clearHelpSeated' : 'match.manual.clearHelp')}
          rotuloConfirmar={t('match.manual.clear')}
          perigo
          aoFechar={() => setLimpando(false)}
          aoConfirmar={limparMesa}
        />
      )}
      {!torneio && !chines && (
        <RegrasPontuacaoRegistro
          conjunto={conjunto}
          regras={regras}
          pontosAtuais={pontosNumeros}
          editando={regrasAbertas}
          setEditando={setRegrasAbertas}
          opcoes={{
            tipoPartida,
            ordemVentos: encontro ? undefined : ordemEscolhida,
            saida: regraSaida,
          }}
          aoSalvar={(novo, editadas, opcoes) => {
            guardar(
              novo,
              novo === 'personalizado' ? editadas : personalizado,
              opcoes.tipoPartida,
              opcoes.saida,
            )
            if (opcoes.ordemVentos !== undefined) setOrdemEscolhida(opcoes.ordemVentos)
          }}
        />
      )}

      {folhaAndamento && (
        <FolhaAndamento
          titulo={t(folhaAndamento === 'salvar' ? 'match.paused.save' : 'match.paused.edit')}
          inicial={andamento}
          nomes={LUGARES.map(
            (lugar) =>
              nomeDe(assentos[lugar]) ?? t('match.manual.choosePlayer', { number: lugar + 1 }),
          )}
          ordemDosVentos={ordemDosVentos}
          aviso={tobi && negativado ? t('tableConfig.negative.saveWarning') : undefined}
          aoSalvar={(novo) => {
            if (folhaAndamento === 'salvar') return pausar(novo)
            setAndamento(novo)
            setFolhaAndamento(null)
          }}
          aoFechar={() => setFolhaAndamento(null)}
        />
      )}

      {/* O resultado aparece na confirmação, antes de gravar. */}
      <RodapeRegistro
        soma={soma}
        total={totalMesa}
        fechamento={fechamento}
        podeRegistrar={!!previa}
        aoRegistrar={() => setConfirmando(true)}
        salvar={
          podeSalvar
            ? { pode: assentos.some(Boolean), aoTocar: () => setFolhaAndamento('salvar') }
            : undefined
        }
        limpar={{ pode: temAlgo, aoTocar: () => setLimpando(true) }}
        configurar={torneio || chines ? undefined : () => setRegrasAbertas(true)}
      />

      {confirmando && previa?.resultado && (
        <ConfirmarRegistro
          resultado={previa.resultado}
          nomeDe={nomeDaPrevia}
          semUma={chines}
          comPontos={!!mesaMcr?.torneio}
          // Torneio: a mesa vale para o ranking do torneio, não para o geral.
          tituloRanking={
            torneio || mesaMcr?.torneio ? 'tournament.positionChange.confirmTitle' : undefined
          }
          mudancas={
            mesaMcr?.torneio
              ? mesaMcr.torneio.mudancas(previa)
              : torneio
              ? torneio.mudancas(previa)
              : mudancaNoRanking(
                  chines ? partidasDoRankingMcr(placaresMcr) : partidas,
                  previa,
                  new Date(),
                  (id) =>
                  jogadores.some((jogador) => jogador.id === id),
                )
          }
          aoFechar={() => setConfirmando(false)}
          aoConfirmar={() => {
            const id = gerarId()
            if (chines) {
              const registrado = mesaMcr?.registrar(registro) ?? id
              if (!mesaMcr)
                acoesPlacaresMcr.criar(placarDoRegistro(registro, id, new Date().toISOString()))
              descartarRegistro()
              aoRegistrar(registrado)
              return
            }
            adicionar({
              ...previa,
              id,
              ...(encontro ? { encontro } : {}),
              ...(torneio ? { vinculoTorneio: torneio.vinculo } : {}),
            })
            if (retomada) descartarPausada(retomada.id)
            aoRegistrar(id)
          }}
        />
      )}

      {calculando !== null && (
        <CalculadoraPontosSheet
          cadeira={calculando}
          marca={ordemDosVentos ? undefined : calculando + 1}
          nome={(() => {
            const cadastrado = jogadores.find((item) => item.id === assentos[calculando])
            return cadastrado
              ? nomesNoRanking(cadastrado).principal
              : (nomeDe(assentos[calculando]) ?? '')
          })()}
          // Sem pontos o 0 é só placeholder: o primeiro dígito entra direto.
          inicial={lerPontos(pontos[calculando])}
          baseDaConta={torneio ? pontosPartida : undefined}
          textoSoma={(valor, saiu) => textoDaSoma(calculando, valor, saiu)}
          // O W.O. do MCR ainda não tem valores definidos.
          saiu={chines ? undefined : saidas[calculando]}
          aoCalcularMao={
            chines
              ? (valor) => {
                  if (valor !== undefined)
                    mudarPontos(calculando, valor === null ? '' : String(valor))
                  setVencedorMao(calculando)
                  setCalculando(null)
                }
              : undefined
          }
          aoFechar={() => setCalculando(null)}
          aoNavegar={(passo, valor, saiu) => {
            mudarSaida(calculando, saiu)
            if (valor !== undefined) mudarPontos(calculando, valor === null ? '' : String(valor))
            // Próximo lugar com jogador, na ordem dos ventos (dá a volta na mesa).
            const vizinho = [1, 2, 3]
              .map((volta) => (calculando + passo * volta + 4) % 4)
              .find((lugar) => assentos[lugar])
            if (vizinho !== undefined) setCalculando(vizinho as Cadeira)
          }}
          aoConfirmar={(valor, saiu) => {
            mudarSaida(calculando, saiu)
            mudarPontos(calculando, valor === null ? '' : String(valor))
            setCalculando(null)
          }}
        />
      )}

      {vencedorMao !== null && (
        <CalcularMaoRegistro
          vencedor={vencedorMao}
          nomes={LUGARES.map((lugar) => nomeDe(assentos[lugar]) ?? '—')}
          pontos={registro.pontos.map((valor) => valor ?? 0)}
          aoMostrarCalculadora={setCalculadoraAberta}
          aoSomar={(mao) => {
            mudarRegistro(somarMao(registro, mao))
            // Volta para a calculadora dele, já com o total novo.
            setCalculando(vencedorMao)
            setVencedorMao(null)
          }}
          aoFechar={() => {
            setCalculando(vencedorMao)
            setVencedorMao(null)
          }}
        />
      )}

      {escolhendo !== null && (
        <SeletorJogador
          titulo={
            ordemDosVentos
              ? KANJI_VENTO[ORDEM_VENTOS[escolhendo]]
              : t('match.manual.choosePlayer', { number: escolhendo + 1 })
          }
          idsEscolhidos={assentos.filter((id): id is string => !!id)}
          // Em Escolhidos, cada um mostra o vento onde está (sem ordem dos ventos, só "Já escolhido").
          rotuloEscolhido={(jogadorId) => {
            const lugar = assentos.indexOf(jogadorId)
            return ordemDosVentos
              ? t(`winds.${['east', 'south', 'west', 'north'][lugar]}`)
              : t('players.alreadyChosen')
          }}
          // Tocar em quem já foi escolhido tira a pessoa do lugar, como na Nova partida.
          // No torneio a mesa nunca fica com lugar vazio: os dois trocam de lugar.
          aoDesmarcar={(jogadorId) =>
            torneio || mesaMcr
              ? trocarNoTorneio(escolhendo, jogadorId)
              : tirarDoLugar(jogadorId)
          }
          aoEscolher={(jogador) => {
            if (torneio || mesaMcr) {
              trocarNoTorneio(escolhendo, jogador.id)
              return
            }
            const proximos = assentos.map((atual, i) => (i === escolhendo ? jogador.id : atual))
            setAssentos(proximos)
            mudarSaida(escolhendo, false)
            // Como na Nova partida: a folha segue aberta no próximo jogador vazio
            // e só fecha quando os quatro estão escolhidos.
            const seguinte = [1, 2, 3]
              .map((passo) => (escolhendo + passo) % 4)
              .find((lugar) => proximos[lugar] === null)
            setEscolhendo(seguinte ?? null)
            // Mesa completa: já abre a calculadora no primeiro lugar (o Leste), se
            // ninguém lançou pontos ali ainda.
            if (seguinte === undefined && lerPontos(pontos[0]) === null) setCalculando(0)
          }}
          aoFechar={() => setEscolhendo(null)}
        />
      )}
    </section>
  )
}
