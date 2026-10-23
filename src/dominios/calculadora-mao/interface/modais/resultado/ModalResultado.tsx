import { useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import {
  configuracaoPadrao,
  pagamentoChombo,
  type CodigoPedra,
  type Mao,
} from '../../../logica/mao'
import { ESTILO_MELD, HONRAS, NAIPES } from '../../constantes'
import { PedraSvg, PedrasMeld } from '../../compartilhado/componentes/PedraSvg'
import ExibicaoCompleta, { TagsVentos } from './ExibicaoCompleta'

const formatar = (valor: number) => valor.toLocaleString('pt-BR')
import { consumirDestaque, destaqueDoYaku } from './destaqueYaku'
import './modal-resultado.css'

interface PropsModalResultado {
  mao: Mao
  resultado: any
  /** Ron em furiten: mostra o aviso de chombo no lugar da pontuação. */
  chomboFuriten: boolean
  /** Mão sem yaku: mostra o aviso de mão inválida no lugar da pontuação. */
  maoInvalida: boolean
  /** Regra da mesa: multa de chombo no valor de mangan (senão, de yakuman). */
  chomboMangan: boolean
  /** Texto lido pelo leitor de tela ao abrir (resumo do resultado). */
  descricaoAcessivel: string
  aoFechar: () => void
  /** Lixeira do cabeçalho: limpa a mão e começa uma nova. */
  aoNovaMao?: () => void
}

/**
 * Modal de resultado da Calculadora de Mão. Construída sobre a Modal base;
 * aqui ficam só o conteúdo e as funcionalidades próprias dela:
 * - mão calculada com a pedra da batida destacada;
 * - pontuação completa (ExibicaoCompleta) ou aviso de chombo / sem yaku, com tom de alerta;
 * - rodapé de referência das pedras, exibido só em tablets largos deitados (ver CSS).
 */
export default function ModalResultado({
  mao,
  resultado,
  chomboFuriten,
  maoInvalida,
  chomboMangan,
  descricaoAcessivel,
  aoFechar,
  aoNovaMao,
}: PropsModalResultado) {
  const { t } = useI18n()
  const [yakuSelecionado, setYakuSelecionado] = useState<string | null>(null)
  // Recalculado a cada render: as cotas são consumidas na ordem das pedras na tela.
  const destaque = yakuSelecionado ? destaqueDoYaku(yakuSelecionado, mao) : null
  const destacar = (pedra: CodigoPedra) => (destaque ? consumirDestaque(destaque, pedra) : false)
  const alerta = chomboFuriten || maoInvalida
  const chomboOya = mao.ventoAssento === '1'
  const multa = pagamentoChombo({ ...configuracaoPadrao, chomboMangan }, chomboOya)
  const pedraAgari = mao.agariMeld ? null : mao.pedras[mao.indiceAgari]
  const pedrasFechadas = mao.agariMeld
    ? mao.pedras
    : mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari)

  const titulo = maoInvalida
    ? t('calculator.noYakuTitle')
    : chomboFuriten
      ? t('calculator.alert')
      : t('calculator.result')

  return (
    <Modal
      titulo={titulo}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="media"
      tom={alerta ? 'alerta' : 'padrao'}
      estiloTitulo="rotulo"
      className="modal-resultado"
      rodape={<RodapeReferenciaPedras />}
      semBotaoFechar
      acoes={
        <>
          {/* Lápis: fecha o resultado e volta para a finalização (como o X ou o deslize). */}
          <button
            type="button"
            className="modal-acao"
            aria-label={t('actions.backToFinish')}
            title={t('actions.backToFinish')}
            onClick={aoFechar}
          >
            <i className="fas fa-pen" aria-hidden="true" />
          </button>
          {aoNovaMao && (
            <button
              type="button"
              className="modal-acao modal-acao--destrutiva"
              aria-label={t('actions.newHand')}
              title={t('actions.newHand')}
              onClick={aoNovaMao}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          )}
        </>
      }
    >
      <div className="sr-only" aria-live="polite">
        {descricaoAcessivel}
      </div>

      <div className="mao-calculada">
        {mao.pedras.length > 0 && (
          <div className="resultado-grupo-mao" aria-label={t('calculator.closedHand')}>
            {pedrasFechadas.map((pedra, indice) => (
              <span
                key={`${pedra}-${indice}`}
                className={`chip-pedra resultado-pedra${destacar(pedra) ? ' destaque-yaku' : ''}`}
              >
                <PedraSvg pedra={pedra} />
              </span>
            ))}
            {pedraAgari && (
              <span
                className={`chip-pedra resultado-pedra agari${
                  destaque?.batida || destacar(pedraAgari) ? ' destaque-yaku' : ''
                }`}
              >
                <PedraSvg pedra={pedraAgari} />
              </span>
            )}
          </div>
        )}
        {mao.melds.map((meld, indice) => {
          const temBatida = mao.agariMeld?.indiceMeld === indice
          // Sem curto-circuito: todas as pedras do grupo consomem a cota.
          const destacadas = meld.pedras.map(destacar).filter(Boolean).length
          const meldDestacado = destacadas > 0 || (destaque?.batida && temBatida)
          return (
            <span
              key={`${meld.tipo}-${indice}`}
              className={`resultado-meld resultado-meld-${meld.tipo}${meldDestacado ? ' destaque-yaku' : ''}`}
              style={{ borderColor: ESTILO_MELD[meld.tipo].borda }}
              aria-label={ESTILO_MELD[meld.tipo].rotulo}
            >
              <PedrasMeld
                meld={meld}
                indiceAgari={temBatida ? mao.agariMeld?.indicePedra : undefined}
              />
            </span>
          )
        })}
      </div>

      {maoInvalida || chomboFuriten ? (
        // Mesmo esquema do resultado, invertido: quem errou paga a cada jogador.
        <div className="resultado-chombo">
          <strong>
            {maoInvalida ? t('calculator.noYakuTitle') : t('calculator.furitenChomboTitle')}
          </strong>
          <TagsVentos mao={mao} />
          <div className="pontos-chombo">-{formatar(multa.total)}</div>
          <div className="pagamentos-resultado">
            {chomboOya ? (
              <span>
                Todos recebem <strong>{formatar(multa.demais)}</strong>
              </span>
            ) : (
              <>
                <span>
                  {t('winds.east')} recebe <strong>{formatar(multa.leste)}</strong>
                </span>
                <span>
                  Demais recebem <strong>{formatar(multa.demais)}</strong>
                </span>
              </>
            )}
          </div>
          <span className="motivo-chombo">
            {maoInvalida
              ? t('calculator.invalidNoYakuAnnounce')
              : t('calculator.invalidFuritenAnnounce')}
          </span>
          <span className="regra-chombo">
            Multa de chombo: {chomboMangan ? 'Mangan' : 'Yakuman'}
          </span>
        </div>
      ) : (
        <ExibicaoCompleta
          resultado={resultado}
          mao={mao}
          yakuSelecionado={yakuSelecionado}
          aoSelecionarYaku={setYakuSelecionado}
        />
      )}
    </Modal>
  )
}

/** Referência visual MAN/PIN/SOU/HONRAS para conferir as pedras na mesa. */
function RodapeReferenciaPedras() {
  return (
    <div className="rodape-pedras" aria-hidden="true">
      {NAIPES.map(({ naipe, rotulo }) => (
        <div key={naipe} className="rodape-pedras-linha">
          <span className="rodape-pedras-rotulo">{rotulo.replace(/\s*\(.*\)\s*/, '')}</span>
          <div className="rodape-pedras-tiles">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => (
              <span key={numero} className="rodape-pedra-ref">
                <PedraSvg pedra={`${numero}${naipe}` as CodigoPedra} />
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="rodape-pedras-linha">
        <span className="rodape-pedras-rotulo">Honras</span>
        <div className="rodape-pedras-tiles">
          {HONRAS.map((pedra) => (
            <span key={pedra} className="rodape-pedra-ref">
              <PedraSvg pedra={pedra} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
