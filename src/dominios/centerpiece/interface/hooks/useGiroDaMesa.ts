import { useEffect, useState } from 'react'
import { aoMudarAnguloTela, lerAnguloTela } from '@/compartilhado/adaptadores/orientacaoTela'
import { giroDaMesa } from '../../logica/centerpieceSimples'

/** Mantém a mesa apontando para o mesmo lado, mesmo com a rotação do celular ligada. */
export function useGiroDaMesa() {
  const [inicial] = useState(lerAnguloTela)
  const [atual, setAtual] = useState(inicial)
  useEffect(() => aoMudarAnguloTela(() => setAtual(lerAnguloTela())), [])
  return giroDaMesa(inicial, atual)
}
