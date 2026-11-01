import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { nomeExibido, type Jogador } from '../../logica/jogadores'
import SeletorJogador from '../componentes/SeletorJogador'
import '../jogadores.css'

const ASSENTOS = ['東', '南', '西', '北']

/** TEMPORÁRIO: só para testar o SeletorJogador. Sai quando o setup da Fase 3 usar o seletor. */
export default function DemoSeletorJogador() {
  const { t } = useI18n()
  const [escolhidos, setEscolhidos] = useState<(Jogador | null)[]>([null, null, null, null])
  const [aberto, setAberto] = useState<number | null>(null)

  return (
    <section className="card pagina-jogadores">
      <ul className="lista-jogadores">
        {ASSENTOS.map((vento, indice) => (
          <li key={vento} className="linha-cadastro">
            <div className="dados-jogador">
              <span className="nome-cadastro">
                {vento} {escolhidos[indice] ? nomeExibido(escolhidos[indice]) : ''}
              </span>
            </div>
            <button type="button" className="btn-contorno" onClick={() => setAberto(indice)}>
              {t('players.choose')}
            </button>
          </li>
        ))}
      </ul>

      {aberto !== null && (
        <SeletorJogador
          titulo={ASSENTOS[aberto]}
          idsEscolhidos={escolhidos.flatMap((jogador) => (jogador ? [jogador.id] : []))}
          aoFechar={() => setAberto(null)}
          aoEscolher={(jogador) => {
            setEscolhidos((atuais) =>
              atuais.map((atual, indice) => (indice === aberto ? jogador : atual)),
            )
            setAberto(null)
          }}
        />
      )}
    </section>
  )
}
