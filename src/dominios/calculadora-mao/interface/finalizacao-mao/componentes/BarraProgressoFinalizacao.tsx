import type { EstadoCalculadoraMao } from '../../hooks/useCalculadoraMao'

interface PropsBarraProgresso {
  estado: EstadoCalculadoraMao
}

type EstadoEtapa = 'concluida' | 'atual' | 'pendente'

interface Etapa {
  id: string
  label: string
  estado: EstadoEtapa
  visivel: boolean
}

export function BarraProgressoFinalizacao({ estado }: PropsBarraProgresso) {
  const { mao, maoAberta, fluxoOpcoes, podeCalcularMao, deveCalcularMao } = estado

  const ventosDefined = fluxoOpcoes.ventoRodadaDefinido && fluxoOpcoes.ventoAssentoDefinido
  const mostrarRiichi = !maoAberta && !mao.bencao

  const e = (cond1: boolean, cond2?: boolean): EstadoEtapa =>
    cond1 ? 'concluida' : cond2 === undefined || cond2 ? 'atual' : 'pendente'

  const etapas: Etapa[] = (
    [
      { id: 'secao-mao',     label: 'Mão',     visivel: true,         estado: e(true) },
      { id: 'secao-vitoria', label: 'Vitória',  visivel: true,         estado: e(fluxoOpcoes.vitoriaDefinida) },
      { id: 'secao-ventos',  label: 'Ventos',   visivel: true,         estado: e(ventosDefined, fluxoOpcoes.vitoriaDefinida) },
      { id: 'secao-riichi',  label: 'Riichi',   visivel: mostrarRiichi, estado: e(podeCalcularMao, ventosDefined) },
      { id: 'secao-calcular',label: 'Calcular', visivel: true,         estado: e(deveCalcularMao, podeCalcularMao) },
    ] as Etapa[]
  ).filter((et) => et.visivel)

  const rolarParaSecao = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="barra-progresso-finalizacao" aria-label="Progresso da finalização">
      {etapas.map((etapa, i) => (
        <span key={etapa.id} className="barra-progresso-item">
          {i > 0 && (
            <span className="barra-progresso-separador" aria-hidden="true">→</span>
          )}
          <button
            type="button"
            className={`barra-progresso-etapa barra-progresso-etapa-${etapa.estado}`}
            disabled={etapa.estado === 'pendente'}
            onClick={() => rolarParaSecao(etapa.id)}
            aria-current={etapa.estado === 'atual' ? 'step' : undefined}
          >
            {etapa.estado === 'concluida' && (
              <span className="barra-progresso-check" aria-hidden="true">✓</span>
            )}
            {etapa.label}
          </button>
        </span>
      ))}
    </nav>
  )
}
