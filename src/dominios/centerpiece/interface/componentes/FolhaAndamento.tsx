import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import {
  CADEIRAS,
  CHAVE_VENTO,
  ORDEM_VENTOS,
  type Cadeira,
  type Vento,
} from '../../logica/partida'
import { dealerDaRodada, type Andamento } from '../../logica/partidaPausada'

const NUMEROS = [1, 2, 3, 4] as const
/** Até onde os seletores vão. Um valor salvo maior também aparece. */
const MAXIMO = 20

const contagens = (atual: number) =>
  Array.from({ length: Math.max(MAXIMO, atual) + 1 }, (_, valor) => valor)

/** "Salvar para continuar": o que os cards não dizem. */
export default function FolhaAndamento({
  titulo,
  inicial,
  nomes,
  ordemDosVentos,
  aviso,
  aoSalvar,
  aoFechar,
}: {
  titulo: string
  inicial: Andamento
  nomes: readonly string[]
  /** Com a ordem, trocar a rodada já troca o dealer. */
  ordemDosVentos: boolean
  /** Ex.: pela regra de tobi a partida já tinha acabado. Não impede salvar. */
  aviso?: string
  aoSalvar: (andamento: Andamento) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [andamento, setAndamento] = useState(inicial)
  const { rodada, honba, cadeiraDealer, palitos } = andamento

  const escolherRodada = (valor: string) => {
    const [vento, texto] = valor.split('-')
    const numeroDaMao = Number(texto) as Andamento['rodada']['numero']
    setAndamento({
      ...andamento,
      rodada: { vento: vento as Vento, numero: numeroDaMao },
      ...(ordemDosVentos ? { cadeiraDealer: dealerDaRodada(numeroDaMao) } : {}),
    })
  }

  return (
    <Modal
      titulo={titulo}
      subtitulo={t('match.paused.help')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button type="button" className="btn-primario" onClick={() => aoSalvar(andamento)}>
            {t('players.save')}
          </button>
        </div>
      }
    >
      {aviso && (
        <p className="cfg-aviso fin-andamento-aviso" role="status">
          {aviso}
        </p>
      )}
      <div className="fin-andamento">
        <label className="cfg-campo">
          <span>{t('match.paused.round')}</span>
          <select
            value={`${rodada.vento}-${rodada.numero}`}
            onChange={(evento) => escolherRodada(evento.target.value)}
          >
            {ORDEM_VENTOS.flatMap((vento) =>
              NUMEROS.map((mao) => (
                <option key={`${vento}-${mao}`} value={`${vento}-${mao}`}>
                  {t(CHAVE_VENTO[vento])} {mao}
                </option>
              )),
            )}
          </select>
        </label>
        <label className="cfg-campo">
          <span>{t('match.paused.honba')}</span>
          <select
            value={honba}
            onChange={(evento) => setAndamento({ ...andamento, honba: Number(evento.target.value) })}
          >
            {contagens(honba).map((valor) => (
              <option key={valor} value={valor}>
                {numero(valor)}
              </option>
            ))}
          </select>
        </label>
        <label className="cfg-campo fin-andamento-inteiro">
          <span>{t('match.paused.dealer')}</span>
          <select
            value={cadeiraDealer}
            onChange={(evento) =>
              setAndamento({ ...andamento, cadeiraDealer: Number(evento.target.value) as Cadeira })
            }
          >
            {CADEIRAS.map((cadeira) => (
              <option key={cadeira} value={cadeira}>
                {nomes[cadeira]}
              </option>
            ))}
          </select>
        </label>
        <label className="cfg-campo fin-andamento-inteiro">
          <span>{t('match.paused.sticks')}</span>
          <select
            value={palitos}
            onChange={(evento) =>
              setAndamento({ ...andamento, palitos: Number(evento.target.value) })
            }
          >
            {contagens(palitos).map((valor) => (
              <option key={valor} value={valor}>
                {numero(valor)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  )
}
