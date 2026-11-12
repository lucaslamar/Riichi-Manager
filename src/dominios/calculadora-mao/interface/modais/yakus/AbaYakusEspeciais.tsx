import { useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { CATEGORIAS_LOCAIS_EM_ORDEM, textoYakuLocal, YAKUS_LOCAIS, type YakuLocal } from '../../../logica/yakusLocais'
import SecaoYakusLocais from '../regras/SecaoYakusLocais'
import { PedrasExemplo } from './PedrasExemplo'
import { parseMpszGrupos } from '../../../logica/yakus'
import { EXEMPLOS_YAKUS_LOCAIS } from '../../../logica/exemplosYakusLocais'
import { PORQUE_YAKUS_LOCAIS } from '../../../logica/porqueYakusLocais'

import './modal-yakus.css'

/** Card de um yaku local, no mesmo formato dos outros do Guia. */
export function CartaoYakuLocal({ yaku }: { yaku: YakuLocal }) {
  const { t, idioma } = useI18n()
  const texto = textoYakuLocal(yaku, idioma)
  const { valor } = yaku
  const ehYakuman = valor.tipo === 'yakuman'
  return (
    <article className={`yaku-card${ehYakuman ? ' yaku-card--yakuman' : ''}`}>
      <header className="yaku-card__topo">
        <h4 className="yaku-card__nome">
          {yaku.nome}{' '}
          <span className="yaku-card__kanji" lang="ja">
            {yaku.kanji}
          </span>
        </h4>
        {ehYakuman ? (
          <span className="yaku-badge yaku-badge--yakuman">{t('pocketGuide.yakumanBadge')}</span>
        ) : valor.tipo === 'mangan' ? (
          <span className="yaku-badge">
            <strong>Mangan</strong>
          </span>
        ) : (
          <span className="yaku-badge">
            <span>
              {t('pocketGuide.closed')} <strong>{valor.fechada ?? '—'}</strong>
            </span>
            <span className="yaku-badge__divisor" aria-hidden="true">
              |
            </span>
            <span>
              {t('pocketGuide.open')} <strong>{valor.aberta ?? '—'}</strong>
            </span>
          </span>
        )}
      </header>
      <p className="yaku-card__pt">{texto.traducao}</p>
      <p className="yaku-card__descricao">{texto.descricao}</p>
      <p className="yaku-card__valor-local">{texto.valor}</p>
      {PORQUE_YAKUS_LOCAIS[yaku.id] && (
        <p className="yaku-card__porque">
          <strong>{t('localYaku.why')}</strong> {PORQUE_YAKUS_LOCAIS[yaku.id][idioma === 'pt-BR' ? 'pt' : 'en']}
        </p>
      )}
      {EXEMPLOS_YAKUS_LOCAIS[yaku.id] && (
        <PedrasExemplo
          grupos={parseMpszGrupos(EXEMPLOS_YAKUS_LOCAIS[yaku.id])}
          rotulo={t('pocketGuide.example', { exemplo: EXEMPLOS_YAKUS_LOCAIS[yaku.id] })}
        />
      )}
    </article>
  )
}

/**
 * Aba Yakus especiais: as regras da casa, com um aviso de que não são padrão e
 * um atalho para ligá-las em Regras de cálculo → Yakus locais.
 */
export default function AbaYakusEspeciais() {
  const { t } = useI18n()
  const [regrasAbertas, setRegrasAbertas] = useState(false)
  return (
    <>
      <p className="yaku-aviso-especiais" role="note">
        <i className="fas fa-circle-info" aria-hidden="true" /> {t('pocketGuide.specialNotice')}{' '}
        <a
          href="#regra-yakusLocais"
          onClick={(evento) => {
            evento.preventDefault()
            setRegrasAbertas(true)
          }}
        >
          {t('pocketGuide.specialNoticeLink')}
        </a>
      </p>
      {CATEGORIAS_LOCAIS_EM_ORDEM.map(({ categoria, chave }) => {
        const lista = YAKUS_LOCAIS.filter((yaku) => yaku.categoria === categoria)
        return (
          <section key={categoria} className="yaku-grupo">
            <h3 className="yaku-grupo__titulo">{t(chave)}</h3>
            <div className="yaku-lista">
              {lista.map((yaku) => (
                <CartaoYakuLocal key={yaku.id} yaku={yaku} />
              ))}
            </div>
          </section>
        )
      })}
      {regrasAbertas && (
        <Modal
          titulo={t('rulesModal.title')}
          subtitulo={t('localYaku.title')}
          aoFechar={() => setRegrasAbertas(false)}
          rotuloFechar={t('actions.close')}
          tamanho="grande"
          className="modal-regras"
        >
          <SecaoYakusLocais />
        </Modal>
      )}
    </>
  )
}
