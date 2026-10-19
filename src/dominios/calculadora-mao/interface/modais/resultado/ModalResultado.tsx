import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import type { CodigoPedra, Mao } from '../../../logica/mao'
import { ESTILO_MELD, HONRAS, NAIPES } from '../../constantes'
import { PedraSvg, PedrasMeld } from '../../compartilhado/componentes/PedraSvg'
import ExibicaoCompleta from './ExibicaoCompleta'
import './modal-resultado.css'

interface PropsModalResultado {
  mao: Mao
  resultado: any
  /** Ron em furiten: mostra o aviso de chombo no lugar da pontuação. */
  chomboFuriten: boolean
  /** Mão sem yaku: mostra o aviso de mão inválida no lugar da pontuação. */
  maoInvalida: boolean
  /** Texto lido pelo leitor de tela ao abrir (resumo do resultado). */
  descricaoAcessivel: string
  aoFechar: () => void
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
  descricaoAcessivel,
  aoFechar,
}: PropsModalResultado) {
  const { t } = useI18n()
  const alerta = chomboFuriten || maoInvalida
  const chomboOya = mao.ventoAssento === '1'
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
    >
      <div className="sr-only" aria-live="polite">
        {descricaoAcessivel}
      </div>

      <div className="mao-calculada">
        {mao.pedras.length > 0 && (
          <div className="resultado-grupo-mao" aria-label={t('calculator.closedHand')}>
            {pedrasFechadas.map((pedra, indice) => (
              <span key={`${pedra}-${indice}`} className="chip-pedra resultado-pedra">
                <PedraSvg pedra={pedra} />
              </span>
            ))}
            {pedraAgari && (
              <span className="chip-pedra resultado-pedra agari">
                <PedraSvg pedra={pedraAgari} />
              </span>
            )}
          </div>
        )}
        {mao.melds.map((meld, indice) => (
          <span
            key={`${meld.tipo}-${indice}`}
            className={`resultado-meld resultado-meld-${meld.tipo}`}
            style={{ borderColor: ESTILO_MELD[meld.tipo].borda }}
            aria-label={ESTILO_MELD[meld.tipo].rotulo}
          >
            <PedrasMeld
              meld={meld}
              indiceAgari={mao.agariMeld?.indiceMeld === indice ? mao.agariMeld.indicePedra : undefined}
            />
          </span>
        ))}
      </div>

      {maoInvalida ? (
        <div className="resultado-chombo">
          <strong>{t('calculator.noYakuTitle')}</strong>
          <div className="pontos-chombo">{chomboOya ? '-12.000' : '-8.000'}</div>
          <span>{t('calculator.invalidNoYakuAnnounce')}</span>
          <span>
            {chomboOya ? t('calculator.noYakuPenaltyDealer') : t('calculator.noYakuPenaltyNonDealer')}
          </span>
        </div>
      ) : chomboFuriten ? (
        <div className="resultado-chombo">
          <strong>{t('calculator.furitenChomboTitle')}</strong>
          <div className="pontos-chombo">{chomboOya ? '-12.000' : '-8.000'}</div>
          <span>
            {chomboOya
              ? t('calculator.furitenChomboTextDealer')
              : t('calculator.furitenChomboTextNonDealer')}
          </span>
        </div>
      ) : (
        <ExibicaoCompleta resultado={resultado} mao={mao} />
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
