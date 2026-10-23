import type { ItemGlossario, PedrasGlossario, SecaoGlossario } from '../../../logica/glossario'
import { parseMpsz, parseMpszGrupos } from '../../../logica/yakus'
import { CiclosDora, PedrasExemplo } from '../yakus/PedrasExemplo'
import TextoGlossario from './TextoGlossario'
import './bloco-glossario.css'

function PedrasItem({ pedras, rotulo }: { pedras: PedrasGlossario; rotulo: string }) {
  if (pedras.tipo === 'ciclosDora') return <CiclosDora />
  return (
    <PedrasExemplo
      grupos={pedras.numerar ? [parseMpsz(pedras.mpsz)] : parseMpszGrupos(pedras.mpsz)}
      rotulo={rotulo}
      numerar={pedras.numerar}
    />
  )
}

function Item({
  item,
  secao,
  destacado,
}: {
  item: ItemGlossario
  secao: string
  destacado: boolean
}) {
  return (
    <div className={`glossario-item${destacado ? ' glossario-item--destaque' : ''}`}>
      <h4 className="glossario-item__nome">
        {item.nome}
        {item.kanji && (
          <>
            {' '}
            <span className="glossario-kanji" lang="ja">
              {item.kanji}
            </span>
          </>
        )}
        {item.apelido && <span className="glossario-item__apelido"> • {item.apelido}</span>}
      </h4>
      {item.texto && (
        <p className="glossario-item__texto">
          <TextoGlossario texto={item.texto} secao={secao} />
        </p>
      )}
      {item.topicos && (
        <ul className="glossario-item__topicos">
          {item.topicos.map((topico) => (
            <li key={topico}>
              <TextoGlossario texto={topico} secao={secao} />
            </li>
          ))}
        </ul>
      )}
      {item.pedras && <PedrasItem pedras={item.pedras} rotulo={`Exemplo: ${item.nome}`} />}
      {item.nota && (
        <p className="glossario-item__nota">
          <i className="fas fa-circle-info" aria-hidden="true" />{' '}
          <TextoGlossario texto={item.nota} secao={secao} />
        </p>
      )}
    </div>
  )
}

/**
 * Um assunto do glossário num bloco só: título, abertura e itens
 * (subtítulos). Na aba Glossário vem como cartão com título; na tela de termo, o
 * título já está no cabeçalho da modal e o item tocado vem destacado.
 */
export default function BlocoGlossario({
  secao,
  destaque,
  comTitulo = true,
}: {
  secao: SecaoGlossario
  /** Id do item a destacar. */
  destaque?: string
  comTitulo?: boolean
}) {
  return (
    <section className={`glossario-bloco${comTitulo ? ' glossario-bloco--cartao' : ''}`}>
      {comTitulo && <TituloSecaoGlossario secao={secao} como="h3" />}
      {secao.intro && (
        <p className="glossario-bloco__intro">
          <TextoGlossario texto={secao.intro} secao={secao.id} />
        </p>
      )}
      {secao.itens.map((item) => (
        <Item key={item.id} item={item} secao={secao.id} destacado={item.id === destaque} />
      ))}
    </section>
  )
}

/** Título do assunto com kanji (no bloco ou no cabeçalho da modal). */
export function TituloSecaoGlossario({
  secao,
  como: Tag = 'span',
}: {
  secao: SecaoGlossario
  como?: 'h3' | 'span'
}) {
  return (
    <Tag className={Tag === 'h3' ? 'glossario-bloco__titulo' : undefined}>
      {secao.titulo}
      {secao.kanji && (
        <>
          {' '}
          <span className="glossario-kanji" lang="ja">
            {secao.kanji}
          </span>
        </>
      )}
    </Tag>
  )
}
