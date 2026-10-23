import { useId, useMemo } from 'react'
import type { AbaModal } from '@/compartilhado/interface/componentes/modal/AbasModal'
import { buscarNoGlossario, correspondeBusca } from '../../../logica/glossario'
import BlocoGlossario from '../glossario/BlocoGlossario'
import CartaoYaku from './CartaoYaku'
import './busca-guia.css'

/**
 * Campo de busca do Guia de bolso, no topo de todas as abas. Os textos podem
 * ser trocados para usar o mesmo campo em outra consulta (ex.: tutorial de
 * Han e Fu).
 */
export function CampoBuscaGuia({
  valor,
  aoMudar,
  rotulo = 'Buscar no Guia de bolso',
  placeholder = 'Buscar termo, yaku ou aba',
  rotuloLimpar = 'Limpar busca',
}: {
  valor: string
  aoMudar: (valor: string) => void
  rotulo?: string
  placeholder?: string
  rotuloLimpar?: string
}) {
  const id = useId()
  return (
    <div className="busca-guia">
      <i className="fas fa-magnifying-glass" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
      />
      {valor && (
        <button
          type="button"
          className="busca-guia__limpar"
          aria-label={rotuloLimpar}
          onClick={() => aoMudar('')}
        >
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      )}
    </div>
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
