import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  CADEIRAS,
  CHAVE_VENTO,
  diferencasDePontos,
  KANJI_VENTO,
  pagamentosNagashi,
  pagamentosNoten,
  podeDeclararRiichi,
  ventoDaCadeira,
  type Cadeira,
  type EventoPartida,
  type Partida,
  type TipoAbortivo,
} from '../../logica/partida'

/** Nome de cada cadeira, resolvido pela tela a partir do cadastro. */
export type NomeDaCadeira = (cadeira: Cadeira) => string

function useFormato() {
  const { numero } = useI18n()
  return {
    numero,
    comSinal: (valor: number) => (valor > 0 ? `+${numero(valor)}` : numero(valor)),
  }
}

/** Confirmação no lugar de `window.confirm`. */
export function ModalConfirmacao({
  titulo,
  texto,
  rotuloConfirmar,
  perigo = false,
  aoConfirmar,
  aoFechar,
}: {
  titulo: string
  texto: string
  rotuloConfirmar: string
  perigo?: boolean
  aoConfirmar: () => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  return (
    <Modal
      titulo={titulo}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            className={`btn-primario${perigo ? ' ptd-btn-perigo' : ''}`}
            onClick={aoConfirmar}
          >
            {rotuloConfirmar}
          </button>
        </div>
      }
    >
      <p>{texto}</p>
    </Modal>
  )
}

