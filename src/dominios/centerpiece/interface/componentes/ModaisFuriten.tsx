import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import ModalTermo from '@/dominios/calculadora-mao/interface/modais/glossario/ModalTermo'
import { contarSlotsLogicos } from '@/dominios/calculadora-mao/logica/ordenacao'
import { interpretarNotacao, normalizarNotacao } from '@/dominios/calculadora-mao/logica/notacao'
import type { CodigoPedra, Meld } from '@/dominios/calculadora-mao/logica/tipos'
import {
  CHAVE_DESCRICAO_FURITEN,
  descreverEsperas,
  descreverFuriten,
  descreverPedra,
} from '../../logica/descreverPedras'
import { calcularFuriten } from '../../logica/furiten'
import type { Cadeira, Partida } from '../../logica/partida'
import { agruparChamada, esperasDaMao, montarMaoInformada } from '../../logica/registroPartida'
import type { AcoesDescartes } from '../hooks/useDescartes'
import LinhaPedras from './LinhaPedras'
import TecladoSoPedras from './TecladoSoPedras'

const CHAMADAS: Meld['tipo'][] = ['chii', 'pon', 'kanAberto', 'kanFechado']
const DURACAO_AVISO_MS = 6000
const CHAVE_AJUDA = { riichi: 'riichi', descartes: 'discards', temporario: 'temporary' } as const

/** Mão informada pelo próprio jogador; ao salvar, as pedras saem da tela. */
export function ModalChecarFuriten({
  partida,
  cadeira,
  nome,
  acoes,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nome: string
  acoes: AcoesDescartes
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [soltas, setSoltas] = useState<CodigoPedra[]>([])
  const [melds, setMelds] = useState<Meld[]>([])
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salva, setSalva] = useState<CodigoPedra[] | null>(null)

  const slots = contarSlotsLogicos({ pedras: soltas, melds })
  const esperas = useMemo(
    () => (slots === 13 ? esperasDaMao(soltas, melds) : []),
    [slots, soltas, melds],
  )

  const lances = partida.registro?.lances ?? []
  if (salva) {
    const estado = calcularFuriten(lances, cadeira, salva)
    return (
      <Modal
        titulo={t('match.furiten.checkTitle', { name: nome })}
        aoFechar={aoFechar}
        rotuloFechar={t('actions.close')}
        tamanho="pequena"
      >
        <p>{t('match.discards.handWaits', { tiles: descreverEsperas(salva, t) })}</p>
        <p className={estado.principal ? 'dsc-erro' : 'ptd-apoio'} role="status">
          {estado.principal ? descreverFuriten(estado, salva, t) : t('match.furiten.none')}
        </p>
        <p className="ptd-apoio">{t('match.furiten.savedHelp')}</p>
      </Modal>
    )
  }

  const adicionar = (pedras: CodigoPedra[]) => {
    setErro(null)
    setSoltas((atual) => [...atual, ...pedras].slice(0, 14))
  }

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault()
    const leitura = interpretarNotacao(normalizarNotacao(texto), { melds, akadora: true })
    if (leitura.erro) {
      setErro(t(leitura.erro.chave, leitura.erro.parametros))
      return
    }
    adicionar(leitura.pedras)
    setTexto('')
  }

  const salvar = () => {
    acoes.informarMao(cadeira, montarMaoInformada(soltas, melds, esperas))
    setSalva(esperas)
  }

  return (
    <Modal
      titulo={t('match.furiten.checkTitle', { name: nome })}
      subtitulo={t('match.furiten.checkHelp')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      className="dsc-modal"
      rodape={
        <div className="ptd-acoes-folha">
          <button
            type="button"
            className="btn-contorno"
            disabled={soltas.length === 0 && melds.length === 0}
            onClick={() => (soltas.length > 0 ? setSoltas(soltas.slice(0, -1)) : setMelds(melds.slice(0, -1)))}
          >
            {t('match.furiten.removeLast')}
          </button>
          <button type="button" className="btn-primario" disabled={esperas.length === 0} onClick={salvar}>
            {t('match.discards.handSave')}
          </button>
        </div>
      }
    >
      <p className="ptd-rotulo" aria-live="polite">
        {t('match.furiten.counter', { count: slots })}
      </p>
      <LinhaPedras pedras={soltas} melds={melds} />
      {slots === 13 && esperas.length === 0 && (
        <p className="dsc-erro" role="alert">
          {t('match.discards.handNotTenpai')}
        </p>
      )}

      <form className="dsc-entrada" onSubmit={aoEnviar}>
        <label className="ptd-rotulo" htmlFor="fur-notacao">
          {t('match.furiten.input')}
        </label>
        <div className="dsc-entrada-linha">
          <input
            id="fur-notacao"
            className="cfg-entrada"
            value={texto}
            placeholder="123m456p"
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
      </form>

      <p className="ptd-apoio">{t('match.furiten.callsHelp')}</p>
      <div className="dsc-pergunta-chamadas">
        {CHAMADAS.map((tipo) => {
          const grupo = agruparChamada(soltas, tipo)
          return (
            <button
              key={tipo}
              type="button"
              className="mesa-btn-secundario"
              disabled={!grupo}
              onClick={() => {
                if (!grupo) return
                setSoltas(grupo.soltas)
                setMelds([...melds, grupo.meld])
              }}
            >
              {t(`melds.${tipo}`)}
            </button>
          )
        })}
      </div>

      <TecladoSoPedras aoEscolher={(pedra) => adicionar([pedra])} />
    </Modal>
  )
}

/** Só quem toca no ícone do próprio card vê; some sozinho, com a mesa olhando. */
export function ModalAvisoFuriten({
  partida,
  cadeira,
  nomeDe,
  acoes,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: (cadeira: Cadeira) => string
  acoes: AcoesDescartes
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const [glossario, setGlossario] = useState(false)
  const mao = partida.registro?.maos[cadeira]

  useEffect(() => {
    if (glossario) return
    const temporizador = window.setTimeout(aoFechar, DURACAO_AVISO_MS)
    return () => window.clearTimeout(temporizador)
  }, [glossario, aoFechar])

  if (!mao) return null
  const estado = calcularFuriten(partida.registro?.lances ?? [], cadeira, mao.esperas)

  return (
    <Modal
      titulo={t('match.furiten.iconTitle', { name: nomeDe(cadeira) })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => {
              acoes.apagarMao(cadeira)
              aoFechar()
            }}
          >
            {t('match.discards.handClear')}
          </button>
        </div>
      }
    >
      {estado.principal ? (
        <div className="dsc-furiten">
          <p className="dsc-furiten-aviso">{descreverFuriten(estado, mao.esperas, t)}</p>
          <p className="ptd-apoio">{t('match.furiten.canTsumo')}</p>
          <p>{t(`sectionHelp.furiten.${CHAVE_AJUDA[estado.principal]}`)}</p>
          <ul className="ptd-linhas">
            {estado.causas.map((causa) => (
              <li key={`${causa.tipo}-${causa.ordem}`}>
                <span>{t(`${CHAVE_DESCRICAO_FURITEN[causa.tipo]}.title`)}</span>
                <strong>
                  {t('match.furiten.cause', {
                    tile: descreverPedra(causa.pedra, t),
                    order: causa.ordem,
                    name: nomeDe(causa.cadeira),
                  })}
                </strong>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-contorno" onClick={() => setGlossario(true)}>
            {t('match.furiten.glossary')}
          </button>
        </div>
      ) : (
        <p>{t('match.furiten.none')}</p>
      )}
      {glossario && <ModalTermo termo="furiten" aoFechar={() => setGlossario(false)} />}
    </Modal>
  )
}
