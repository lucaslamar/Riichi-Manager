import { useState } from 'react'
import { gerarId } from '@/compartilhado/adaptadores/identificador'
import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import TituloTela from '@/compartilhado/interface/layout/TituloTela'
import Segmentado from '@/dominios/calculadora-mao-chinesa/interface/Segmentado'
import { useJogadores } from '@/dominios/jogadores/interface/hooks/useJogadores'
import type { PlacarMcr } from '../logica/placar'
import {
  classificacao,
  DURACAO_SESSAO_PADRAO_MIN,
  novoTorneio,
  type TorneioMcr,
} from '../logica/torneio'
import { nomeDaCadeira } from './nomes'
import { acoesTorneiosMcr } from './useTorneiosMcr'

const OPCOES_DURACAO_MIN = [0, 60, 90, 120, 150] as const

/** Criar um torneio MCR: nome e tempo de cada sessão. */
export function ModalNovoTorneioMcr({
  aoCriar,
  aoFechar,
}: {
  aoCriar: (torneio: TorneioMcr) => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const [nome, setNome] = useState('')
  const [duracao, setDuracao] = useState<number>(DURACAO_SESSAO_PADRAO_MIN)
  const criar = () => {
    const torneio = novoTorneio(
      gerarId(),
      nome || t('placar.mcr.torneio.nomePadrao'),
      duracao,
      new Date().toISOString(),
    )
    acoesTorneiosMcr.criar(torneio)
    aoCriar(torneio)
  }
  return (
    <Modal
      titulo={t('placar.mcr.torneio.novo')}
      aoFechar={aoFechar}
      rotuloFechar={t('actions.close')}
      tamanho="pequena"
      rodape={
        <button type="button" className="btn-primario" onClick={criar}>
          {t('placar.mcr.torneio.criar')}
        </button>
      }
    >
      <div className="placar-mcr__formulario">
        <label className="placar-mcr__rotulo" htmlFor="torneio-mcr-nome">
          {t('placar.mcr.torneio.nome')}
        </label>
        <input
          id="torneio-mcr-nome"
          className="placar-mcr__campo"
          value={nome}
          placeholder={t('placar.mcr.torneio.nomePadrao')}
          onChange={(evento) => setNome(evento.target.value)}
        />
        <span className="placar-mcr__rotulo">{t('placar.mcr.torneio.duracao')}</span>
        <Segmentado
          rotulo={t('placar.mcr.torneio.duracao')}
          valor={duracao}
          aoMudar={setDuracao}
          opcoes={OPCOES_DURACAO_MIN.map((minutos) => ({
            valor: minutos,
            rotulo: minutos
              ? t('placar.mcr.torneio.minutos', { minutos: numero(minutos) })
              : t('placar.mcr.torneio.semLimite'),
          }))}
        />
        <p className="placar-mcr__ajuda">{t('placar.mcr.torneio.regra')}</p>
      </div>
    </Modal>
  )
}

/**
 * Torneio MCR: classificação por pontos de mesa (4, 2, 1 e 0, divididos no empate),
 * desempate pela soma das partidas, e as mesas do torneio.
 */
export default function TorneioMcrTela({
  torneio,
  placares,
  aoVoltar,
  aoNovaMesa,
  aoAbrirMesa,
  linha: LinhaMesa,
}: {
  torneio: TorneioMcr
  placares: readonly PlacarMcr[]
  aoVoltar: () => void
  aoNovaMesa: () => void
  aoAbrirMesa: (id: string) => void
  linha: (props: { placar: PlacarMcr; aoAbrir: () => void }) => JSX.Element
}) {
  const { t, numero } = useI18n()
  const { jogadores } = useJogadores()
  const mesas = placares.filter((placar) => placar.torneio?.id === torneio.id)
  const tabela = classificacao(torneio.id, placares)
  const encerrado = !!torneio.encerradoEm
  const formatar = (valor: number) => numero(Math.round(valor * 100) / 100)

  return (
    <section className="ptd-inicio">
      <TituloTela titulo={torneio.nome} aoVoltar={aoVoltar} />

      <p className="placar-mcr__ajuda">
        {torneio.duracaoSessaoMin
          ? t('placar.mcr.torneio.sessao', { minutos: numero(torneio.duracaoSessaoMin) })
          : t('placar.mcr.torneio.sessaoSemLimite')}
      </p>

      <h3 className="placar-mcr__titulo">{t('placar.mcr.torneio.classificacao')}</h3>
      {tabela.length === 0 ? (
        <p className="placar-mcr__ajuda">{t('placar.mcr.torneio.semMesas')}</p>
      ) : (
        <div className="placar-mcr__tabela">
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{t('placar.mcr.torneio.jogador')}</th>
                <th scope="col">{t('placar.mcr.torneio.pontosMesa')}</th>
                <th scope="col">{t('placar.mcr.torneio.pontosPartidas')}</th>
                <th scope="col">{t('placar.mcr.torneio.mesas')}</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map((linha, indice) => (
                <tr key={linha.jogadorId}>
                  <td>{numero(indice + 1)}</td>
                  <th scope="row">
                    {nomeDaCadeira(jogadores, linha.jogadorId, t('placar.mcr.jogadorRemovido'))}
                  </th>
                  <td>{formatar(linha.pontosMesa)}</td>
                  <td>{numero(linha.pontosPartidas)}</td>
                  <td>{numero(linha.mesas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!encerrado && (
        <button type="button" className="btn-primario ptd-btn-largo" onClick={aoNovaMesa}>
          <i className="fas fa-plus" aria-hidden="true" /> {t('placar.mcr.torneio.novaMesa')}
        </button>
      )}

      <h3 className="placar-mcr__titulo placar-mcr__ultimas">
        {t('placar.mcr.torneio.mesasTitulo')}
      </h3>
      {mesas.length === 0 && <p className="placar-mcr__ajuda">{t('placar.mcr.nenhumaPartida')}</p>}
      <ul className="placar-mcr__lista">
        {mesas.map((placar) => (
          <LinhaMesa key={placar.id} placar={placar} aoAbrir={() => aoAbrirMesa(placar.id)} />
        ))}
      </ul>

      {!encerrado && (
        <button
          type="button"
          className="btn-contorno placar-mcr__apagar-tudo"
          onClick={() => {
            if (!window.confirm(t('placar.mcr.torneio.confirmarEncerrar'))) return
            acoesTorneiosMcr.atualizar(torneio.id, (atual) => ({
              ...atual,
              encerradoEm: new Date().toISOString(),
            }))
          }}
        >
          {t('placar.mcr.torneio.encerrar')}
        </button>
      )}
    </section>
  )
}
