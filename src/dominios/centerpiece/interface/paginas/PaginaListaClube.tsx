import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import {
  buscarJogadores,
  nomeExibido,
  ordenarJogadores,
  partesDoNome,
  type Jogador,
} from '@/dominios/jogadores/logica/jogadores'
import {
  acrescentarNomes,
  entradasDaLista,
  jogadorDaLinha,
  limparLista,
  linhasDoTexto,
  sugestoesParaLinha,
} from '../../logica/listaClube'
import { contagemDeMesas } from '../../logica/sorteioClube'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'

/** Altura de cada linha da folha; o marcador e o "Cadastrar" se alinham por ela. */
const ALTURA_LINHA = 48
/** Linhas vazias abaixo do texto, para a folha parecer uma página e não um campo. */
const LINHAS_DE_FOLGA = 3

/**
 * Lista do clube, no estilo bloco de notas: uma folha onde se digita um nome por
 * linha. O texto é o que vale; o vínculo com o cadastro sai do próprio nome.
 */
export default function PaginaListaClube({
  aoVoltar,
  aoSortear,
  aoVerSorteio,
}: {
  aoVoltar: () => void
  aoSortear: () => void
  aoVerSorteio: () => void
}) {
  const { t } = useI18n()
  const { jogadores, adicionar } = useJogadores()
  const { lista, sorteio, definirLista, sortear, limpar } = useClube()
  const { aviso, mostrar } = useAviso()
  const campo = useRef<HTMLTextAreaElement | null>(null)
  const [linhaAtual, setLinhaAtual] = useState<number | null>(null)
  /**
   * Folha de cadastrados aberta: guarda quantos nomes ficam antes do ponto onde os
   * escolhidos entram (a contagem sobrevive à limpeza das linhas vazias no blur).
   */
  const [inserirApos, setInserirApos] = useState<number | null>(null)
  const [limpando, setLimpando] = useState(false)

  const linhas = useMemo(() => linhasDoTexto(lista), [lista])
  const entradas = useMemo(() => entradasDaLista(lista, jogadores), [lista, jogadores])
  const idsNaLista = useMemo(
    () => new Set(entradas.flatMap((entrada) => (entrada.jogadorId ? [entrada.jogadorId] : []))),
    [entradas],
  )
  const contagem = contagemDeMesas(entradas.length)
  const vinculos = useMemo(() => linhas.map((linha) => jogadorDaLinha(jogadores, linha)), [linhas, jogadores])

  const textoDaLinhaAtual = linhaAtual === null ? '' : (linhas[linhaAtual] ?? '')
  const sugestoes =
    linhaAtual === null ? [] : sugestoesParaLinha(jogadores, textoDaLinhaAtual, idsNaLista)

  const avisarRepetidos = (repetidos: number) => {
    if (repetidos > 0) mostrar(t('match.club.duplicatesRemoved', { count: repetidos }))
  }

  /** Linha do cursor, para as sugestões aparecerem logo abaixo dela. */
  const acompanharCursor = () => {
    const elemento = campo.current
    if (!elemento) return
    setLinhaAtual(elemento.value.slice(0, elemento.selectionStart).split('\n').length - 1)
  }

  /** Ao sair do campo: tira linhas vazias e repetidos, avisando o que saiu. */
  const arrumar = () => {
    setLinhaAtual(null)
    const limpa = limparLista(lista, jogadores)
    if (limpa.texto !== lista) definirLista(limpa.texto)
    avisarRepetidos(limpa.repetidos)
  }

  const usarSugestao = (jogador: Jogador) => {
    if (linhaAtual === null) return
    const novas = [...lista.split(/\r?\n/)]
    novas[linhaAtual] = nomeExibido(jogador)
    const texto = novas.join('\n')
    definirLista(texto)
    // Cursor no fim da linha completada, pronto para o Enter do próximo nome.
    const fim = novas.slice(0, linhaAtual + 1).join('\n').length
    requestAnimationFrame(() => {
      campo.current?.focus()
      campo.current?.setSelectionRange(fim, fim)
      setLinhaAtual(linhaAtual)
    })
  }

  const cadastrar = (nome: string) => {
    const resultado = adicionar({ nome })
    mostrar(
      resultado.ok
        ? t('match.club.registered', { name: nome })
        : t(resultado.erro === 'nomeDuplicado' ? 'players.errorDuplicateName' : 'players.errorEmptyName'),
    )
  }

  const iniciarSorteio = () => {
    const limpa = limparLista(lista, jogadores)
    if (limpa.texto !== lista) definirLista(limpa.texto)
    if (sortear(entradasDaLista(limpa.texto, jogadores))) aoSortear()
  }

  /**
   * Linha que ganha o "Usar cadastrado": a do cursor, se estiver vazia; fora do
   * campo, a primeira linha livre depois do último nome.
   */
  const ultimoNome = linhas.reduce((ultimo, linha, indice) => (linha ? indice : ultimo), -1)
  const linhaUsarCadastrado =
    linhaAtual === null ? ultimoNome + 1 : linhas[linhaAtual] === '' ? linhaAtual : null

  const abrirCadastrados = (linha: number) =>
    setInserirApos(linhas.slice(0, linha).filter(Boolean).length)

  const totalDeLinhas = Math.max(linhas.length + LINHAS_DE_FOLGA, 8)
  const estiloFolha = {
    '--clb-linha': `${ALTURA_LINHA}px`,
    '--clb-linhas': totalDeLinhas,
  } as CSSProperties

  return (
    <section className="clb-lista">
      <TituloTela
        titulo={t('match.club.listTitle')}
        aoVoltar={aoVoltar}
        acoes={
          <button
            type="button"
            className="cm-btn-icone cm-btn-icone--perigo clb-btn-titulo"
            aria-label={t('match.club.clear')}
            title={t('match.club.clear')}
            disabled={!lista.trim() && !sorteio}
            onClick={() => setLimpando(true)}
          >
            <i className="fas fa-trash" aria-hidden="true" />
          </button>
        }
      />

      {sorteio && (
        <button type="button" className="clb-ultimo-sorteio" onClick={aoVerSorteio}>
          <i className="fas fa-table-cells-large" aria-hidden="true" />
          <span>{t('match.club.lastDraw', { count: sorteio.mesas.length })}</span>
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>
      )}

      <div className="clb-folha" style={estiloFolha}>
        <ol className="clb-marcadores" aria-hidden="true">
          {linhas.map((linha, indice) => (
            <li key={indice}>
              {vinculos[indice] ? (
                <span className="clb-marcador" title={t('match.club.linkedShort')}>
                  <i className="fas fa-user" />
                </span>
              ) : linha ? (
                <span className="clb-marcador clb-marcador--convidado" title={t('match.club.guestShort')}>
                  <i className="far fa-user" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <textarea
          ref={campo}
          className="clb-campo"
          value={lista}
          rows={totalDeLinhas}
          wrap="off"
          spellCheck={false}
          autoCapitalize="words"
          autoComplete="off"
          enterKeyHint="next"
          placeholder={t('match.club.placeholder')}
          aria-label={t('match.club.editorLabel')}
          aria-describedby="clb-contagem"
          onChange={(evento) => {
            definirLista(evento.target.value)
            acompanharCursor()
          }}
          onSelect={acompanharCursor}
          onFocus={acompanharCursor}
          onBlur={arrumar}
        />

        {/*
          Ações discretas na linha: "Usar cadastrado" na linha vazia e "Cadastrar"
          para quem digitou um nome fora do cadastro. Não tiram o foco do texto.
        */}
        <div className="clb-acoes-linhas">
          {linhaUsarCadastrado !== null && (
            <button
              type="button"
              className="clb-cadastrar"
              style={{ top: linhaUsarCadastrado * ALTURA_LINHA }}
              aria-label={t('match.club.addRegisteredLabel')}
              onPointerDown={(evento) => evento.preventDefault()}
              onClick={() => abrirCadastrados(linhaUsarCadastrado)}
            >
              {t('match.club.addRegistered')}
            </button>
          )}
          {linhas.map((linha, indice) =>
            linha && !vinculos[indice] ? (
              <button
                key={`${indice}-${linha}`}
                type="button"
                className="clb-cadastrar"
                style={{ top: indice * ALTURA_LINHA }}
                aria-label={t('match.club.registerNamed', { name: linha })}
                onPointerDown={(evento) => evento.preventDefault()}
                onClick={() => cadastrar(linha)}
              >
                {t('match.club.register')}
              </button>
            ) : null,
          )}
        </div>

        {sugestoes.length > 0 && linhaAtual !== null && (
          <ul
            className="clb-sugestoes"
            style={{ top: (linhaAtual + 1) * ALTURA_LINHA }}
            aria-label={t('match.club.suggestions')}
          >
            {sugestoes.map((jogador) => (
              <li key={jogador.id}>
                <button
                  type="button"
                  aria-label={t('match.club.suggestionLabel', { name: nomeExibido(jogador) })}
                  onPointerDown={(evento) => evento.preventDefault()}
                  onClick={() => usarSugestao(jogador)}
                >
                  <i className="fas fa-user" aria-hidden="true" />
                  <span>{nomeExibido(jogador)}</span>
                  {partesDoNome(jogador).apoio && nomeExibido(jogador) !== partesDoNome(jogador).apoio && (
                    <small>{partesDoNome(jogador).apoio}</small>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Para leitor de tela: quem está na lista e quem entra como convidado. */}
      <ul className="sr-only" aria-label={t('match.club.listSummary')}>
        {entradas.map((entrada) => (
          <li key={entrada.jogadorId ?? entrada.nome}>
            {t(entrada.jogadorId ? 'match.club.linked' : 'match.club.guest', { name: entrada.nome })}
          </li>
        ))}
      </ul>

      <div className="ptd-rodape-fixo clb-rodape">
        <p id="clb-contagem" className="clb-contagem" aria-live="polite">
          <strong>
            {entradas.length === 0
              ? t('match.club.empty')
              : `${t('match.club.players', { count: entradas.length })} · ${t('match.club.tables', { count: contagem.mesas })}`}
          </strong>
          {!contagem.podeSortear && (
            <span className="clb-falta">
              {entradas.length < 4
                ? t('match.club.minimum', { count: 4 - entradas.length })
                : `${t('match.club.missing', { count: contagem.faltam })}, ${t('match.club.leftover', { count: contagem.sobram })}`}
            </span>
          )}
        </p>
        <button
          type="button"
          className="btn-primario ptd-btn-largo"
          disabled={!contagem.podeSortear}
          onClick={iniciarSorteio}
        >
          <i className="fas fa-shuffle" aria-hidden="true" /> {t('match.club.draw')}
        </button>
      </div>

      {aviso && (
        <p className="ptd-aviso clb-aviso" role="status">
          {aviso}
        </p>
      )}

      {inserirApos !== null && (
        <FolhaCadastrados
          idsNaLista={idsNaLista}
          aoFechar={() => setInserirApos(null)}
          aoConfirmar={(escolhidos) => {
            const resultado = acrescentarNomes(lista, escolhidos.map(nomeExibido), jogadores, inserirApos)
            definirLista(resultado.texto)
            avisarRepetidos(resultado.repetidos)
            setInserirApos(null)
          }}
        />
      )}

      {limpando && (
        <ModalConfirmacao
          titulo={t('match.club.clearTitle')}
          texto={t('match.club.clearHelp')}
          rotuloConfirmar={t('match.club.clear')}
          perigo
          aoFechar={() => setLimpando(false)}
          aoConfirmar={() => {
            limpar()
            setLimpando(false)
          }}
        />
      )}
    </section>
  )
}

/** Folha inferior com o cadastro: busca e seleção de vários de uma vez. */
function FolhaCadastrados({
  idsNaLista,
  aoFechar,
  aoConfirmar,
}: {
  idsNaLista: ReadonlySet<string>
  aoFechar: () => void
  aoConfirmar: (jogadores: Jogador[]) => void
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
