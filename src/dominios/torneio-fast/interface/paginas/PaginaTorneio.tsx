import { useTorneios } from '../hooks/useTorneios'
import AssistenteTorneio from './AssistenteTorneio'
import PainelTorneio from './PainelTorneio'
import '../torneio.css'

/** Com torneio em andamento, a grade; sem ele, a criação. */
export default function PaginaTorneio({
  aoVoltar,
  aoAbrirPartida,
}: {
  aoVoltar: () => void
  aoAbrirPartida: (id: string) => void
}) {
  const { ativo } = useTorneios()
  return ativo ? (
    <PainelTorneio torneio={ativo} aoVoltar={aoVoltar} aoAbrirPartida={aoAbrirPartida} />
  ) : (
    <AssistenteTorneio aoVoltar={aoVoltar} />
  )
}
