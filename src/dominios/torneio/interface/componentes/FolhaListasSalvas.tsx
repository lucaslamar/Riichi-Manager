import { useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { linhasDoTexto } from '@/dominios/centerpiece/logica/listaClube'
import type { ListaSalva } from '../../logica/tipos'
import '@/dominios/centerpiece/interface/clube.css'
import '../torneio.css'

/** Listas salvas: guardar a lista com um nome ou carregar uma guardada (torneio e clube). */
export default function FolhaListasSalvas({
  listas,
  podeGuardar,
  ultimoEncontro,
  aoUsarNomes,
  aoFechar,
  aoGuardar,
  aoCarregar,
  aoExcluir,
}: {
  listas: readonly ListaSalva[]
  podeGuardar: boolean
  /** Clube: os nomes do último sorteio, para repetir a lista de uma vez. */
  ultimoEncontro?: { criadoEm: string; nomes: string[] }
  aoUsarNomes?: (nomes: string[]) => void
  aoFechar: () => void
  aoGuardar: (nome: string) => void
  aoCarregar: (lista: ListaSalva) => void
  aoExcluir: (lista: ListaSalva) => void
}) {
  const { t, idioma } = useI18n()
  const [nome, setNome] = useState('')
  const contar = (texto: string) => linhasDoTexto(texto).filter(Boolean).length

  return (
    <Modal
      titulo={t('tournament.list.memory')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="trn-folha-memoria"
    >
      {/* Atalho do clube: a lista inteira do último sorteio, convidados inclusive. */}
      {ultimoEncontro && ultimoEncontro.nomes.length > 0 && aoUsarNomes && (
        <button
          type="button"
          className="clb-ultimo-encontro"
          onClick={() => aoUsarNomes(ultimoEncontro.nomes)}
        >
          <i className="fas fa-clock-rotate-left" aria-hidden="true" />
          <span className="clb-ultimo-encontro-texto">
            <strong>{t('match.club.lastDrawNames')}</strong>
            <span className="ptd-apoio">
              <time dateTime={ultimoEncontro.criadoEm}>
                {new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
                  new Date(ultimoEncontro.criadoEm),
                )}
              </time>
              {' · '}
              {ultimoEncontro.nomes.join(', ')}
            </span>
          </span>
          <span className="clb-ultimo-encontro-acao">
            {t('match.club.useNames', { count: ultimoEncontro.nomes.length })}
          </span>
        </button>
      )}
      <form
        className="trn-guardar"
        onSubmit={(evento) => {
          evento.preventDefault()
          if (nome.trim() && podeGuardar) aoGuardar(nome.trim())
        }}
      >
        <label className="trn-data">
          <span>{t('tournament.list.saveAs')}</span>
          <input
            className="trn-campo"
            value={nome}
            placeholder={t('tournament.list.saveExample')}
            onChange={(evento) => setNome(evento.target.value)}
          />
        </label>
        <button type="submit" className="btn-primario" disabled={!nome.trim() || !podeGuardar}>
          {t('tournament.list.save')}
        </button>
      </form>

      <h3 className="ptd-rotulo">{t('tournament.list.savedLists')}</h3>
      {listas.length === 0 ? (
        <p className="ptd-vazio">{t('tournament.list.noSaved')}</p>
      ) : (
        <ul className="cm-lista">
          {listas.map((salva) => (
            <li key={salva.id} className="trn-salva">
              <button type="button" className="trn-card" onClick={() => aoCarregar(salva)}>
                <i className="fas fa-list" aria-hidden="true" />
                <strong>{salva.nome}</strong>
                <span>
                  {t('tournament.history.players', { count: contar(salva.texto) })} ·{' '}
                  {new Intl.DateTimeFormat(idioma, { dateStyle: 'short' }).format(
                    new Date(salva.salvaEm),
                  )}
                </span>
              </button>
              <button
                type="button"
                className="cm-btn-icone cm-btn-icone--perigo"
                aria-label={t('tournament.list.deleteSaved', { name: salva.nome })}
                onClick={() => aoExcluir(salva)}
              >
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
