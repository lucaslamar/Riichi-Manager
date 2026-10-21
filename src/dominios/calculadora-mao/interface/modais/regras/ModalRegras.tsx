import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { configuracaoPadrao, type ConfiguracaoCalculo } from '../../../logica/mao'
import { CONFIGURACOES_REGRAS } from '../../constantes'
import './modal-regras.css'

const CHAVES_REGRAS: Record<
  keyof ConfiguracaoCalculo,
  { titulo: string; ajuda: string; ligado: string; desligado: string }
> = {
  akadora: {
    titulo: 'rulesModal.akadora.title',
    ajuda: 'rulesModal.akadora.help',
    ligado: 'rulesModal.akadora.on',
    desligado: 'rulesModal.akadora.off',
  },
  doraFlamejante: {
    titulo: 'rulesModal.doraFlamejante.title',
    ajuda: 'rulesModal.doraFlamejante.help',
    ligado: 'rulesModal.doraFlamejante.on',
    desligado: 'rulesModal.doraFlamejante.off',
  },
  tanyaoAberto: {
    titulo: 'rulesModal.tanyaoAberto.title',
    ajuda: 'rulesModal.tanyaoAberto.help',
    ligado: 'rulesModal.tanyaoAberto.on',
    desligado: 'rulesModal.tanyaoAberto.off',
  },
  fuVentosDuplo: {
    titulo: 'rulesModal.fuVentosDuplo.title',
    ajuda: 'rulesModal.fuVentosDuplo.help',
    ligado: 'rulesModal.fuVentosDuplo.on',
    desligado: 'rulesModal.fuVentosDuplo.off',
  },
  fuRinshan: {
    titulo: 'rulesModal.fuRinshan.title',
    ajuda: 'rulesModal.fuRinshan.help',
    ligado: 'rulesModal.fuRinshan.on',
    desligado: 'rulesModal.fuRinshan.off',
  },
  kiriageMangan: {
    titulo: 'rulesModal.kiriageMangan.title',
    ajuda: 'rulesModal.kiriageMangan.help',
    ligado: 'rulesModal.kiriageMangan.on',
    desligado: 'rulesModal.kiriageMangan.off',
  },
  kazoeYakuman: {
    titulo: 'rulesModal.kazoeYakuman.title',
    ajuda: 'rulesModal.kazoeYakuman.help',
    ligado: 'rulesModal.kazoeYakuman.on',
    desligado: 'rulesModal.kazoeYakuman.off',
  },
  yakumanDuplo: {
    titulo: 'rulesModal.yakumanDuplo.title',
    ajuda: 'rulesModal.yakumanDuplo.help',
    ligado: 'rulesModal.yakumanDuplo.on',
    desligado: 'rulesModal.yakumanDuplo.off',
  },
  multiYakuman: {
    titulo: 'rulesModal.multiYakuman.title',
    ajuda: 'rulesModal.multiYakuman.help',
    ligado: 'rulesModal.multiYakuman.on',
    desligado: 'rulesModal.multiYakuman.off',
  },
  basengo: {
    titulo: 'rulesModal.basengo.title',
    ajuda: 'rulesModal.basengo.help',
    ligado: 'rulesModal.basengo.on',
    desligado: 'rulesModal.basengo.off',
  },
}

/** Regras que só valem com outra ligada (Dora flamejante precisa do 5 vermelho). */
const DEPENDENCIAS_REGRAS: Partial<Record<keyof ConfiguracaoCalculo, keyof ConfiguracaoCalculo>> = {
  doraFlamejante: 'akadora',
}

/**
 * Modal de Regras de cálculo. Construída sobre a Modal base; aqui ficam só a
 * lista de regras (liga/desliga) e o rodapé com Restaurar padrão / Aplicar.
 * As mudanças valem na hora; "Aplicar" apenas fecha.
 */
export default function ModalRegras({
  configuracao,
  aoMudar,
  aoFechar,
}: {
  configuracao: ConfiguracaoCalculo
  aoMudar: (config: ConfiguracaoCalculo) => void
  aoFechar: () => void
}) {
  const { t } = useI18n()

  const alternar = (chave: keyof ConfiguracaoCalculo) => {
    aoMudar({ ...configuracao, [chave]: !configuracao[chave] })
  }

  return (
    <Modal
      titulo={t('rulesModal.title')}
      subtitulo={t('rulesModal.help')}
      aoFechar={aoFechar}
      rotuloFechar={t('rulesModal.close')}
      tamanho="grande"
      className="modal-regras"
      rodape={
        <>
          <button
            type="button"
            className="btn-contorno"
            onClick={() => aoMudar(configuracaoPadrao)}
          >
            {t('rulesModal.restoreDefault')}
          </button>
          <button type="button" className="btn-primario" onClick={aoFechar}>
            {t('rulesModal.apply')}
          </button>
        </>
      }
    >
      <div className="lista-regras">
        {CONFIGURACOES_REGRAS.map((regra) => {
          const dependencia = DEPENDENCIAS_REGRAS[regra.chave]
          // Sem a regra de que depende: fica apagada e vale desligada, mas a
          // escolha guardada volta quando a dependência for religada.
          const desabilitada = dependencia !== undefined && !configuracao[dependencia]
          const ativo = configuracao[regra.chave] && !desabilitada
          const textos = CHAVES_REGRAS[regra.chave]
          const titulo = t(textos.titulo)
          const ajudaId = `ajuda-regra-${regra.chave}`

          return (
            <div
              className={`linha-regra${desabilitada ? ' linha-regra--desabilitada' : ''}`}
              key={regra.chave}
            >
              <div className="texto-regra">
                <strong>{titulo}</strong>
                <span id={ajudaId}>{t(textos.ajuda)}</span>
              </div>
              <div
                className="controle-regra"
                role="group"
                aria-label={titulo}
                aria-describedby={ajudaId}
                aria-disabled={desabilitada || undefined}
              >
                <button
                  type="button"
                  className={ativo ? 'ativo' : ''}
                  aria-pressed={ativo}
                  disabled={desabilitada}
                  onClick={() => {
                    if (!ativo) alternar(regra.chave)
                  }}
                >
                  {t(textos.ligado)}
                </button>
                <button
                  type="button"
                  className={!ativo ? 'ativo' : ''}
                  aria-pressed={!ativo}
                  disabled={desabilitada}
                  onClick={() => {
                    if (ativo) alternar(regra.chave)
                  }}
                >
                  {t(textos.desligado)}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
