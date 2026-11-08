import { useMemo, useState } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  buscarJogadores,
  nomeExibido,
  ordenarJogadores,
  partesDoNome,
  type Jogador,
} from '@/dominios/jogadores/logica/jogadores'
import '../clube.css'

/** Folha inferior com o cadastro: busca e seleção de vários de uma vez. */
export default function FolhaCadastrados({
  idsNaLista,
  ultimoEncontro,
  aoFechar,
  aoConfirmar,
  aoUsarNomes,
}: {
  idsNaLista: ReadonlySet<string>
  /** Nomes do encontro mais recente, para repetir a lista de uma vez. */
  ultimoEncontro?: { criadoEm: string; nomes: string[] }
  aoFechar: () => void
  aoConfirmar: (jogadores: Jogador[]) => void
  aoUsarNomes: (nomes: string[]) => void
}) {
  const { t, idioma } = useI18n()
  const { jogadores } = useJogadores()
  const [busca, setBusca] = useState('')
  const [escolhidos, setEscolhidos] = useState<string[]>([])

  const visiveis = useMemo(
    () =>
      ordenarJogadores(
        buscarJogadores(
          jogadores.filter((jogador) => !jogador.arquivado),
          busca,
        ),
        idioma,
      ),
    [jogadores, busca, idioma],
  )

  const alternar = (id: string) =>
    setEscolhidos((atuais) => (atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id]))

  return (
    <Modal
      titulo={t('match.club.registeredTitle')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      className="seletor-jogador clb-folha-cadastrados"
      rodape={
        <div className="ptd-acoes-folha">
          <button type="button" className="btn-contorno" onClick={aoFechar}>
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            className="btn-primario"
            disabled={escolhidos.length === 0}
            onClick={() =>
              // Na ordem em que foram tocados, que é a ordem em que chegaram.
              aoConfirmar(
                escolhidos.flatMap((id) => jogadores.find((jogador) => jogador.id === id) ?? []),
              )
            }
          >
            {t('match.club.addSelected', { count: escolhidos.length })}
          </button>
        </div>
      }
    >
      {/* Atalho: a lista inteira do último encontro, convidados inclusive. */}
      {ultimoEncontro && ultimoEncontro.nomes.length > 0 && (
        <button type="button" className="clb-ultimo-encontro" onClick={() => aoUsarNomes(ultimoEncontro.nomes)}>
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
      <input
        className="entrada-jogador"
        type="search"
        value={busca}
        placeholder={t('players.search')}
        aria-label={t('players.search')}
        autoComplete="off"
        onChange={(evento) => setBusca(evento.target.value)}
      />
      {visiveis.length === 0 ? (
        <p className="vazio-jogadores">{busca ? t('players.noResults') : t('players.empty')}</p>
      ) : (
        <ul className="lista-seletor-jogador clb-lista-cadastrados">
          {visiveis.map((jogador) => {
            const naLista = idsNaLista.has(jogador.id)
            const marcado = naLista || escolhidos.includes(jogador.id)
            return (
              <li key={jogador.id}>
                <label className={`opcao-seletor-jogador clb-opcao${naLista ? ' clb-opcao--na-lista' : ''}`}>
                  <input
                    type="checkbox"
                    aria-label={nomeExibido(jogador)}
                    checked={marcado}
                    disabled={naLista}
                    onChange={() => alternar(jogador.id)}
                  />
                  <span className="dados-jogador">
                    <span className="nome-cadastro">
                      {partesDoNome(jogador).principal}
                      {jogador.clube && <small className="clube-jogador"> {jogador.clube}</small>}
                    </span>
                    {partesDoNome(jogador).apoio && (
                      <span className="apelido-jogador">{partesDoNome(jogador).apoio}</span>
                    )}
                  </span>
                  {naLista && <span className="selo-jogador">{t('match.club.alreadyInList')}</span>}
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
