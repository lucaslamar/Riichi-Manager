import { useMemo, useState } from 'react'
import { compartilharTexto } from '@/compartilhado/adaptadores/compartilhar'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import type { Cadeira, Partida } from '../../logica/partida'
import { partidasDoHistorico } from '../../logica/ranking'
import CardMesa from '../componentes/CardMesa'
import ListaResultado from '../componentes/ListaResultado'
import { ListaMaos, ModalConfirmacao } from '../componentes/ModaisPartida'
import { useAviso } from '../hooks/useAviso'
import { usePartidas } from '../hooks/usePartidas'
import { nomeDoAssento } from '../nomeDoAssento'
import { textoDaPartida } from '../textoPartida'

/** Partidas finalizadas; abrir uma mostra o resultado e o histórico de mãos. */
export default function PaginaHistorico({ aoVoltar }: { aoVoltar: () => void }) {
  const { t, idioma, numero } = useI18n()
  const { partidas, descartar } = usePartidas()
  const { jogadores } = useJogadores()
  const { aviso, mostrar } = useAviso()
  const [abertaId, setAbertaId] = useState<string | null>(null)
  const [paraExcluir, setParaExcluir] = useState<string | null>(null)

  const historico = useMemo(() => partidasDoHistorico(partidas), [partidas])
  const aberta = historico.find((partida) => partida.id === abertaId)

  // Quem saiu do cadastro aparece com o nome guardado na partida.
  const nomeNa = (partida: Partida) => (cadeira: Cadeira) =>
    nomeDoAssento(jogadores, partida.assentos[cadeira], (nome) => t('players.deletedName', { name: nome }))
  const data = (iso: string | undefined) =>
    iso
      ? new Intl.DateTimeFormat(idioma, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
      : ''
  /** Mesa do encontro do clube, ou o tipo de partida para as avulsas. */
  const tituloDa = (partida: Partida) =>
    partida.encontro
      ? t('match.table.number', { number: partida.encontro.mesa })
      : t(partida.config.tipoPartida === 'leste' ? 'tableConfig.gameEast' : 'tableConfig.gameHanchan')

  const compartilhar = async (partida: Partida) => {
    const cabecalho = `${tituloDa(partida)} · ${data(partida.finalizadaEm)}`
    const resultado = await compartilharTexto(textoDaPartida(partida, cabecalho, nomeNa(partida), t, numero))
    if (resultado === 'copiado') mostrar(t('match.club.copied'))
    if (resultado === 'falhou') mostrar(t('match.club.shareFailed'))
  }

  if (aberta) {
    return (
      <section className="ptd-inicio ptd-detalhe-historico">
        <TituloTela titulo={data(aberta.finalizadaEm)} aoVoltar={() => setAbertaId(null)} />
        <ListaResultado linhas={aberta.resultado ?? []} nomeDe={nomeNa(aberta)} />
        <h3 className="ptd-rotulo">{t('match.hands.title')}</h3>
        {aberta.registradaManual ? (
          <p className="ptd-vazio">{t('match.manual.noHands')}</p>
        ) : (
          <ListaMaos partida={aberta} nomeDe={nomeNa(aberta)} />
        )}
      </section>
    )
  }

  return (
    <section className="ptd-inicio cm-pagina">
      <TituloTela titulo={t('match.home.history')} aoVoltar={aoVoltar} />
      {historico.length === 0 ? (
        <p className="ptd-vazio">{t('match.history.empty')}</p>
      ) : (
        <ul className="cm-lista ptd-lista-historico">
          {historico.map((partida) => (
            <li key={partida.id}>
              <CardMesa
                partida={partida}
                modo="historico"
                titulo={tituloDa(partida)}
                nomeDe={nomeNa(partida)}
                aoAbrir={() => setAbertaId(partida.id)}
                aoCompartilhar={() => void compartilhar(partida)}
                aoExcluir={() => setParaExcluir(partida.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {aviso && (
        <p className="ptd-aviso" role="status">
          {aviso}
        </p>
      )}

      {paraExcluir && (
        <ModalConfirmacao
          titulo={t('match.cards.deleteTitle')}
          texto={t('match.cards.deleteHelp')}
          rotuloConfirmar={t('players.delete')}
          perigo
          aoFechar={() => setParaExcluir(null)}
          aoConfirmar={() => {
            descartar(paraExcluir)
            setParaExcluir(null)
          }}
        />
      )}
    </section>
  )
}
