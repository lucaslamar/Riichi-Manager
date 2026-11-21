import { useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import Segmentado from '@/dominios/calculadora-mao-chinesa/interface/Segmentado'
import CardAssento from '@/dominios/centerpiece/interface/componentes/CardAssento'
import { KANJI_VENTO, ORDEM_VENTOS, sortearAssentos } from '@/dominios/centerpiece/logica/partida'
import SeletorJogador from '@/dominios/jogadores/interface/componentes/SeletorJogador'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { nomeExibido } from '@/dominios/jogadores/logica/jogadores'
import {
  CADEIRAS,
  novoPlacar,
  OPCOES_TIMER_SEGUNDOS,
  TIMER_PADRAO_SEGUNDOS,
  type Cadeira,
} from '../logica/placar'
import { CHAVES_VENTO } from './nomes'
import { acoesPlacaresMcr } from './usePlacaresMcr'
// O mesmo visual da Nova partida do Riichi (assentos, resumo das regras e rodapé).
import '@/dominios/centerpiece/interface/partida.css'

/**
 * Nova partida MCR com o mesmo layout da Nova partida do Riichi: os quatro
 * assentos, assentos aleatórios, o resumo das regras (que abre o timer da vez)
 * e "Iniciar mesa". As regras de pontuação são as do MCR.
 */
export default function NovoPlacarMcr({
  aoCriar,
  aoVoltar,
}: {
  aoCriar: (id: string) => void
  aoVoltar: () => void
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const [assentos, setAssentos] = useState<(string | null)[]>([null, null, null, null])
  const [escolhendo, setEscolhendo] = useState<Cadeira | null>(null)
  const [timer, setTimer] = useState<number>(TIMER_PADRAO_SEGUNDOS)
  const [regrasAbertas, setRegrasAbertas] = useState(false)
  const preenchidos = assentos.filter((id): id is string => id !== null)
  const completos = preenchidos.length === 4
  const nomeDe = (id: string | null) => {
    const jogador = jogadores.find((item) => item.id === id)
    return jogador ? nomeExibido(jogador) : null
  }
  const rotuloTimer = (segundos: number) =>
    segundos
      ? t('placar.mcr.segundos', { segundos: numero(segundos) })
      : t('placar.mcr.timerDesligado')

  const iniciar = () => {
    if (!completos) return
    const agora = new Date()
    const placar = {
      ...novoPlacar(
        gerarId(),
        assentos as [string, string, string, string],
        timer,
        agora.toISOString(),
      ),
    }
    acoesPlacaresMcr.criar(placar)
    aoCriar(placar.id)
  }

  return (
    <section className="ptd-setup">
      <TituloTela titulo={t('match.setup.title')} aoVoltar={aoVoltar} />

      <div className="ptd-assentos">
        {CADEIRAS.map((cadeira) => {
          const nome = nomeDe(assentos[cadeira])
          const vento = t(CHAVES_VENTO[cadeira])
          return (
            <CardAssento
              key={cadeira}
              cadeira={cadeira}
              principal={nome ?? t('match.setup.assign')}
              ocupado={!!nome}
              rotulo={t(nome ? 'match.setup.seatFilled' : 'match.setup.seatEmpty', {
                wind: vento,
                name: nome ?? '',
              })}
              aoTocar={() => setEscolhendo(cadeira)}
            />
          )
        })}
      </div>

      <button
        type="button"
        className="btn-contorno ptd-btn-largo"
        disabled={!completos}
        onClick={() => setAssentos(sortearAssentos(assentos, Math.random))}
      >
        <i className="fas fa-shuffle" aria-hidden="true" />
        {t('match.setup.randomSeats')}
      </button>

      <button type="button" className="ptd-resumo-regras" onClick={() => setRegrasAbertas(true)}>
        <span>
          <strong>{`${t('sanma.variante4')} · ${t('placar.mcr.regrasMcr')}`}</strong>
          <span className="ptd-apoio">{t('placar.mcr.resumoRegras')}</span>
          <span className="ptd-apoio">{`${t('placar.mcr.timer')}: ${rotuloTimer(timer)}`}</span>
        </span>
        <i className="fas fa-wrench" aria-hidden="true" />
        <span className="sr-only">{t('tableConfig.title')}</span>
      </button>

      <div className="ptd-rodape-fixo">
        <button
          type="button"
          className="btn-primario ptd-btn-largo"
          disabled={!completos}
          onClick={iniciar}
        >
          {t('match.setup.start')}
        </button>
      </div>

      {escolhendo !== null && (
        <SeletorJogador
          titulo={KANJI_VENTO[ORDEM_VENTOS[escolhendo]]}
          idsEscolhidos={preenchidos}
          aoFechar={() => setEscolhendo(null)}
          // Como na Nova partida do Riichi: tocar em quem está na mesa tira a pessoa do lugar.
          aoDesmarcar={(jogadorId) => {
            const proximos = assentos.map((id) => (id === jogadorId ? null : id))
            setAssentos(proximos)
            setEscolhendo(CADEIRAS.find((cadeira) => proximos[cadeira] === null) ?? escolhendo)
          }}
          rotuloEscolhido={(jogadorId) => t(CHAVES_VENTO[assentos.indexOf(jogadorId) as Cadeira])}
          aoEscolher={(jogador) => {
            // Entra no vento tocado, se vazio; senão no primeiro vazio. A folha segue
            // aberta enquanto houver vento vazio.
            const vazios = CADEIRAS.filter((cadeira) => assentos[cadeira] === null)
            const alvo = assentos[escolhendo] === null ? escolhendo : (vazios[0] ?? escolhendo)
            const proximos = assentos.map((id, indice) => (indice === alvo ? jogador.id : id))
            setAssentos(proximos)
            setEscolhendo(CADEIRAS.find((cadeira) => proximos[cadeira] === null) ?? null)
          }}
        />
      )}

      {regrasAbertas && (
        <Modal
          titulo={t('tableConfig.title')}
          aoFechar={() => setRegrasAbertas(false)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          rodape={
            <button type="button" className="btn-primario" onClick={() => setRegrasAbertas(false)}>
              {t('actions.close')}
            </button>
          }
        >
          <div className="placar-mcr__formulario">
            <p className="placar-mcr__ajuda">{t('placar.mcr.resumoRegras')}</p>
            <span className="placar-mcr__rotulo">{t('placar.mcr.timer')}</span>
            <Segmentado
              rotulo={t('placar.mcr.timer')}
              valor={timer}
              aoMudar={setTimer}
              opcoes={OPCOES_TIMER_SEGUNDOS.map((segundos) => ({
                valor: segundos,
                rotulo: rotuloTimer(segundos),
              }))}
            />
          </div>
        </Modal>
      )}
    </section>
  )
}
