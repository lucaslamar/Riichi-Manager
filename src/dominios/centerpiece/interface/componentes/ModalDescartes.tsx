import { useState, type FormEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { PedraSvg } from '@/dominios/calculadora-mao/interface/compartilhado/componentes/PedraSvg'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import {
  descartesDe,
  lerPedrasDescartadas,
  MINIMO_MURO_RIICHI,
  muroPermiteKan,
  muroPermiteRiichi,
  pedrasNaMesa,
  REGISTRO_VAZIO,
  ultimoDescarteDaMao,
} from '../../logica/descartes'
import { descreverPedra } from '../../logica/descreverPedras'
import { cadeirasDaPartida, jogadoresNaMesa, KANJI_VENTO, ventoDaCadeira, type Cadeira, type Partida } from '../../logica/partida'
import { MAXIMO_VENCEDORES } from '../hooks/estadoBatida'
import type { AcoesDescartes } from '../hooks/useDescartes'
import AnelTimer from './AnelTimer'
import BotoesOpcao from './BotoesOpcao'
import RioPedras from './RioPedras'
import TecladoSoPedras from './TecladoSoPedras'

/** O que aconteceu com o descarte: é o que decide de quem é a vez. */
export type DecisaoDescarte =
  | { tipo: 'nada' }
  | { tipo: 'chamada'; chamada: 'chi' | 'pon' | 'kan'; cadeira: Cadeira; ordem: number }
  | { tipo: 'ron'; cadeiras: Cadeira[]; ordem: number }

type Etapa = 'entrada' | 'pergunta' | 'pon' | 'kan' | 'ron'

/**
 * Registro do descarte de quem está na vez, seguido da pergunta "alguém chamou?". O
 * tempo continua correndo, e dá para olhar o rio dos outros antes de escolher.
 */
export default function ModalDescartes({
  partida,
  cadeira,
  nomeDe,
  acoes,
  expirou = false,
  timer,
  aoDecidir,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  acoes: AcoesDescartes
  /** O timer zerou: o título avisa, na cor de alerta. */
  expirou?: boolean
  /** Com o timer ligado, o tempo que resta da vez. */
  timer?: { segundos: number; fracao: number }
  aoDecidir: (decisao: DecisaoDescarte) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { lances } = partida.registro ?? REGISTRO_VAZIO
  const { placar, config } = partida

  const [etapa, setEtapa] = useState<Etapa>('entrada')
  // 'todos': os quatro rios juntos, para ver a mesa inteira de uma vez.
  const [rioVisto, setRioVisto] = useState<Cadeira | 'todos'>(cadeira)
  const kansDe = (dono: Cadeira) =>
    lances
      .filter((lance) => lance.tipo === 'kakan' && lance.cadeira === dono)
      .map(
        (lance) =>
          `${t(lance.tipo === 'kakan' && lance.fechado ? 'match.discards.closedKan' : 'match.discards.kakan')}: ${descreverPedra(lance.pedra, t)}`,
      )
      .join(' · ')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [riichi, setRiichi] = useState(false)
  const [kan, setKan] = useState<'kakan' | 'fechado' | null>(null)
  const [vencedores, setVencedores] = useState<Cadeira[]>([])
  // Descartes que ainda esperam a resposta de "o que aconteceu?".
  const [semResposta, setSemResposta] = useState(0)

  const emRiichi = placar.riichi.includes(cadeira)
  const seguinte = ((cadeira + 1) % jogadoresNaMesa(partida)) as Cadeira
  const ultimo = descartesDe(lances, cadeira).pop()
  const maximoRon = MAXIMO_VENCEDORES[config.ronMultiplo]
  const ultimoDaMao = ultimoDescarteDaMao(lances, jogadoresNaMesa(partida))

  const registrarPedras = (pedras: CodigoPedra[]) => {
    setErro(null)
    setTexto('')
    if (kan) {
      // O kan não passa a vez: quem fez ainda compra a reposição e descarta.
      pedras.forEach((pedra) => acoes.kakan(cadeira, pedra, kan === 'fechado'))
    } else {
      acoes.descartar(cadeira, pedras, riichi)
      setSemResposta(pedras.length)
      setEtapa('pergunta')
    }
    setRiichi(false)
    setKan(null)
  }

  const registrar = (entrada: string) => {
    const leitura = lerPedrasDescartadas(entrada, lances, config.regrasCalculo.akadora)
    if (leitura.erro) setErro(t(leitura.erro.chave, leitura.erro.parametros))
    else registrarPedras(leitura.pedras)
  }

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault()
    registrar(texto)
  }

  /**
   * Fechar sem responder "o que aconteceu?" desfaz o descarte: a vez continua com
   * quem descartou e, ao abrir de novo, a pedra não se repete no rio.
   */
  const fechar = () => {
    if (etapa !== 'entrada' && semResposta > 0) acoes.desfazerUltimos(semResposta)
    aoFechar()
  }

  const titulo = expirou
    ? t('match.discards.expiredTitle', { name: nomeDe(cadeira) })
    : t('match.discards.quickTitle', { name: nomeDe(cadeira) })

  const OutroJogador = ({ outra, aoTocar, ativo }: { outra: Cadeira; aoTocar: () => void; ativo?: boolean }) => (
    <button
      type="button"
      className={`ptd-opcao${ativo ? ' ptd-opcao--ativa' : ''}`}
      aria-pressed={ativo}
      onClick={aoTocar}
    >
      <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(outra, placar.cadeiraDealer, jogadoresNaMesa(partida))]}</span>
      <span className="ptd-opcao-nome">{nomeDe(outra)}</span>
    </button>
  )
  const outras = cadeirasDaPartida(partida).filter((outra) => outra !== cadeira)

  return (
    <Modal
      titulo={titulo}
      tom={expirou ? 'alerta' : 'padrao'}
      aoFechar={fechar}
      rotuloFechar={t('actions.close')}
      className="dsc-modal"
      acoes={
        timer && <AnelTimer segundos={timer.segundos} fracao={timer.fracao} esgotado={timer.segundos === 0} />
      }
    >
      <BotoesOpcao
        rotulo={t('match.discards.rivers')}
        valor={rioVisto}
        aoEscolher={setRioVisto}
        className="dsc-abas"
        opcoes={[
          ...cadeirasDaPartida(partida).map((outra) => ({
            valor: outra,
            // Vento em cima e nome embaixo, igual em todas: cinco abas cabem no celular.
            rotulo: (
              <>
                <span className="dsc-aba-vento">{KANJI_VENTO[ventoDaCadeira(outra, placar.cadeiraDealer, jogadoresNaMesa(partida))]}</span>
                <span className="dsc-aba-nome">{nomeDe(outra)}</span>
              </>
            ),
          })),
          { valor: 'todos' as const, rotulo: t('match.discards.allRivers') },
        ]}
      />
      {rioVisto === 'todos' ? (
        <div className="dsc-rios-todos">
          {cadeirasDaPartida(partida).map((dono) => (
            <section key={dono} className="dsc-rio-de">
              <h3 className="dsc-rio-de-nome">
                <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(dono, placar.cadeiraDealer, jogadoresNaMesa(partida))]}</span>{' '}
                {nomeDe(dono)}
              </h3>
              <RioPedras lances={lances} cadeira={dono} nomeDe={nomeDe} destacarAposRiichi={dono !== cadeira} />
              {kansDe(dono) && <p className="ptd-apoio">{kansDe(dono)}</p>}
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="dsc-rio-visto">
            <RioPedras
              lances={lances}
              cadeira={rioVisto}
              nomeDe={nomeDe}
              destacarAposRiichi={rioVisto !== cadeira}
            />
          </div>
          {kansDe(rioVisto) && <p className="ptd-apoio">{kansDe(rioVisto)}</p>}
        </>
      )}

      {etapa === 'entrada' && (
        <form className="dsc-entrada" onSubmit={aoEnviar}>
          {/* Digitar só compensa com teclado físico; no celular, as pedras bastam. */}
          <div className="dsc-notacao">
          <label className="ptd-rotulo" htmlFor="dsc-notacao">
            {t(kan ? 'match.discards.kakanInput' : 'match.discards.input')}
          </label>
          <div className="dsc-entrada-linha">
            <input
              id="dsc-notacao"
              className="cfg-entrada"
              value={texto}
              placeholder="3m5p1z"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!erro}
              onChange={(evento) => {
                setTexto(evento.target.value)
                setErro(null)
              }}
            />
            <button type="submit" className="btn-primario" disabled={!texto.trim()}>
              {t('match.discards.add')}
            </button>
          </div>
          </div>
          {erro && (
            <p className="dsc-erro" role="alert">
              {erro}
            </p>
          )}
          {/* Mesmos botões do Chi, Pon e Kan da Calculadora de Mão. */}
          <div className="acoes-construtor-mao dsc-marcas">
            {!emRiichi && (
              <button
                type="button"
                className={`btn-acao-mao action-tab dsc-marca-riichi${riichi ? ' active' : ''}`}
                aria-pressed={riichi}
                disabled={kan !== null || !muroPermiteRiichi(lances, jogadoresNaMesa(partida))}
                onClick={() => setRiichi((atual) => !atual)}
              >
                <span>{t('match.discards.riichi')}</span>
              </button>
            )}
            {(['kakan', 'fechado'] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`btn-acao-mao action-tab action-tab--${tipo === 'kakan' ? 'pon' : 'kan-closed'}${
                  kan === tipo ? ' active' : ''
                }`}
                aria-pressed={kan === tipo}
                disabled={riichi || !muroPermiteKan(lances, jogadoresNaMesa(partida))}
                onClick={() => setKan((atual) => (atual === tipo ? null : tipo))}
              >
                <span>{t(tipo === 'kakan' ? 'match.discards.kakan' : 'match.discards.closedKan')}</span>
              </button>
            ))}
          </div>
          {!emRiichi && !muroPermiteRiichi(lances, jogadoresNaMesa(partida)) && (
            <p className="ptd-apoio">{t('match.discards.noRiichiWall', { count: MINIMO_MURO_RIICHI })}</p>
          )}
          <TecladoSoPedras
            regras={config.regrasCalculo}
            vistas={pedrasNaMesa(lances)}
            aoEscolher={(pedra) => registrar(pedra)}
          />
        </form>
      )}

      {etapa === 'pergunta' && ultimo && (
        <div className="dsc-pergunta" role="group" aria-label={t('match.discards.ask')}>
          <span className="chip-pedra dsc-pedra dsc-pedra-destaque" aria-hidden="true">
            <PedraSvg pedra={ultimo.pedra} />
          </span>
          <p className="ptd-rotulo">
            {t('match.discards.askTile', { tile: descreverPedra(ultimo.pedra, t) })}
          </p>
          <button
            type="button"
            className="mesa-btn-principal"
            onClick={() => aoDecidir({ tipo: 'nada' })}
          >
            {t('match.discards.nothing', { name: nomeDe(seguinte) })}
          </button>
          {/* Na ordem de prioridade das chamadas: ron, depois pon e kan, por último chi. */}
          <div className="dsc-pergunta-chamadas">
            <button type="button" className="mesa-btn-secundario" onClick={() => setEtapa('ron')}>
              {t('match.discards.call.ron')}
            </button>
            <button
              type="button"
              className="mesa-btn-secundario"
              disabled={ultimoDaMao}
              onClick={() => setEtapa('pon')}
            >
              {t('match.discards.call.pon')}
            </button>
            <button
              type="button"
              className="mesa-btn-secundario"
              disabled={ultimoDaMao}
              onClick={() => setEtapa('kan')}
            >
              {t('match.discards.call.kan')}
            </button>
            <button
              type="button"
              className="mesa-btn-secundario"
              disabled={ultimoDaMao}
              onClick={() =>
                aoDecidir({ tipo: 'chamada', chamada: 'chi', cadeira: seguinte, ordem: ultimo.ordem })
              }
            >
              {t('match.discards.call.chi')}
            </button>
          </div>
        </div>
      )}

      {(etapa === 'pon' || etapa === 'kan') && ultimo && (
        <div className="dsc-pergunta">
          <p className="ptd-rotulo">{t(`match.discards.whoCalled.${etapa}`)}</p>
          <div className="ptd-lista-opcoes">
            {outras.map((outra) => (
              <OutroJogador
                key={outra}
                outra={outra}
                aoTocar={() =>
                  aoDecidir({ tipo: 'chamada', chamada: etapa, cadeira: outra, ordem: ultimo.ordem })
                }
              />
            ))}
          </div>
          <button type="button" className="btn-contorno" onClick={() => setEtapa('pergunta')}>
            {t('actions.back')}
          </button>
        </div>
      )}

      {etapa === 'ron' && ultimo && (
        <div className="dsc-pergunta">
          <p className="ptd-rotulo">{t('match.discards.whoCalled.ron')}</p>
          <div className="ptd-lista-opcoes">
            {outras.map((outra) => (
              <OutroJogador
                key={outra}
                outra={outra}
                ativo={vencedores.includes(outra)}
                aoTocar={() => {
                  if (maximoRon === 1) {
                    aoDecidir({ tipo: 'ron', cadeiras: [outra], ordem: ultimo.ordem })
                    return
                  }
                  setVencedores((lista) =>
                    lista.includes(outra)
                      ? lista.filter((item) => item !== outra)
                      : lista.length < maximoRon
                        ? [...lista, outra]
                        : lista,
                  )
                }}
              />
            ))}
          </div>
          <div className="ptd-acoes-folha">
            <button type="button" className="btn-contorno" onClick={() => setEtapa('pergunta')}>
              {t('actions.back')}
            </button>
            {maximoRon > 1 && (
              <button
                type="button"
                className="btn-primario"
                disabled={vencedores.length === 0}
                onClick={() => aoDecidir({ tipo: 'ron', cadeiras: vencedores, ordem: ultimo.ordem })}
              >
                {t('match.win.next')}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
