import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { useModoJogoAtual } from '@/compartilhado/modo-jogo/ModoJogoProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import SumulaMcr from '@/dominios/placar-mcr/interface/SumulaMcr'
import { acoesPlacaresMcr, usePlacaresMcr } from '@/dominios/placar-mcr/interface/usePlacaresMcr'
import { useSumulaMcr } from '@/dominios/placar-mcr/interface/useSumulaMcr'
import { TOTAL_MAOS } from '@/dominios/placar-mcr/logica/placar'
import { partidasDoRankingMcr } from '@/dominios/placar-mcr/logica/rankingMcr'
import {
  digitarTotal,
  placarDaSumula,
  pontosDaSumula,
  SUMULA_VAZIA,
} from '@/dominios/placar-mcr/logica/sumula'
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
import CardAssento from '../componentes/CardAssento'
import ConfirmarRegistro from '../componentes/ConfirmarRegistro'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import { somaFecha } from '../../logica/expressaoPontos'
import type { MudancaRanking } from '../../logica/ranking'
import RegrasPontuacaoRegistro, { useResumo } from '../componentes/RegrasPontuacaoRegistro'
import { assentosDaMesa } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
/** Campo completo: "-" sozinho (ainda digitando) não conta. Negativos entram na soma. */
const pontosValidos = (texto: string) => lerPontos(texto) !== null

