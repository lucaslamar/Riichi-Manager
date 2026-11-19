import { useId, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { fanMcrPorId, type FanMcr } from '@/compartilhado/mahjong/mcr/fans-mcr'

export const idCartaoFan = (id: number) => `fan-mcr-${id}`

/** Um fan do guia: pontos, nome do CMC, 汉字, inglês, descrição e o que não combina. */
export default function CartaoFanMcr({
  fan,
  aoIrPara,
}: {
  fan: FanMcr
  aoIrPara: (id: number) => void
}) {
  const { t, numero } = useI18n()
  const [aberto, setAberto] = useState(false)
  const idDetalhes = useId()
  const temDetalhes = Boolean(fan.naoCombina?.length || fan.observacao)

  return (
    <article
      id={idCartaoFan(fan.id)}
      className="fan-mcr"
      tabIndex={-1}
      aria-labelledby={`${idDetalhes}-nome`}
    >
      <div className="fan-mcr__topo">
        <span
          className="fan-mcr__pontos"
          aria-label={t('guiaBolso.mcr.pontosFan', { pontos: numero(fan.pontos) })}
        >
          {numero(fan.pontos)}
        </span>
        <h4 id={`${idDetalhes}-nome`} className="fan-mcr__nome">
          {fan.pt}
        </h4>
        <span className="fan-mcr__numero">{t('guiaBolso.mcr.numero', { id: numero(fan.id) })}</span>
      </div>
      <p className="fan-mcr__outros-nomes">
        <span lang="zh-Hans">{fan.hanzi}</span> · <span lang="en">{fan.en}</span>
      </p>
      <p className="fan-mcr__descricao">{fan.descricao}</p>
      {fan.yakuRiichi && (
        <span className="fan-mcr__riichi">
          {t('guiaBolso.mcr.riichi', { yaku: fan.yakuRiichi })}
        </span>
      )}

      {temDetalhes && (
        <>
          <button
            type="button"
            className="fan-mcr__expandir"
            aria-expanded={aberto}
            aria-controls={idDetalhes}
            onClick={() => setAberto(!aberto)}
          >
            <i
              className={`fas ${aberto ? 'fa-chevron-down' : 'fa-chevron-right'}`}
              aria-hidden="true"
            />
            {t('guiaBolso.mcr.detalhes')}
          </button>
          <div id={idDetalhes} className="fan-mcr__detalhes" hidden={!aberto}>
            {fan.naoCombina?.length ? (
              <>
                <strong>{t('guiaBolso.mcr.naoCombina')}</strong>
                <ul className="fan-mcr__lista-exclusoes">
                  {fan.naoCombina.map((id) => {
                    const outro = fanMcrPorId(id)
                    if (!outro) return null
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="fan-mcr__link"
                          aria-label={t('guiaBolso.mcr.irPara', { nome: outro.pt })}
                          onClick={() => aoIrPara(id)}
                        >
                          {outro.pt} · {t('guiaBolso.mcr.numero', { id: numero(id) })}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : null}
            {fan.observacao && <p className="fan-mcr__observacao">{fan.observacao}</p>}
          </div>
        </>
      )}
    </article>
  )
}
