import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { RegrasWo } from '@/compartilhado/modo-jogo/regrasDoModo'
import { CADEIRAS, type Cadeira, type Partida } from '@/dominios/centerpiece/logica/partida'
import { criarPartidaWo, pontosDoWo, remontagemPossivel, type Remontagem } from '../../logica/wo'
import type { MesaTorneio, RodadaTorneio, Torneio } from '../../logica/tipos'

export interface MudancaWo {
  remover: string[]
  adicionar: Partida[]
  /** Só ao remontar: os assentos trocados. */
  torneio?: Torneio
}

/** Marcar quem faltou, com os pontos de cada um antes de confirmar e a saída de remontar as mesas. */
export default function FolhaAusencia({
  torneio,
  rodada,
  mesa,
  partida,
  partidas,
  regras,
  nome,
  aoAplicar,
  aoFechar,
}: {
  torneio: Torneio
  rodada: RodadaTorneio
  mesa: MesaTorneio
  /** O WO que está sendo corrigido. */
  partida?: Partida
  partidas: readonly Partida[]
  regras: RegrasWo
  nome: (jogadorId: string) => string
  aoAplicar: (mudanca: MudancaWo) => void
  aoFechar: () => void
}) {
  const { t, idioma } = useI18n()
  const [ausentes, setAusentes] = useState<Cadeira[]>(partida?.wo?.ausentes ?? [])
  const remontagem = remontagemPossivel(torneio, partidas, rodada, mesa, ausentes)
  const pontos = new Intl.NumberFormat(idioma, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  })
  const anteriores = partida ? [partida.id] : []

  const aplicar = (mudanca: MudancaWo) => {
    aoAplicar(mudanca)
    aoFechar()
  }
  const woDa = (noTorneio: Torneio, naMesa: MesaTorneio, quem: readonly Cadeira[]) =>
    criarPartidaWo(noTorneio, rodada, naMesa, quem, {
      id: gerarId(),
      agora: new Date().toISOString(),
      nomes: naMesa.assentos.map(nome),
      regras,
    })
  const remontar = ({ torneio: remontado, outra, ausentes: quem, substituirId }: Remontagem) =>
    aplicar({
      remover: [...anteriores, substituirId],
      adicionar: [woDa(remontado, outra, quem)],
      torneio: remontado,
    })

  return (
    <Modal
      titulo={t('tournament.wo.register')}
      subtitulo={t('match.table.number', { number: mesa.numero })}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <div className="cfg-acoes">
          {partida ? (
            <button type="button" className="btn-contorno" onClick={() => aplicar({ remover: anteriores, adicionar: [] })}>
              {t('tournament.wo.remove')}
            </button>
          ) : (
            <button type="button" className="btn-contorno" onClick={aoFechar}>
              {t('actions.cancel')}
            </button>
          )}
          <button
            type="button"
            className="btn-primario"
            disabled={ausentes.length === 0}
            onClick={() => aplicar({ remover: anteriores, adicionar: [woDa(torneio, mesa, ausentes)] })}
          >
            {t('tournament.wo.confirm')}
          </button>
        </div>
      }
    >
      <p className="cfg-ajuda trn-wo-pergunta">{t('tournament.wo.who')}</p>
      <ul className="trn-wo-lista">
        {CADEIRAS.map((cadeira) => {
          const faltou = ausentes.includes(cadeira)
          const valor = pontosDoWo(regras, ausentes, cadeira)
          return (
            <li key={cadeira}>
              <label>
                <input
                  type="checkbox"
                  checked={faltou}
                  onChange={() =>
                    setAusentes(faltou ? ausentes.filter((item) => item !== cadeira) : [...ausentes, cadeira].sort())
                  }
                />
                <span>{nome(mesa.assentos[cadeira])}</span>
                {ausentes.length > 0 && (
                  <strong className={valor < 0 ? 'trn-negativo' : 'trn-positivo'}>{pontos.format(valor)}</strong>
                )}
              </label>
            </li>
          )
        })}
      </ul>
      {remontagem && (
        <div className="trn-wo-remontar" role="status">
          <p>{t('tournament.wo.rebuildHelp', { table: mesa.numero, other: remontagem.outra.numero })}</p>
          <button type="button" className="btn-contorno" onClick={() => remontar(remontagem)}>
            <i className="fas fa-people-arrows" aria-hidden="true" /> {t('tournament.wo.rebuild')}
          </button>
        </div>
      )}
    </Modal>
  )
}
