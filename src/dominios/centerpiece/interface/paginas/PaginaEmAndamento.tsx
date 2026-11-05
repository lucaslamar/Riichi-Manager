import { useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { agruparAbertas } from '../../logica/encontroClube'
import { ehConvidado, type EntradaLista } from '../../logica/listaClube'
import { CADEIRAS, type Cadeira, type Partida } from '../../logica/partida'
import CardMesa from '../componentes/CardMesa'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import { nomeDoAssento } from '../nomeDoAssento'
import { textoDaPartida } from '../textoPartida'

/**
 * Mesas abertas: as de um encontro do clube agrupadas sob ele, as avulsas soltas
 * como antes. Cada mesa é um card de placar.
 */
export default function PaginaEmAndamento({
  aoVoltar,
  aoAbrirMesa,
  aoNovoSorteio,
}: {
  aoVoltar: () => void
  aoAbrirMesa: (id: string) => void
  aoNovoSorteio: () => void
}) {
  const { t, numero, idioma } = useI18n()
  const { abertas, descartar } = usePartidas()
  const { jogadores } = useJogadores()
  const { encontros, sortear, sortearDeNovo } = useClube()
  const { aviso, mostrar } = useAviso()
  const [paraDescartar, setParaDescartar] = useState<string | null>(null)

  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoAssento(jogadores, partida.assentos[cadeira], (nome) => t('players.deletedName', { name: nome }))
  // Avulsas seguem o número do seletor "Mesa N" do placar; as do encontro, o do sorteio.
  const rotuloDa = (partida: Partida) =>
    t('match.table.number', { number: partida.encontro?.mesa ?? abertas.indexOf(partida) + 1 })

  const compartilhar = async (partida: Partida) => {
    const texto = textoDaPartida(partida, rotuloDa(partida), nomeNa(partida), t, numero)
    const resultado = await compartilharTexto(texto)
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  const novoSorteio = (encontroId: string, partidas: Partida[]) => {
    if (sortearDeNovo(encontroId)) {
      aoNovoSorteio()
      return
    }
    // Encontro que já saiu da memória: refaz com quem está nas mesas dele.
    const jogadoresDasMesas: EntradaLista[] = partidas.flatMap((partida) =>
      CADEIRAS.map((cadeira) => {
        const { jogadorId } = partida.assentos[cadeira]
        const nome = nomeNa(partida)(cadeira)
        return ehConvidado(jogadorId) ? { nome } : { nome, jogadorId }
      }),
    )
    if (sortear(jogadoresDasMesas)) aoNovoSorteio()
  }

  const card = (partida: Partida) => (
    <li key={partida.id}>
      <CardMesa
        partida={partida}
        modo="andamento"
        titulo={rotuloDa(partida)}
        nomeDe={nomeNa(partida)}
        aoAbrir={() => aoAbrirMesa(partida.id)}
        aoCompartilhar={() => void compartilhar(partida)}
        aoExcluir={() => setParaDescartar(partida.id)}
      />
    </li>
  )

  const grupos = agruparAbertas(abertas)

  return (
    <section className="ptd-inicio cm-pagina">
      <TituloTela titulo={t('match.home.inProgress')} aoVoltar={aoVoltar} />
      {abertas.length === 0 ? (
        <p className="ptd-vazio">{t('match.home.noneOpen')}</p>
      ) : (
        <div className="cm-grupos">
          {grupos.map((grupo) => {
            if (grupo.tipo === 'avulsa') {
              return (
                <ul key={grupo.partida.id} className="cm-lista ptd-lista-mesas">
                  {card(grupo.partida)}
                </ul>
              )
            }
            const encontro = encontros.find((item) => item.id === grupo.encontroId)
            const inicio = encontro?.criadoEm ?? grupo.partidas[0].criadaEm
            const data = new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(
              new Date(inicio),
            )
            const idTitulo = `encontro-${grupo.encontroId}`
            return (
              <section key={grupo.encontroId} className="cm-grupo" aria-labelledby={idTitulo}>
                <header className="cm-grupo-topo">
                  <h3 id={idTitulo} className="cm-grupo-titulo">
                    <i className="fas fa-people-group" aria-hidden="true" /> {t('match.club.meeting')}
                    <span className="cm-grupo-apoio">
                      <span className="sr-only"> · </span>
                      <time dateTime={inicio}>{data}</time>
                      {' · '}
                      {t('match.club.tables', { count: grupo.partidas.length })}
                    </span>
                  </h3>
                  <button
                    type="button"
                    className="btn-contorno cm-grupo-botao"
                    aria-label={t('match.club.newDrawLabel')}
                    onClick={() => novoSorteio(grupo.encontroId, grupo.partidas)}
                  >
                    <i className="fas fa-shuffle" aria-hidden="true" /> {t('match.club.newDraw')}
                  </button>
                </header>
                <ul className="cm-lista ptd-lista-mesas">{grupo.partidas.map(card)}</ul>
              </section>
            )
          })}
        </div>
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {paraDescartar && (
        <ModalConfirmacao
          titulo={t('match.home.discardTitle')}
          texto={t('match.home.discardHelp')}
          rotuloConfirmar={t('match.home.discard')}
          perigo
          aoFechar={() => setParaDescartar(null)}
          aoConfirmar={() => {
            descartar(paraDescartar)
            setParaDescartar(null)
          }}
        />
      )}
    </section>
  )
}