/**
 * Partida jogada fora do app: regras, jogadores, pontos, uma e oka. Com `clube`,
 * vem de uma mesa sorteada: os quatro já preenchidos na ordem dos ventos (convidados
 * pelo nome), as regras de clube e a partida ligada ao encontro. Com `torneio`, os
 * quatro e as regras vêm travados da mesa do torneio (e os pontos, ao corrigir).
 * No modo Chinês é a mesma tela com a regra MCR (soma zero, sem uma nem oka) e a
 * súmula, que também guarda quem senta e os totais.
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
    /** O torneio sorteou os ventos. Falso: os lugares não têm vento. */
    comVentos?: boolean
    jogadorIds: readonly [string, string, string, string]
    /** Nomes dos assentos: convidados do torneio não estão no cadastro. */
    nomes?: readonly string[]
    vinculo: NonNullable<Partida['vinculoTorneio']>
    /** Corrigir: os pontos do resultado que já existe. */
    pontosIniciais?: readonly number[]
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
  const [sumula, mudarSumula] = useSumulaMcr()
  /** Súmula aberta, com o vencedor quando veio do Calcular mão dele. */
  const [sumulaAberta, setSumulaAberta] = useState<{ vencedor?: Cadeira } | null>(null)
  const [calculadoraAberta, setCalculadoraAberta] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [regrasAbertas, setRegrasAbertas] = useState(false)
  const resumoRegras = useResumo()
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
  const baseConjunto = configBaseDoConjunto(conjunto)
  // Tipo de partida: o último usado aqui, senão o do conjunto. No torneio vem da mesa.
  const [tipoPartida, setTipoPartida] = useState<ConfigMesa['tipoPartida']>(
    // Padrão: hanchan.
    salvas.tipoPartida ?? 'hanchan',
  )
  const base = torneio?.config ?? alterarConfig(baseConjunto, { tipoPartida })
  const guardar = (
    novo: ConjuntoRegistro,
    valores: RegrasPontuacao | null,
    tipo: ConfigMesa['tipoPartida'] = tipoPartida,
  ) => {
    setConjunto(novo)
    setPersonalizado(valores)
    setTipoPartida(tipo)
    salvarRegrasRegistro(armazenamentoLocal, {
      conjunto: novo,
      personalizado: valores,
      tipoPartida: tipo,
    })
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
  // Clube e torneio já vêm do sorteio com os ventos. Avulsa: a pessoa diz se a lista segue a ordem.
  // Padrão: a lista segue Leste, Sul, Oeste, Norte.
  const [ordemEscolhida, setOrdemEscolhida] = useState(true)
  const ordemDosVentos = torneio ? torneio.comVentos !== false : !!mesaClube || ordemEscolhida
  const [assentosRiichi, setAssentosRiichi] = useState<(string | null)[]>(() =>
    torneio ? [...torneio.jogadorIds] : mesaClube ? [...mesaClube.ids] : [null, null, null, null],
  )
  const [pontosRiichi, setPontos] = useState(() =>
    torneio?.pontosIniciais ? torneio.pontosIniciais.map(String) : ['', '', '', ''],
  )
  const assentos = chines ? sumula.assentos : assentosRiichi
  const setAssentos = (proximos: (string | null)[]) =>
    chines ? mudarSumula({ ...sumula, assentos: proximos }) : setAssentosRiichi(proximos)
  const pontos = chines
    ? pontosDaSumula(sumula).map((valor) => (valor === null ? '' : String(valor)))
    : pontosRiichi
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
  const fechamento = somaFecha(soma, totalMesa, torneio?.config.palitosRestantes ?? 'primeiro')
  const completo =
    assentos.every(Boolean) &&
    pontosCompletos &&
    (chines || umaValida(uma)) &&
    (!torneio || fechamento.fecha)

  const semAtraso = useMemo(
    () =>
      completo && pontosNumeros && !chines
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
              ordemDosVentos,
            },
            new Date().toISOString(),
          )
        : null,
    // A prévia só depende do que foi digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completo, assentos, efetivos.join(), pontosPartida, pontosRetorno, uma, base],
  )

  const previaMcr =
    chines && completo
      ? partidasDoRankingMcr([placarDaSumula(sumula, 'previa', new Date().toISOString())])[0]
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
    const proximos = [...assentos]
    proximos[lugar] = jogadorId
    if (origem >= 0 && origem !== lugar) {
      proximos[origem] = assentos[lugar]
      const pontosTrocados = [...pontos]
      pontosTrocados[lugar] = pontos[origem]
      pontosTrocados[origem] = pontos[lugar]
      setPontos(pontosTrocados)
    }
    setAssentos(proximos)
    setEscolhendo(null)
  }

  const nomeDaPrevia = (cadeira: number) => nomeDe(assentos[cadeira]) ?? '—'
  const mudarPontos = (lugar: number, valor: string) =>
    chines
      ? mudarSumula(digitarTotal(sumula, lugar as Cadeira, lerPontos(valor)))
      : setPontos(pontos.map((atual, indice) => (indice === lugar ? valor : atual)))

  return (
    // Com a calculadora da súmula aberta, a tela some e o título é o dela.
    <section
      className="ptd-inicio fin-tela"
      style={calculadoraAberta ? { display: 'none' } : undefined}
    >
      {!calculadoraAberta && (
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
      )}

      {!torneio && <p className="fin-titulo fin-titulo-jogadores">{t('match.manual.players')}</p>}
      <>
        {/* Dica no topo, numa faixa como o selo de torneio em andamento. */}
        <p className="fin-dica">
          <i className="fas fa-hand-pointer" aria-hidden="true" />
          <span>{t('tournament.points.swapHint')}</span>
        </p>
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
                    : t('tournament.points.seatFilled', {
                        wind: vento,
                        name: nomeFalado,
                        points: numero(valor),
                      })
                }
                destaque={
                  <span
                    className={`ptd-assento-pontos${valor === null ? ' ptd-assento-pontos--vazio' : valor < 0 ? ' fin-negativo' : ''}`}
                  >
                    {valor === null ? t('tournament.points.points') : numero(valor)}
                  </span>
                }
                aoTocar={() => setCalculando(lugar)}
                // Trocar alguém da mesa: toque longo.
                aoTocarLongo={() => setEscolhendo(lugar)}
              />
            )
          })}
        </div>
        <p className={`trn-soma${fechamento.fecha ? '' : ' trn-soma--erro'}`} role="status">
          {t('tournament.points.sum', { sum: numero(soma), total: numero(totalMesa) })}
          {fechamento.depositosNaMesa > 0 && (
            <span className="trn-soma-apoio">
              {t('tournament.points.depositsLeft', { count: fechamento.depositosNaMesa })}
            </span>
          )}
        </p>
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

      {chines && (
        <button
          type="button"
          className="ptd-resumo-regras"
          aria-haspopup="dialog"
          disabled={!assentos.every(Boolean)}
          onClick={() => setSumulaAberta({})}
        >
          <span>
            <strong>{t('placar.mcr.sumula.titulo')}</strong>
            <span className="ptd-apoio">
              {assentos.every(Boolean)
                ? t('placar.mcr.sumula.contagem', {
                    feitas: numero(sumula.maos.length),
                    total: numero(TOTAL_MAOS),
                  })
                : t('placar.mcr.sumula.faltamJogadores')}
            </span>
            <span className="ptd-apoio">{t('placar.mcr.sumula.resumo')}</span>
          </span>
          <i className="fas fa-file-pen" aria-hidden="true" />
        </button>
      )}

      {/* Regras num card, como o resumo da Nova partida. No torneio e no MCR, só leitura. */}
      {chines ? (
        <div className="ptd-resumo-regras fin-regras-travadas">
          <span>
            <strong>{t('placar.mcr.regrasMcr')}</strong>
            <span className="ptd-apoio">{t('placar.mcr.resumoRegras')}</span>
          </span>
          <i className="fas fa-lock" aria-hidden="true" />
        </div>
      ) : torneio ? (
        <div className="ptd-resumo-regras fin-regras-travadas">
          <span>
            <strong>
              {`${t(base.tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')} · ${t('match.manual.rulesTitle')}`}
            </strong>
            <span className="ptd-apoio">{resumoRegras(regras)}</span>
          </span>
          <i className="fas fa-lock" aria-hidden="true" />
          <span className="sr-only">{t('tournament.tables.rulesLocked')}</span>
        </div>
      ) : (
        <button
          type="button"
          className="ptd-resumo-regras"
          aria-haspopup="dialog"
          onClick={() => setRegrasAbertas(true)}
        >
          <span>
            <strong>
              {`${t(tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')} · ${t(`match.manual.rulesets.${conjunto}`)}`}
            </strong>
            <span className="ptd-apoio">{resumoRegras(regras)}</span>
            {!mesaClube && (
              <span className="ptd-apoio">
                {`${t('match.manual.windOrder')}: ${t(ordemEscolhida ? 'match.manual.windOrderYes' : 'match.manual.windOrderNo')}`}
              </span>
            )}
          </span>
          <i className="fas fa-wrench" aria-hidden="true" />
          <span className="sr-only">{t('match.manual.editRules')}</span>
        </button>
      )}
      {!torneio && !chines && (
        <RegrasPontuacaoRegistro
          conjunto={conjunto}
          regras={regras}
          pontosAtuais={pontosNumeros}
          editando={regrasAbertas}
          setEditando={setRegrasAbertas}
          opcoes={{ tipoPartida, ordemVentos: mesaClube ? undefined : ordemEscolhida }}
          aoSalvar={(novo, editadas, opcoes) => {
            guardar(novo, novo === 'personalizado' ? editadas : personalizado, opcoes.tipoPartida)
            if (opcoes.ordemVentos !== undefined) setOrdemEscolhida(opcoes.ordemVentos)
          }}
        />
      )}

      {/* O resultado aparece na confirmação, antes de gravar. */}
      <button
        type="button"
        className="mesa-btn-principal"
        disabled={!previa}
        onClick={() => setConfirmando(true)}
      >
        {t('match.manual.save')}
      </button>

      {confirmando && previa?.resultado && (
        <ConfirmarRegistro
          resultado={previa.resultado}
          nomeDe={nomeDaPrevia}
          semUma={chines}
          // Torneio: a mesa vale para o ranking do torneio, não para o geral.
          tituloRanking={torneio ? 'tournament.positionChange.confirmTitle' : undefined}
          mudancas={
            torneio
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
              acoesPlacaresMcr.criar(placarDaSumula(sumula, id, new Date().toISOString()))
              mudarSumula(SUMULA_VAZIA)
              aoRegistrar(id)
              return
            }
            adicionar({
              ...previa,
              id,
              ...(clube ? { encontro: { id: clube.encontroId, mesa: clube.mesa.numero } } : {}),
              ...(torneio ? { vinculoTorneio: torneio.vinculo } : {}),
            })
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
          // Fora do torneio começa em 0: quem só tem o ponto final digita direto, sem apagar antes.
          inicial={lerPontos(pontos[calculando]) ?? (torneio ? pontosPartida : 0)}
          aoCalcularMao={
            chines
              ? (valor) => {
                  if (valor !== undefined)
                    mudarPontos(calculando, valor === null ? '' : String(valor))
                  setSumulaAberta({ vencedor: calculando })
                  setCalculando(null)
                }
              : undefined
          }
          aoFechar={() => setCalculando(null)}
          aoNavegar={(passo, valor) => {
            if (valor !== undefined) mudarPontos(calculando, valor === null ? '' : String(valor))
            // Próximo lugar com jogador, na ordem dos ventos (dá a volta na mesa).
            const vizinho = [1, 2, 3]
              .map((volta) => (calculando + passo * volta + 4) % 4)
              .find((lugar) => assentos[lugar])
            if (vizinho !== undefined) setCalculando(vizinho as Cadeira)
          }}
          aoConfirmar={(valor) => {
            mudarPontos(calculando, valor === null ? '' : String(valor))
            setCalculando(null)
          }}
        />
      )}

      {sumulaAberta && (
        <SumulaMcr
          sumula={sumula}
          nomes={LUGARES.map((lugar) => nomeDe(assentos[lugar]) ?? '—')}
          vencedorInicial={sumulaAberta.vencedor}
          aoMudar={mudarSumula}
          aoMostrarCalculadora={setCalculadoraAberta}
          aoFechar={() => setSumulaAberta(null)}
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
            torneio
              ? trocarNoTorneio(escolhendo, jogadorId)
              : setAssentos(assentos.map((id) => (id === jogadorId ? null : id)))
          }
          aoEscolher={(jogador) => {
            if (torneio) {
              trocarNoTorneio(escolhendo, jogador.id)
              return
            }
            const proximos = assentos.map((atual, i) => (i === escolhendo ? jogador.id : atual))
            setAssentos(proximos)
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
