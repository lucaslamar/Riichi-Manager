import { useMemo, useState } from 'react'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import { buscarJogadores, ordenarJogadores, type Jogador } from '../../logica/jogadores'
import FormJogador from '../componentes/FormJogador'
import { useJogadores } from '../hooks/useJogadores'
import '../jogadores.css'

/** Formulário aberto: jogador novo ou o que está sendo renomeado. */
type Edicao = { tipo: 'novo' } | { tipo: 'editar'; jogador: Jogador }

export default function PaginaJogadores() {
  const { t, idioma } = useI18n()
  const { jogadores, adicionar, editar, arquivar, restaurar } = useJogadores()
  const [busca, setBusca] = useState('')
  const [verArquivados, setVerArquivados] = useState(false)
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [paraArquivar, setParaArquivar] = useState<Jogador | null>(null)

  const encontrados = useMemo(
    () => ordenarJogadores(buscarJogadores(jogadores, busca), idioma),
    [jogadores, busca, idioma],
  )
  const ativos = encontrados.filter((jogador) => !jogador.arquivado)
  const arquivados = encontrados.filter((jogador) => jogador.arquivado)

  return (
    <section className="card pagina-jogadores">
      <div className="cabecalho-secao">
        <i className="fas fa-users icone-secao" aria-hidden="true" />
        <div>
          <h2>{t('players.title')}</h2>
          <p className="subtitulo-secao">{t('players.subtitle')}</p>
        </div>
      </div>

      <div className="barra-jogadores">
        <input
          className="entrada-jogador"
          type="search"
          value={busca}
          placeholder={t('players.search')}
          aria-label={t('players.search')}
          autoComplete="off"
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <button type="button" className="btn-primario" onClick={() => setEdicao({ tipo: 'novo' })}>
          <i className="fas fa-plus" aria-hidden="true" />
          {t('players.add')}
        </button>
      </div>

      {ativos.length === 0 ? (
        <p className="vazio-jogadores">{busca ? t('players.noResults') : t('players.empty')}</p>
      ) : (
        <ul className="lista-jogadores">
          {ativos.map((jogador) => (
            <li key={jogador.id} className="linha-cadastro">
              <div className="dados-jogador">
                <span className="nome-cadastro">{jogador.nome}</span>
                {jogador.apelido && <span className="apelido-jogador">{jogador.apelido}</span>}
              </div>
              <button
                type="button"
                className="acao-jogador"
                aria-label={t('players.renameNamed', { name: jogador.nome })}
                title={t('players.rename')}
                onClick={() => setEdicao({ tipo: 'editar', jogador })}
              >
                <i className="fas fa-pen" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="acao-jogador"
                aria-label={t('players.archiveNamed', { name: jogador.nome })}
                title={t('players.archive')}
                onClick={() => setParaArquivar(jogador)}
              >
                <i className="fas fa-box-archive" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {arquivados.length > 0 && (
        <div className="arquivados-jogadores">
          <button
            type="button"
            className="botao-arquivados"
            aria-expanded={verArquivados}
            onClick={() => setVerArquivados((aberto) => !aberto)}
          >
            <i className={`fas fa-chevron-${verArquivados ? 'down' : 'right'}`} aria-hidden="true" />
            {t('players.archivedCount', { count: arquivados.length })}
          </button>
          {verArquivados && (
            <ul className="lista-jogadores">
              {arquivados.map((jogador) => (
                <li key={jogador.id} className="linha-cadastro linha-cadastro--arquivada">
                  <div className="dados-jogador">
                    <span className="nome-cadastro">{jogador.nome}</span>
                    {jogador.apelido && <span className="apelido-jogador">{jogador.apelido}</span>}
                  </div>
                  <button
                    type="button"
                    className="acao-jogador"
                    aria-label={t('players.restoreNamed', { name: jogador.nome })}
                    title={t('players.restore')}
                    onClick={() => restaurar(jogador.id)}
                  >
                    <i className="fas fa-rotate-left" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {edicao && (
        <Modal
          titulo={edicao.tipo === 'novo' ? t('players.new') : t('players.rename')}
          aoFechar={() => setEdicao(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          className="modal-folha"
        >
          <FormJogador
            inicial={edicao.tipo === 'editar' ? edicao.jogador : undefined}
            aoCancelar={() => setEdicao(null)}
            aoSalvar={(dados) => {
              const resultado =
                edicao.tipo === 'novo' ? adicionar(dados) : editar(edicao.jogador.id, dados)
              if (resultado.ok) setEdicao(null)
              return resultado
            }}
          />
        </Modal>
      )}

      {paraArquivar && (
        <Modal
          titulo={t('players.archiveTitle', { name: paraArquivar.nome })}
          aoFechar={() => setParaArquivar(null)}
          rotuloFechar={t('actions.close')}
          tamanho="pequena"
          className="modal-folha"
          rodape={
            <div className="acoes-form-jogador">
              <button type="button" className="btn-contorno" onClick={() => setParaArquivar(null)}>
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={() => {
                  arquivar(paraArquivar.id)
                  setParaArquivar(null)
                }}
              >
                {t('players.archive')}
              </button>
            </div>
          }
        >
          <p>{t('players.archiveHelp')}</p>
        </Modal>
      )}
    </section>
  )
}
