import { useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Segmentado from '@/dominios/calculadora-mao-chinesa/interface/Segmentado'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  CADEIRAS,
  novoPlacar,
  OPCOES_TIMER_SEGUNDOS,
  TIMER_PADRAO_SEGUNDOS,
  type Cadeira,
} from '../logica/placar'
import { CHAVES_VENTO, nomeDaCadeira } from './nomes'
import { acoesPlacaresMcr } from './usePlacaresMcr'

/** Nova partida MCR: quem senta em cada vento e o timer da vez. */
export default function NovoPlacarMcr({
  aoCriar,
  aoCancelar,
}: {
  aoCriar: (id: string) => void
  aoCancelar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const [ids, setIds] = useState<(string | null)[]>([null, null, null, null])
  const [escolhendo, setEscolhendo] = useState<Cadeira | null>(null)
  const [timer, setTimer] = useState<number>(TIMER_PADRAO_SEGUNDOS)
  const completo = ids.every((id) => id !== null)

  const escolher = (cadeira: Cadeira, id: string | null) =>
    setIds((atuais) =>
      atuais.map((atual, i) => (i === cadeira ? id : atual === id && id ? null : atual)),
    )

  const criar = () => {
    if (!completo) return
    const placar = novoPlacar(
      gerarId(),
      ids as [string, string, string, string],
      timer,
      new Date().toISOString(),
    )
    acoesPlacaresMcr.criar(placar)
    aoCriar(placar.id)
  }

  return (
    <section className="card placar-mcr__secao" aria-labelledby="placar-mcr-novo">
      <h3 id="placar-mcr-novo" className="placar-mcr__titulo">
        {t('placar.mcr.novaPartida')}
      </h3>
      <div className="placar-mcr__cadeiras">
        {CADEIRAS.map((cadeira) => {
          const id = ids[cadeira]
          return (
            <button
              key={cadeira}
              type="button"
              className="btn-contorno placar-mcr__cadeira"
              onClick={() => setEscolhendo(cadeira)}
            >
              <span className="placar-mcr__vento">{t(CHAVES_VENTO[cadeira])}</span>
              <span>
                {id
                  ? nomeDaCadeira(jogadores, id, t('placar.mcr.jogadorRemovido'))
                  : t('placar.mcr.escolherJogador')}
              </span>
            </button>
          )
        })}
      </div>

      <span className="placar-mcr__rotulo">{t('placar.mcr.timer')}</span>
      <Segmentado
        rotulo={t('placar.mcr.timer')}
        valor={timer}
        aoMudar={setTimer}
        opcoes={OPCOES_TIMER_SEGUNDOS.map((segundos) => ({
          valor: segundos,
          rotulo: segundos
            ? t('placar.mcr.segundos', { segundos: numero(segundos) })
            : t('placar.mcr.timerDesligado'),
        }))}
      />

      <div className="placar-mcr__acoes">
        <button type="button" className="btn-contorno" onClick={aoCancelar}>
          {t('actions.cancel')}
        </button>
        <button type="button" className="btn-primario" disabled={!completo} onClick={criar}>
          {t('placar.mcr.comecar')}
        </button>
      </div>
      {!completo && <p className="placar-mcr__ajuda">{t('placar.mcr.faltamJogadores')}</p>}

      {escolhendo !== null && (
        <SeletorJogador
          titulo={t(CHAVES_VENTO[escolhendo])}
          idsEscolhidos={ids.filter((id): id is string => id !== null)}
          rotuloEscolhido={(id) => t(CHAVES_VENTO[ids.indexOf(id) as Cadeira])}
          aoDesmarcar={(id) => escolher(ids.indexOf(id) as Cadeira, null)}
          aoEscolher={(jogador) => {
            escolher(escolhendo, jogador.id)
            setEscolhendo(null)
          }}
          aoFechar={() => setEscolhendo(null)}
        />
      )}
    </section>
  )
}
