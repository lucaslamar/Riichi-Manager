import { useState, type FormEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descartesDe, lerPedrasDescartadas, REGISTRO_VAZIO } from '../../logica/descartes'
import { descreverPedra } from '../../logica/descreverPedras'
import { CADEIRAS, KANJI_VENTO, ventoDaCadeira, type Cadeira, type Partida } from '../../logica/partida'
import { MAXIMO_VENCEDORES } from '../hooks/estadoBatida'
import type { AcoesDescartes } from '../hooks/useDescartes'
import RioPedras from './RioPedras'
import TecladoSoPedras from './TecladoSoPedras'

/** O que aconteceu com o descarte: é o que decide de quem é a vez. */
export type DecisaoDescarte =
  | { tipo: 'nada' }
  | { tipo: 'chamada'; chamada: 'chi' | 'pon' | 'kan'; cadeira: Cadeira; ordem: number }
  | { tipo: 'ron'; cadeiras: Cadeira[]; ordem: number }

type Etapa = 'entrada' | 'pergunta' | 'pon' | 'kan' | 'ron'

/** Rio do jogador e registro do descarte, seguido da pergunta "alguém chamou?". */
export default function ModalDescartes({
  partida,
  cadeira,
  nomeDe,
  acoes,
  rapido = false,
  expirou = false,
  aoPular,
  aoDecidir,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  acoes: AcoesDescartes
  /** "Descarte de Fulano", na hora de passar a vez: tem Pular. */
  rapido?: boolean
  /** O timer zerou: o título avisa, na cor de alerta. */
  expirou?: boolean
  aoPular?: () => void
  aoDecidir: (decisao: DecisaoDescarte) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { lances } = partida.registro ?? REGISTRO_VAZIO
  const { placar, config } = partida

  const [etapa, setEtapa] = useState<Etapa>('entrada')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [riichi, setRiichi] = useState(false)
  const [kakan, setKakan] = useState(false)
  const [vencedores, setVencedores] = useState<Cadeira[]>([])

  const emRiichi = placar.riichi.includes(cadeira)
  const seguinte = ((cadeira + 1) % 4) as Cadeira
  const ultimo = descartesDe(lances, cadeira).pop()
  const maximoRon = MAXIMO_VENCEDORES[config.ronMultiplo]

  const registrarPedras = (pedras: CodigoPedra[]) => {
    setErro(null)
    setTexto('')
    if (kakan) {
      // A pedra acrescentada não passa a vez: quem fez o kan ainda vai descartar.
      pedras.forEach((pedra) => acoes.kakan(cadeira, pedra))
    } else {
      acoes.descartar(cadeira, pedras, riichi)
      setEtapa('pergunta')
    }
    setRiichi(false)
    setKakan(false)
  }

  const registrar = (entrada: string) => {
    const leitura = lerPedrasDescartadas(entrada, lances)
    if (leitura.erro) setErro(t(leitura.erro.chave, leitura.erro.parametros))
    else registrarPedras(leitura.pedras)
  }

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault()
    registrar(texto)
  }

  const titulo = expirou
    ? t('match.discards.expiredTitle', { name: nomeDe(cadeira) })
    : t(rapido ? 'match.discards.quickTitle' : 'match.discards.title', { name: nomeDe(cadeira) })

  const OutroJogador = ({ outra, aoTocar, ativo }: { outra: Cadeira; aoTocar: () => void; ativo?: boolean }) => (
    <button
      type="button"
      className={`ptd-opcao${ativo ? ' ptd-opcao--ativa' : ''}`}
      aria-pressed={ativo}
      onClick={aoTocar}
    >
      <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(outra, placar.cadeiraDealer)]}</span>
      <span className="ptd-opcao-nome">{nomeDe(outra)}</span>
    </button>
  )
  const outras = CADEIRAS.filter((outra) => outra !== cadeira)

  return (
    <Modal
      titulo={titulo}
      tom={expirou ? 'alerta' : 'padrao'}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="dsc-modal"
      rodape={
        rapido && etapa === 'entrada' ? (
          <div className="ptd-acoes-folha">
            <button type="button" className="btn-contorno" onClick={aoPular}>
              {t('match.discards.skip')}
            </button>
          </div>
        ) : undefined
      }
    >
      <RioPedras lances={lances} cadeira={cadeira} nomeDe={nomeDe} />
      {lances.some((lance) => lance.tipo === 'kakan' && lance.cadeira === cadeira) && (
        <p className="ptd-apoio">
          {t('match.discards.kakan')}:{' '}
          {lances
            .filter((lance) => lance.tipo === 'kakan' && lance.cadeira === cadeira)
            .map((lance) => descreverPedra(lance.pedra, t))
            .join(', ')}
        </p>
      )}

      {etapa === 'entrada' && (
        <form className="dsc-entrada" onSubmit={aoEnviar}>
          <label className="ptd-rotulo" htmlFor="dsc-notacao">
            {t(kakan ? 'match.discards.kakanInput' : 'match.discards.input')}
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
          {erro && (
            <p className="dsc-erro" role="alert">
              {erro}
            </p>
          )}
          <div className="dsc-marcas">
            {!emRiichi && (
              <button
                type="button"
                className={`ptd-opcao${riichi ? ' ptd-opcao--ativa' : ''}`}
                aria-pressed={riichi}
                disabled={kakan}
                onClick={() => setRiichi((atual) => !atual)}
              >
                {t('match.discards.riichi')}
              </button>
            )}
            <button
              type="button"
              className={`ptd-opcao${kakan ? ' ptd-opcao--ativa' : ''}`}
              aria-pressed={kakan}
              disabled={riichi}
              onClick={() => setKakan((atual) => !atual)}
            >
              {t('match.discards.kakan')}
            </button>
          </div>
          <TecladoSoPedras aoEscolher={(pedra) => registrar(pedra)} />
        </form>
      )}

      {etapa === 'pergunta' && ultimo && (
        <div className="dsc-pergunta" role="group" aria-label={t('match.discards.ask')}>
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
          <div className="dsc-pergunta-chamadas">
            <button
              type="button"
              className="mesa-btn-secundario"
              onClick={() =>
                aoDecidir({ tipo: 'chamada', chamada: 'chi', cadeira: seguinte, ordem: ultimo.ordem })
              }
            >
              {t('match.discards.call.chi')}
            </button>
            <button type="button" className="mesa-btn-secundario" onClick={() => setEtapa('pon')}>
              {t('match.discards.call.pon')}
            </button>
            <button type="button" className="mesa-btn-secundario" onClick={() => setEtapa('kan')}>
              {t('match.discards.call.kan')}
            </button>
            <button type="button" className="mesa-btn-secundario" onClick={() => setEtapa('ron')}>
              {t('match.discards.call.ron')}
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
