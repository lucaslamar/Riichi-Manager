import type { EstadoCalculadoraMao } from '../hooks/useCalculadoraMao'
import { BotaoToggle } from './Botoes'
import { SeletorVentos, ToggleAgari } from './SeletoresMao'

interface PropsOpcoesMao {
  estado: EstadoCalculadoraMao
  embutido?: boolean
}

/** Controles de riichi e condicoes especiais da vitoria. */
export default function OpcoesMao({ estado, embutido = false }: PropsOpcoesMao) {
  const { mao, atualizarMao, maoAberta } = estado

  return (
    <>
      <div className={embutido ? 'opcoes-mao-embutidas' : 'card'}>
        <SeletorVentos mao={mao} atualizarMao={atualizarMao} />
        <ToggleAgari mao={mao} atualizarMao={atualizarMao} />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 14,
            alignItems: 'center',
          }}
        >
          <BotaoToggle
            rotulo="Riichi"
            ativo={mao.riichi !== null}
            desabilitado={maoAberta}
            corAtiva="#f97316"
            aoClicar={() =>
              atualizarMao((rascunho) => {
                rascunho.riichi = rascunho.riichi ? null : { duplo: false, ippatsu: false }
                if (rascunho.riichi) rascunho.bencao = false
                else rascunho.uradora = []
              })
            }
          />
          <BotaoToggle
            rotulo="Ippatsu"
            ativo={mao.riichi?.ippatsu ?? false}
            desabilitado={mao.riichi === null}
            aoClicar={() =>
              atualizarMao((rascunho) => {
                if (rascunho.riichi) rascunho.riichi.ippatsu = !rascunho.riichi.ippatsu
              })
            }
          />
          <BotaoToggle
            rotulo="Double Riichi"
            ativo={mao.riichi?.duplo ?? false}
            desabilitado={mao.riichi === null}
            aoClicar={() =>
              atualizarMao((rascunho) => {
                if (rascunho.riichi) rascunho.riichi.duplo = !rascunho.riichi.duplo
              })
            }
          />
          <div style={{ width: 1, height: 32, background: '#e0e0e0', margin: '0 4px' }} />
          <BotaoToggle
            rotulo="Tenhou / Chiihou"
            ativo={mao.bencao}
            desabilitado={mao.melds.length > 0}
            aoClicar={() =>
              atualizarMao((rascunho) => {
                rascunho.bencao = !rascunho.bencao
                if (rascunho.bencao) {
                  rascunho.riichi = null
                  rascunho.ultimaPedra = false
                  rascunho.kan = false
                }
              })
            }
          />
          <BotaoToggle
            rotulo={mao.agari === 'ron' ? 'Chankan' : 'Rinshan'}
            ativo={mao.kan}
            desabilitado={false}
            aoClicar={() =>
              atualizarMao((rascunho) => {
                rascunho.kan = !rascunho.kan
                if (rascunho.kan) {
                  rascunho.bencao = false
                  rascunho.ultimaPedra = false
                }
              })
            }
          />
          <BotaoToggle
            rotulo={mao.agari === 'ron' ? 'Houtei' : 'Haitei'}
            ativo={mao.ultimaPedra}
            desabilitado={false}
            aoClicar={() =>
              atualizarMao((rascunho) => {
                rascunho.ultimaPedra = !rascunho.ultimaPedra
                if (rascunho.ultimaPedra) {
                  rascunho.bencao = false
                  rascunho.kan = false
                }
              })
            }
          />
        </div>
      </div>
    </>
  )
}
