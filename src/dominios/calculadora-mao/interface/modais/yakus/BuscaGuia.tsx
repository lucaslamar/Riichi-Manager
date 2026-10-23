import { useMemo } from 'react'
import CampoBusca from '@/compartilhado/interface/componentes/busca/CampoBusca'
import type { AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import { buscarNoGlossario, correspondeBusca } from '../../../logica/glossario'
import BlocoGlossario from '../glossario/BlocoGlossario'
import CartaoYaku from './CartaoYaku'
import './busca-guia.css'

/** Campo de busca do Guia de bolso, preso logo abaixo das abas. */
export function CampoBuscaGuia({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (valor: string) => void
}) {
  return (
    <CampoBusca
      valor={valor}
      aoMudar={aoMudar}
      rotulo="Buscar no Guia de bolso"
      placeholder="Buscar termo, yaku ou aba"
      rotuloLimpar="Limpar busca"
    />
  )
}

/**
 * Resultado da busca, no lugar do conteúdo da aba: as abas do Guia pelo nome,
 * os verbetes do glossário (dentro do bloco do assunto) e os cartões de yaku.
 */
export function ResultadoBuscaGuia<Chave extends string>({
  busca,
  abas,
  aoAbrirAba,
}: {
  busca: string
  abas: AbaModal<Chave>[]
  aoAbrirAba: (chave: Chave) => void
}) {
  const { secoes, yakus } = useMemo(() => buscarNoGlossario(busca), [busca])
  const abasEncontradas = abas.filter((aba) => correspondeBusca(busca, [aba.rotulo]))
  const nadaEncontrado = abasEncontradas.length === 0 && secoes.length === 0 && yakus.length === 0

  return (
    <div aria-live="polite">
      {nadaEncontrado && (
        <p className="busca-guia__vazio">Nada encontrado para “{busca.trim()}”.</p>
      )}
      {abasEncontradas.length > 0 && (
        <section className="glossario-bloco glossario-bloco--cartao busca-guia__abas">
          <h3 className="glossario-bloco__titulo">Abas do Guia</h3>
          {abasEncontradas.map((aba) => (
            <button key={aba.chave} type="button" onClick={() => aoAbrirAba(aba.chave)}>
              {aba.rotulo}
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          ))}
        </section>
      )}
      {secoes.map((secao) => (
        <BlocoGlossario key={secao.id} secao={secao} />
      ))}
      {yakus.length > 0 && (
        <section className="busca-guia__yakus">
          <h3 className="yaku-grupo__titulo">Yaku</h3>
          <div className="yaku-lista">
            {yakus.map((yaku) => (
              <CartaoYaku key={yaku.id} yaku={yaku} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
