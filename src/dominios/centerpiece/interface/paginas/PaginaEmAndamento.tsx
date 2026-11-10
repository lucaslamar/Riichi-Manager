import { useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import { useTorneios } from '@/dominios/torneio/interface/hooks/useTorneios'
import { useSubtituloTorneio } from '@/dominios/torneio/interface/textoTorneio'
import { mesasRegistradas } from '../../logica/encontroClube'
import type { FiltroTipoMesa } from '../../logica/tipoDaMesa'
import FiltroTipo from '../componentes/FiltroTipo'
import type { Cadeira, Partida } from '../../logica/partida'
import CardMesa from '../componentes/CardMesa'
import { ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { useClube } from '../hooks/useClube'
import { usePartidas } from '../hooks/usePartidas'
import { nomeDoAssento } from '../nomeDoAssento'
import { textoDaPartida } from '../textoPartida'

/**
 * O que está em andamento: partidas avulsas abertas no placar, o encontro do
 * clube com mesas sem resultado e os torneios em jogo. Um filtro separa os três.
 * Clube e torneio só registram o resultado: o card abre as mesas deles. Mesa de
 * clube aberta no placar (de versões antigas) entra como partida, para terminar
 * ou descartar.
 */
export default function PaginaEmAndamento({
  aoVoltar,
  aoAbrirMesa,
  aoAbrirSorteio,
  aoAbrirTorneio,
}: {
  aoVoltar: () => void
  aoAbrirMesa: (id: string) => void
  aoAbrirSorteio: () => void
  aoAbrirTorneio: (id: string) => void
}) {
  const { t, numero, idioma } = useI18n()
  const { partidas, abertas, descartar } = usePartidas()
  const { jogadores } = useJogadores()
  const { sorteio } = useClube()
  const { torneios } = useTorneios()
  const subtituloTorneio = useSubtituloTorneio()
  const [filtro, setFiltro] = useState<FiltroTipoMesa>('todas')
  const torneiosEmJogo = torneios.filter((torneio) => torneio.status === 'em_andamento' && !torneio.transferidoEm)
  const registradas = sorteio ? mesasRegistradas(sorteio, partidas) : 0
  const sorteioPendente = sorteio && registradas < sorteio.mesas.length ? sorteio : null
  const mostra = (tipo: FiltroTipoMesa) => filtro === 'todas' || filtro === tipo
  const dataHora = (iso: string) =>
    new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  const { aviso, mostrar } = useAviso()
  const [paraDescartar, setParaDescartar] = useState<string | null>(null)

  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoAssento(jogadores, partida.assentos[cadeira], (nome) => t('players.deletedName', { name: nome }))
  // O mesmo número do seletor "Mesa N" do placar.
  const rotuloDa = (partida: Partida) => t('match.table.number', { number: abertas.indexOf(partida) + 1 })

  const compartilhar = async (partida: Partida) => {
    const texto = textoDaPartida(partida, rotuloDa(partida), nomeNa(partida), t, numero)
    const resultado = await compartilharTexto(texto)
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
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

  // Mesas abertas no placar: todas são partidas (clube e torneio só registram resultado).
  const mesas = mostra('avulsa') ? abertas : []
  const nada = abertas.length === 0 && !sorteioPendente && torneiosEmJogo.length === 0
  const vazioNoFiltro =
    !nada && mesas.length === 0 && !(sorteioPendente && mostra('clube')) && !(torneiosEmJogo.length && mostra('torneio'))

  return (
    <section className="ptd-inicio cm-pagina">
      <TituloTela titulo={t('match.home.inProgress')} aoVoltar={aoVoltar} />
      {!nada && <FiltroTipo valor={filtro} aoMudar={setFiltro} />}
      {nada || vazioNoFiltro ? (
        <p className="ptd-vazio">{t('match.home.noneOpen')}</p>
      ) : (
        <div className="cm-grupos">
          {mostra('torneio') &&
            torneiosEmJogo.map((torneio) => (
              <button
                key={torneio.id}
                type="button"
                className="cm-andamento-item"
                onClick={() => aoAbrirTorneio(torneio.id)}
              >
                <i className="fas fa-trophy" aria-hidden="true" />
                <span>
                  <strong>{torneio.nome}</strong>
                  <small>{subtituloTorneio(torneio)}</small>
                </span>
                <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
            ))}
          {mostra('clube') && sorteioPendente && (
            <button type="button" className="cm-andamento-item" onClick={aoAbrirSorteio}>
              <i className="fas fa-people-group" aria-hidden="true" />
              <span>
                <strong>{t('match.club.meeting')}</strong>
                <small>
                  {dataHora(sorteioPendente.encontro.criadoEm)} ·{' '}
                  {t('match.types.registeredOf', { count: registradas, total: sorteioPendente.mesas.length })}
                </small>
              </span>
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          )}
          {mesas.length > 0 && <ul className="cm-lista ptd-lista-mesas">{mesas.map(card)}</ul>}
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
