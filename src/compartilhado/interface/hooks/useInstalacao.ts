import { useEffect, useState } from 'react'
import {
  aoMudarInstalacao,
  ehIos,
  estaInstalado,
  podeInstalar,
  pedirInstalacao,
} from '@/compartilhado/adaptadores/instalacao'

/** Como oferecer a instalação aqui: pelo botão do navegador, por instrução ou de jeito nenhum. */
export function useInstalacao() {
  const [, atualizar] = useState(0)
  useEffect(() => aoMudarInstalacao(() => atualizar((versao) => versao + 1)), [])

  const modo: 'botao' | 'instrucao' | null = estaInstalado()
    ? null
    : podeInstalar()
      ? 'botao'
      : ehIos()
        ? 'instrucao'
        : null

  return { modo, instalar: pedirInstalacao }
}
