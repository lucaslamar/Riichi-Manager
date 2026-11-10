import { useI18n } from '@/compartilhado/i18n/I18nProvider'
import Modal from '@/compartilhado/interface/componentes/modal/Modal'
import type { detalheDoConfronto } from '../../../logica/analiseJogador'

/** Bottom sheet do nó tocado no mapa: o confronto direto dos dois, lado a lado. */
export default function FolhaConfronto({
  eu,
  outro,
  detalhe,
  aoAnalisar,
  aoFechar,
}: {
  eu: string
  outro: string
  detalhe: ReturnType<typeof detalheDoConfronto>
  aoAnalisar: () => void
  aoFechar: () => void
}) {
  const { t, numero } = useI18n()
  const comSinal = (valor: number) => `${valor > 0 ? '+' : ''}${numero(valor)}`
  const linhas: { rotulo: string; a: string; b: string }[] = [
    {
      rotulo: t('match.player.duel.averagePlace'),
      a: detalhe.a.mediaColocacao === null ? '—' : numero(detalhe.a.mediaColocacao),
      b: detalhe.b.mediaColocacao === null ? '—' : numero(detalhe.b.mediaColocacao),
    },
    { rotulo: t('match.player.duel.score'), a: comSinal(detalhe.a.pontuacao), b: comSinal(detalhe.b.pontuacao) },
    { rotulo: t('match.player.duel.tobi'), a: numero(detalhe.a.mandouProTobi), b: numero(detalhe.b.mandouProTobi) },
  ]

  return (
    <Modal titulo={outro} aoFechar={aoFechar} rotuloFechar={t('actions.close')} tamanho="pequena">
      <div className="anl-folha">
        <p className="anl-folha-juntos">{t('match.player.duel.together', { count: detalhe.partidas })}</p>
        <p className="anl-placar">
          <span>{eu}</span>
          <strong>
            {numero(detalhe.a.vitorias)}–{numero(detalhe.b.vitorias)}
          </strong>
          <span>{outro}</span>
        </p>
        <table className="anl-tabela">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">{t('match.player.duel.stat')}</span>
              </th>
              <th scope="col">{eu}</th>
              <th scope="col">{outro}</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.rotulo}>
                <th scope="row">{linha.rotulo}</th>
                <td>{linha.a}</td>
                <td>{linha.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="anl-nota">{t('match.player.duel.tobiHelp')}</p>
        <button type="button" className="btn-primario anl-analisar" onClick={aoAnalisar}>
          {t('match.player.analyze', { name: outro })}
        </button>
      </div>
    </Modal>
  )
}