export function MenuJogador({
  partida,
  cadeira,
  nome,
  podeReceberVez,
  aoEscolher,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nome: string
  podeReceberVez: boolean
  aoEscolher: (acao: 'vez' | 'ron' | 'tsumo' | 'riichi' | 'chombo' | 'diferenca') => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { numero } = useFormato()
  const vento = ventoDaCadeira(cadeira, partida.placar.cadeiraDealer)
  const Acao = ({
    acao,
    icone,
    rotulo,
    perigo,
  }: {
    acao: Parameters<typeof aoEscolher>[0]
    icone: string
    rotulo: string
    perigo?: boolean
  }) => (
    <button
      type="button"
      className={`ptd-opcao${perigo ? ' ptd-opcao--perigo' : ''}`}
      onClick={() => aoEscolher(acao)}
    >
      <i className={`fas ${icone}`} aria-hidden="true" />
      {rotulo}
    </button>
  )

  return (
    <Modal
      titulo={`${KANJI_VENTO[vento]} ${nome}`}
      subtitulo={`${t(CHAVE_VENTO[vento])} · ${numero(partida.placar.pontos[cadeira])}`}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha"
    >
      <div className="ptd-lista-opcoes" role="group" aria-label={t('match.menu.actions')}>
        {podeReceberVez && (
          <Acao acao="vez" icone="fa-hand-point-right" rotulo={t('match.menu.hisTurn')} />
        )}
        <Acao acao="ron" icone="fa-trophy" rotulo={t('match.menu.ron')} />
        <Acao acao="tsumo" icone="fa-trophy" rotulo={t('match.menu.tsumo')} />
        {podeDeclararRiichi(partida.placar, cadeira) && (
          <Acao acao="riichi" icone="fa-flag" rotulo={t('match.menu.riichi')} />
        )}
        <Acao acao="diferenca" icone="fa-scale-balanced" rotulo={t('match.menu.difference')} />
        <Acao
          acao="chombo"
          icone="fa-triangle-exclamation"
          rotulo={t('match.menu.chombo')}
          perigo
        />
      </div>
    </Modal>
  )
}

export function ModalDiferenca({
  partida,
  cadeira,
  nomeDe,
  aoFechar,
}: {
  partida: Partida
  cadeira: Cadeira
  nomeDe: NomeDaCadeira
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { numero } = useFormato()
  return (
    <Modal
      titulo={t('match.difference.title', { name: nomeDe(cadeira) })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha"
    >
      <ul className="ptd-linhas">
        {diferencasDePontos(partida.placar, cadeira).map(({ cadeira: outra, diferenca }) => (
          <li key={outra}>
            <span>{nomeDe(outra)}</span>
            <strong className={diferenca < 0 ? 'ptd-negativo' : 'ptd-positivo'}>
              {diferenca < 0
                ? t('match.difference.behind', { points: numero(-diferenca) })
                : t('match.difference.ahead', { points: numero(diferenca) })}
            </strong>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

/** Ryukyoku (tenpai, Nagashi Mangan) e os empates abortivos que a config permite. */
export function ModalRyukyoku({
  partida,
  nomeDe,
  aoConfirmar,
  aoAbortivo,
  aoFechar,
}: {
  partida: Partida
  nomeDe: NomeDaCadeira
  aoConfirmar: (dados: { tenpai: Cadeira[]; nagashi: Cadeira[] }) => void
  aoAbortivo: (abortivo: TipoAbortivo) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()
  const { comSinal } = useFormato()
  const { placar, config } = partida
  // Quem declarou Riichi precisa estar tenpai: já vem marcado.
  const [tenpai, setTenpai] = useState<Cadeira[]>(placar.riichi)
  const [nagashi, setNagashi] = useState<Cadeira[]>([])

  const alternar = (lista: Cadeira[], cadeira: Cadeira) =>
    lista.includes(cadeira) ? lista.filter((item) => item !== cadeira) : [...lista, cadeira]
  const variacao =
    nagashi.length > 0 ? pagamentosNagashi(nagashi, placar.cadeiraDealer) : pagamentosNoten(tenpai)

  const abortivos: TipoAbortivo[] = [
    ...(config.abortivos.kyuushuKyuuhai ? (['kyuushuKyuuhai'] as const) : []),
    ...(config.abortivos.quatroVentos ? (['quatroVentos'] as const) : []),
    ...(config.abortivos.quatroKans ? (['quatroKans'] as const) : []),
    ...(config.abortivos.quatroRiichis ? (['quatroRiichis'] as const) : []),
    ...(config.ronMultiplo === 'duploTriploAborta' ? (['ronTriplo'] as const) : []),
  ]

  return (
    <Modal
      titulo={t('match.draw.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn-primario"
            onClick={() => aoConfirmar({ tenpai, nagashi })}
          >
            {t('match.draw.confirm')}
          </button>
        </div>
      }
    >
      <p className="ptd-rotulo">{t('match.draw.whoTenpai')}</p>
      <div className="ptd-lista-opcoes">
        {CADEIRAS.map((cadeira) => (
          <button
            key={cadeira}
            type="button"
            className={`ptd-opcao${tenpai.includes(cadeira) ? ' ptd-opcao--ativa' : ''}`}
            aria-pressed={tenpai.includes(cadeira)}
            onClick={() => setTenpai((lista) => alternar(lista, cadeira))}
          >
            <span aria-hidden="true">{KANJI_VENTO[ventoDaCadeira(cadeira, placar.cadeiraDealer)]}</span>
            <span className="ptd-opcao-nome">{nomeDe(cadeira)}</span>
            <span className="ptd-opcao-valor">{comSinal(variacao[cadeira])}</span>
          </button>
        ))}
      </div>

      {config.nagashiMangan && (
        <>
          <p className="ptd-rotulo">{t('match.draw.whoNagashi')}</p>
          <div className="ptd-lista-opcoes ptd-lista-opcoes--linha">
            {CADEIRAS.map((cadeira) => (
              <button
                key={cadeira}
                type="button"
                className={`ptd-opcao${nagashi.includes(cadeira) ? ' ptd-opcao--ativa' : ''}`}
                aria-pressed={nagashi.includes(cadeira)}
                onClick={() => setNagashi((lista) => alternar(lista, cadeira))}
              >
                <span className="ptd-opcao-nome">{nomeDe(cadeira)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {abortivos.length > 0 && (
        <>
          <p className="ptd-rotulo">{t('match.draw.abortive')}</p>
          <div className="ptd-lista-opcoes">
            {abortivos.map((abortivo) => (
              <button
                key={abortivo}
                type="button"
                className="ptd-opcao"
                onClick={() => aoAbortivo(abortivo)}
              >
                {t(`match.abortive.${abortivo}`)}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}

function rotuloEvento(evento: EventoPartida, t: (chave: string) => string) {
  if (evento.tipo === 'abortivo' && evento.detalhe?.abortivo) {
    return t(`match.abortive.${evento.detalhe.abortivo}`)
  }
  return t(`match.event.${evento.tipo}`)
}

/** Histórico de mãos: rodada, tipo e variação de cada jogador. */
export function ListaMaos({ partida, nomeDe }: { partida: Partida; nomeDe: NomeDaCadeira }) {
  const { t } = useI18n()
  const { comSinal } = useFormato()
  const maos = partida.eventos.filter((evento) => evento.tipo !== 'riichi').reverse()

  if (maos.length === 0) return <p className="ptd-vazio">{t('match.hands.empty')}</p>

  return (
    <ol className="ptd-maos">
      {maos.map((evento) => (
        <li key={evento.id} className="ptd-mao">
          <div className="ptd-mao-cabecalho">
            <strong>
              {KANJI_VENTO[evento.rodada.vento]}
              {evento.rodada.numero}
              {evento.rodada.honba > 0 ? ` · 本${evento.rodada.honba}` : ''}
            </strong>
            <span>{rotuloEvento(evento, t)}</span>
          </div>
          <ul className="ptd-linhas">
            {CADEIRAS.map((cadeira) => (
              <li key={cadeira}>
                <span>{nomeDe(cadeira)}</span>
                <strong
                  className={
                    evento.variacao[cadeira] < 0
                      ? 'ptd-negativo'
                      : evento.variacao[cadeira] > 0
                        ? 'ptd-positivo'
                        : undefined
                  }
                >
                  {comSinal(evento.variacao[cadeira])}
                </strong>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}

export function ModalMaos({
  partida,
  nomeDe,
  aoFechar,
}: {
  partida: Partida
  nomeDe: NomeDaCadeira
  aoFechar: () => void
}) {
  const { t } = useI18n()
  return (
    <Modal
      titulo={t('match.hands.title')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="modal-folha"
    >
      <ListaMaos partida={partida} nomeDe={nomeDe} />
    </Modal>
  )
}
