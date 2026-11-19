import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import Segmentado from '@/dominios/calculadora-mao-chinesa/interface/Segmentado'
import { FAN_MINIMO_MCR } from '@/dominios/calculadora-mao-chinesa/logica/fan-mcr'
import type { FormaBatida } from '@/dominios/calculadora-mao-chinesa/logica/tipos'
import { CADEIRAS, pontosDaMao, validarMao, type Cadeira, type MaoMcr } from '../logica/placar'

/** Registrar a vitória de uma mão: quem venceu, ron ou tsumo, quem descartou e os fan. */
export default function ModalMaoMcr({
  nomes,
  aoSalvar,
  aoFechar,
}: {
  nomes: readonly string[]
  aoSalvar: (mao: MaoMcr) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [vencedor, setVencedor] = useState<Cadeira>(0)
  const [forma, setForma] = useState<FormaBatida>('ron')
  const [descartador, setDescartador] = useState<Cadeira | undefined>(undefined)
  const [fan, setFan] = useState(FAN_MINIMO_MCR)

  const mao: MaoMcr = {
    tipo: 'vitoria',
    vencedor,
    forma,
    fan,
    descartador: forma === 'ron' ? descartador : undefined,
  }
  const erro = validarMao(mao)
  const pontos = pontosDaMao(mao)
  const opcoesJogadores = (cadeiras: readonly Cadeira[]) =>
    cadeiras.map((cadeira) => ({ valor: cadeira, rotulo: nomes[cadeira] }))

  return (
    <Modal
      titulo={t('placar.mcr.registrarVitoria')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      rodape={
        <button
          type="button"
          className="btn-primario"
          disabled={erro !== null}
          onClick={() => aoSalvar(mao)}
        >
          {t('placar.mcr.salvarMao')}
        </button>
      }
    >
      <div className="placar-mcr__formulario">
        <span className="placar-mcr__rotulo">{t('placar.mcr.vencedor')}</span>
        <Segmentado
          rotulo={t('placar.mcr.vencedor')}
          valor={vencedor}
          aoMudar={(cadeira) => {
            setVencedor(cadeira)
            if (cadeira === descartador) setDescartador(undefined)
          }}
          opcoes={opcoesJogadores(CADEIRAS)}
        />

        <span className="placar-mcr__rotulo">{t('mcr.condicoes.forma')}</span>
        <Segmentado
          rotulo={t('mcr.condicoes.forma')}
          valor={forma}
          aoMudar={setForma}
          opcoes={[
            { valor: 'ron', rotulo: t('mcr.condicoes.ron') },
            { valor: 'tsumo', rotulo: t('mcr.condicoes.tsumo') },
          ]}
        />

        {forma === 'ron' && (
          <>
            <span className="placar-mcr__rotulo">{t('placar.mcr.descartador')}</span>
            <Segmentado
              rotulo={t('placar.mcr.descartador')}
              valor={descartador ?? (-1 as Cadeira)}
              aoMudar={setDescartador}
              opcoes={opcoesJogadores(CADEIRAS.filter((cadeira) => cadeira !== vencedor))}
            />
          </>
        )}

        <label className="placar-mcr__rotulo" htmlFor="placar-mcr-fan">
          {t('placar.mcr.fan')}
        </label>
        <div className="placar-mcr__fan">
          <button
            type="button"
            className="btn-contorno placar-mcr__passo"
            aria-label={t('placar.mcr.menosFan')}
            disabled={fan <= FAN_MINIMO_MCR}
            onClick={() => setFan(Math.max(FAN_MINIMO_MCR, fan - 1))}
          >
            <i className="fas fa-minus" aria-hidden="true" />
          </button>
          <input
            id="placar-mcr-fan"
            type="number"
            inputMode="numeric"
            min={FAN_MINIMO_MCR}
            value={fan}
            onChange={(evento) => setFan(Number(evento.target.value))}
          />
          <button
            type="button"
            className="btn-contorno placar-mcr__passo"
            aria-label={t('placar.mcr.maisFan')}
            onClick={() => setFan(fan + 1)}
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </div>
        <p className="placar-mcr__ajuda">{t('placar.mcr.fanAjuda')}</p>

        {erro ? (
          <p className="placar-mcr__erro" role="alert">
            {t(`placar.mcr.erros.${erro}`)}
          </p>
        ) : (
          <ul className="placar-mcr__previa" aria-label={t('placar.mcr.previa')}>
            {CADEIRAS.map((cadeira) => (
              <li key={cadeira}>
                <span>{nomes[cadeira]}</span>
                <strong>
                  {t('placar.mcr.delta', {
                    pontos: (pontos[cadeira] > 0 ? '+' : '') + numero(pontos[cadeira]),
                  })}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}
