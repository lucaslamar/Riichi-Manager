import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { totais } from '../logica/placar'
import { nomeDaCadeira } from './nomes'
import NovoPlacarMcr from './NovoPlacarMcr'
import PlacarAberto from './PlacarAberto'
import { usePlacaresMcr } from './usePlacaresMcr'
import './placar-mcr.css'

type Vista = { tipo: 'lista' } | { tipo: 'novo' } | { tipo: 'placar'; id: string }

/** Placar do modo Chinês: partidas MCR só com os pontos, separadas das do Riichi. */
export default function PaginaPlacarMcr() {
  const { t, numero, idioma } = useI18n()
  const placares = usePlacaresMcr()
  const { jogadores } = useJogadores()
  const [vista, setVista] = useState<Vista>({ tipo: 'lista' })
  const aberto =
    vista.tipo === 'placar' ? placares.find((placar) => placar.id === vista.id) : undefined
  const voltar = () => setVista({ tipo: 'lista' })

  // A Nova partida ocupa a tela como a do Riichi, com o próprio título.
  if (vista.tipo === 'novo') {
    return <NovoPlacarMcr aoCriar={(id) => setVista({ tipo: 'placar', id })} aoVoltar={voltar} />
  }

  return (
    <div className="placar-mcr">
      <TituloTela
        titulo={t('menu.scoreMcr')}
        aoVoltar={vista.tipo === 'lista' ? undefined : voltar}
      />

      {vista.tipo === 'placar' && aberto && <PlacarAberto placar={aberto} aoVoltar={voltar} />}

      {(vista.tipo === 'lista' || (vista.tipo === 'placar' && !aberto)) && (
        <>
          <button type="button" className="btn-primario" onClick={() => setVista({ tipo: 'novo' })}>
            <i className="fas fa-plus" aria-hidden="true" /> {t('placar.mcr.novaPartida')}
          </button>
          {placares.length === 0 && <p className="placar-mcr__ajuda">{t('placar.mcr.vazio')}</p>}
          <ul className="placar-mcr__lista">
            {placares.map((placar) => {
              const pontos = totais(placar)
              return (
                <li key={placar.id}>
                  <button
                    type="button"
                    className="card placar-mcr__item"
                    onClick={() => setVista({ tipo: 'placar', id: placar.id })}
                  >
                    <span className="placar-mcr__vento">
                      {new Date(placar.criadoEm).toLocaleDateString(idioma)} ·{' '}
                      {t(placar.finalizadoEm ? 'placar.mcr.finalizada' : 'placar.mcr.emAndamento')}{' '}
                      ·{' '}
                      {placar.maos.length
                        ? t('placar.mcr.qtdMaos', { count: placar.maos.length })
                        : t('placar.mcr.nenhumaMao')}
                    </span>
                    <span className="placar-mcr__resumo">
                      {placar.jogadorIds.map((id, cadeira) => (
                        <span key={cadeira}>
                          {nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido'))}{' '}
                          {numero(pontos[cadeira])}
                        </span>
                      ))}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
