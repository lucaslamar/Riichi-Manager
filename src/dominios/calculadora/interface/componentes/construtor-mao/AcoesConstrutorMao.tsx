import type { Acao, Mao } from '../../../logica/mao'
import { BotaoAcao } from '../Botoes'

interface PropsAcoesConstrutorMao {
  mao: Mao
  acaoPendente: Acao | null
  podeChii: boolean
  podePon: boolean
  podeKanAberto: boolean
  podeKanFechado: boolean
  aoAlternarAcao: (tipo: Acao['tipo']) => void
  compacto?: boolean
}

/**
 * Agrupa os comandos que mudam o destino do próximo clique no teclado de pedras.
 * É usado tanto na barra desktop quanto no menu compacto mobile.
 */
export function AcoesConstrutorMao({
  mao,
  acaoPendente,
  podeChii,
  podePon,
  podeKanAberto,
  podeKanFechado,
  aoAlternarAcao,
  compacto = false,
}: PropsAcoesConstrutorMao) {
  return (
    <>
      <BotaoAcao
        tipo="chii"
        rotulo={compacto ? 'Chi' : 'Chii'}
        cor="#4caf50"
        ativo={acaoPendente?.tipo === 'chii'}
        desabilitado={!podeChii}
        aoClicar={() => aoAlternarAcao('chii')}
      />
      <BotaoAcao
        tipo="pon"
        rotulo="Pon"
        cor="#2196f3"
        ativo={acaoPendente?.tipo === 'pon'}
        desabilitado={!podePon}
        aoClicar={() => aoAlternarAcao('pon')}
      />
      <BotaoAcao
        tipo="kanAberto"
        rotulo={compacto ? 'Kan' : 'Kan (aberto)'}
        cor="#ba68c8"
        ativo={acaoPendente?.tipo === 'kanAberto'}
        desabilitado={!podeKanAberto}
        aoClicar={() => aoAlternarAcao('kanAberto')}
      />
      <BotaoAcao
        tipo="kanFechado"
        rotulo={compacto ? 'K. fechado' : 'Kan (fechado)'}
        cor="#9c27b0"
        ativo={acaoPendente?.tipo === 'kanFechado'}
        desabilitado={!podeKanFechado}
        aoClicar={() => aoAlternarAcao('kanFechado')}
      />
      <BotaoAcao
        tipo="dora"
        rotulo="Dora"
        cor="#ec4899"
        ativo={acaoPendente?.tipo === 'dora'}
        desabilitado={mao.doraManual > 0 || mao.dora.length >= 5}
        aoClicar={() => aoAlternarAcao('dora')}
      />
      {mao.riichi && (
        <BotaoAcao
          tipo="uradora"
          rotulo="Uradora"
          cor="#ec4899"
          ativo={acaoPendente?.tipo === 'uradora'}
          desabilitado={mao.doraManual > 0 || mao.uradora.length >= 5}
          aoClicar={() => aoAlternarAcao('uradora')}
        />
      )}
      <BotaoAcao
        tipo="descarte"
        rotulo="Descartes"
        cor="#111827"
        ativo={acaoPendente?.tipo === 'descarte'}
        desabilitado={false}
        aoClicar={() => aoAlternarAcao('descarte')}
      />
    </>
  )
}
