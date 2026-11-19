import { useEffect, useRef, useSyncExternalStore } from 'react'
import {
  alterarNarracao,
  assinarNarracao,
  lerNarracao,
  narrar,
  registrarLeitura,
} from '@/compartilhado/adaptadores/voz'

export function useConfigNarracao() {
  return { config: useSyncExternalStore(assinarNarracao, lerNarracao), alterar: alterarNarracao }
}

/**
 * Narra o que mudou em `valor`: `descrever` recebe o anterior e o atual e devolve a
 * frase (ou várias). A primeira vez só guarda o valor, sem falar.
 */
export function useNarrarMudanca<T>(valor: T, descrever: (anterior: T, atual: T) => string | string[]) {
  const anterior = useRef<{ valor: T } | null>(null)
  const { ativa } = useConfigNarracao().config
  useEffect(() => {
    const antes = anterior.current
    anterior.current = { valor }
    if (!antes || !ativa || Object.is(antes.valor, valor)) return
    const frases = descrever(antes.valor, valor)
    narrar(Array.isArray(frases) ? frases.join('. ') : frases)
    // Só a mudança do valor narra; `descrever` é recriada a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, ativa])
}

/** Leitura que o atalho (ex.: Alt+M) pede enquanto a tela está aberta. */
export function useLeituraSobDemanda(chave: string, ler: () => string) {
  const atual = useRef(ler)
  atual.current = ler
  useEffect(() => registrarLeitura(chave, () => atual.current()), [chave])
}
