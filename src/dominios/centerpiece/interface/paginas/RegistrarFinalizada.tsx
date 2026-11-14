import { useMemo, useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { armazenamentoLocal } from '@/compartilhado/persistencia/armazenamento'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
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
import { fecharPontos, formatarPontos, lerPontos, limparPontos } from '../../logica/entradaPontos'
import { PROPS_TECLADO_COM_SINAL } from '../componentes/CampoUma'
import CalculadoraPontosSheet from '../componentes/CalculadoraPontosSheet'
import CardAssento from '../componentes/CardAssento'
import ConfirmarRegistro from '../componentes/ConfirmarRegistro'
import { nomesNoRanking } from '../componentes/nomesNoRanking'
import { somaFecha } from '../../logica/expressaoPontos'
import RegrasPontuacaoRegistro from '../componentes/RegrasPontuacaoRegistro'
import { assentosDaMesa } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import '../config-mesa.css'

const LUGARES = [0, 1, 2, 3] as const
/** Campo completo: "-" sozinho (ainda digitando) não conta. Negativos entram na soma. */
const pontosValidos = (texto: string) => lerPontos(texto) !== null
const semSeparadores = limparPontos

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
  const { t, numero, idioma } = useI18n()
  /** Campo em edição: mostra o número cru. Fora de foco, com separador de milhar. */
  const [focado, setFocado] = useState<number | null>(null)
  const { jogadores } = useJogadores()
  const { partidas, adicionar } = usePartidas()
  const [confirmando, setConfirmando] = useState(false)
  const [regrasAbertas, setRegrasAbertas] = useState(false)
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
    salvas.tipoPartida ?? baseConjunto.tipoPartida,
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
  const [ordemEscolhida, setOrdemEscolhida] = useState(false)
  const ordemDosVentos = !!torneio || !!mesaClube || ordemEscolhida
  const [assentos, setAssentos] = useState<(string | null)[]>(() =>
    torneio ? [...torneio.jogadorIds] : mesaClube ? [...mesaClube.ids] : [null, null, null, null],
  )
  const [pontos, setPontos] = useState(() =>
    torneio?.pontosIniciais ? torneio.pontosIniciais.map(String) : ['', '', '', ''],
  )
  const [escolhendo, setEscolhendo] = useState<number | null>(null)
  /** Torneio: jogador com a calculadora de pontos aberta. */
  const [calculando, setCalculando] = useState<Cadeira | null>(null)

  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    if (jogador) return nomeExibido(jogador)
    return (id && convidados.get(id)) || null
  }

  const totalMesa = pontosPartida * 4
  const preenchidos = pontos.filter(pontosValidos)
  const indiceVazio = pontos.findIndex((texto) => texto === '')
  // O último campo vazio fecha a soma sozinho, até a pessoa digitar nele.
  // No torneio, não: o organizador lança os quatro.
  const quanto =
    !torneio && preenchidos.length === 3 && indiceVazio >= 0
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

  // Torneio: a soma tem que fechar, contando os depósitos de riichi que ficaram na mesa.
  const soma = pontos.reduce((total, texto) => total + (lerPontos(texto) ?? 0), 0)
  const fechamento = somaFecha(soma, totalMesa, torneio?.config.palitosRestantes ?? 'primeiro')
  const completo =
    assentos.every(Boolean) && pontosCompletos && umaValida(uma) && (!torneio || fechamento.fecha)

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
              ordemDosVentos,
            },
            new Date().toISOString(),
          )
        : null,
    // A prévia só depende do que foi digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completo, assentos, efetivos.join(), pontosPartida, pontosRetorno, uma, base],
  )

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
        acoes={
          // Regras de pontuação: o ícone de controles, como nas regras da Calculadora.
          torneio ? undefined : (
            <span className="clb-acoes-titulo">
              <button
                type="button"
                className="cm-btn-icone"
                aria-label={t('match.manual.editRules')}
                title={t('match.manual.editRules')}
                aria-haspopup="dialog"
                onClick={() => setRegrasAbertas(true)}
              >
                <i className="fas fa-sliders" aria-hidden="true" />
              </button>
            </span>
          )
        }
      />

      {/* Títulos das seções no estilo do Han e Fu (caixa alta, pequenos). */}
      {!torneio && <p className="fin-titulo fin-titulo-tipo">{t('tableConfig.gameType')}</p>}
      {!torneio && (
        <div className="ptd-segmentos fin-tipo" role="group" aria-label={t('tableConfig.gameType')}>
          {(['leste', 'hanchan'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`ptd-segmento${tipoPartida === tipo ? ' ptd-segmento--ativo' : ''}`}
              aria-pressed={tipoPartida === tipo}
              onClick={() => {
                if (tipoPartida !== tipo) guardar(conjunto, personalizado, tipo)
              }}
            >
              {t(tipo === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')}
            </button>
          ))}
        </div>
      )}

      {!torneio && !mesaClube && (
        <>
          <p className="fin-titulo">{t('match.manual.windOrder')}</p>
          <div
            className="ptd-segmentos fin-tipo"
            role="group"
            aria-label={t('match.manual.windOrder')}
          >
            {([true, false] as const).map((opcao) => (
              <button
                key={String(opcao)}
                type="button"
                className={`ptd-segmento${ordemEscolhida === opcao ? ' ptd-segmento--ativo' : ''}`}
                aria-pressed={ordemEscolhida === opcao}
                onClick={() => setOrdemEscolhida(opcao)}
              >
                {t(opcao ? 'match.manual.windOrderYes' : 'match.manual.windOrderNo')}
              </button>
            ))}
          </div>
          <p className="fin-ajuda-ventos">{t('match.manual.windOrderHelp')}</p>
        </>
      )}

      {torneio && (
        <>
          <div className="ptd-assentos trn-mesa-assentos">
            {LUGARES.map((lugar) => {
              const id = assentos[lugar]
              const cadastrado = jogadores.find((item) => item.id === id)
              const nomes = cadastrado
                ? nomesNoRanking(cadastrado)
                : { principal: nomeDe(id) ?? '—', apoio: undefined }
              const valor = lerPontos(pontos[lugar])
              const vento = t(`winds.${['east', 'south', 'west', 'north'][lugar]}`)
              const nomeFalado = nomes.apoio ?? nomes.principal
              return (
                <CardAssento
                  key={lugar}
                  cadeira={lugar}
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
          <p className="cfg-ajuda">{t('tournament.points.swapHint')}</p>
        </>
      )}

      {!torneio && <p className="fin-titulo fin-titulo-jogadores">{t('match.manual.players')}</p>}
      {!torneio && (
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
                  {ordemDosVentos && (
                    <span className="ptd-assento-kanji" aria-hidden="true">
                      {KANJI_VENTO[ORDEM_VENTOS[lugar]]}
                    </span>
                  )}
                  {nome ?? t('match.setup.assign')}
                </button>
                <div className="fin-campo">
                  <input
                    className={`cfg-entrada${pontos[lugar].startsWith('-') ? ' fin-negativo' : ''}`}
                    // Teclado com a tecla "-" (no Android, o de telefone).
                    {...PROPS_TECLADO_COM_SINAL}
                    aria-label={rotulo}
                    autoComplete="off"
                    value={focado === lugar ? pontos[lugar] : formatarPontos(pontos[lugar], idioma)}
                    placeholder={preenchidoSozinho ? numero(quanto ?? 0) : undefined}
                    onFocus={() => setFocado(lugar)}
                    onBlur={() => {
                      setFocado(null)
                      mudarPontos(lugar, fecharPontos(pontos[lugar]))
                    }}
                    onChange={(evento) => mudarPontos(lugar, limparPontos(evento.target.value))}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!torneio && pontosCompletos && diferenca !== 0 && (
        <p className="cfg-aviso fin-aviso-soma" role="status">
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          {t('match.manual.sumWarning', {
            difference: numero(diferenca),
            total: numero(totalMesa),
          })}
        </p>
      )}

      {torneio ? (
        <p className="cfg-ajuda">{t('tournament.tables.rulesLocked')}</p>
      ) : (
        <RegrasPontuacaoRegistro
          conjunto={conjunto}
          regras={regras}
          pontosAtuais={pontosNumeros}
          editando={regrasAbertas}
          setEditando={setRegrasAbertas}
          aoSalvar={(novo, editadas) =>
            guardar(novo, novo === 'personalizado' ? editadas : personalizado)
          }
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
          // Torneio: a mesa vale para o ranking do torneio, não para o geral.
          mudancas={
            torneio
              ? []
              : mudancaNoRanking(partidas, previa, new Date(), (id) =>
                  jogadores.some((jogador) => jogador.id === id),
                )
          }
          aoFechar={() => setConfirmando(false)}
          aoConfirmar={() => {
            const id = gerarId()
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
          nome={(() => {
            const cadastrado = jogadores.find((item) => item.id === assentos[calculando])
            return cadastrado
              ? nomesNoRanking(cadastrado).principal
              : (nomeDe(assentos[calculando]) ?? '')
          })()}
          inicial={lerPontos(pontos[calculando]) ?? pontosPartida}
          aoFechar={() => setCalculando(null)}
          aoConfirmar={(valor) => {
            mudarPontos(calculando, valor === null ? '' : String(valor))
            setCalculando(null)
          }}
        />
      )}

      {escolhendo !== null && (
        <SeletorJogador
          titulo={
            torneio
              ? KANJI_VENTO[ORDEM_VENTOS[escolhendo]]
              : t('match.manual.choosePlayer', { number: escolhendo + 1 })
          }
          idsEscolhidos={assentos.filter((id): id is string => !!id)}
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
          }}
          aoFechar={() => setEscolhendo(null)}
        />
      )}
    </section>
  )
}
