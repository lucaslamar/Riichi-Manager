/**
 * Camadas abertas por cima do app (modais e o guia Aprender a jogar), da de
 * baixo para a de cima. Só a de cima responde ao Esc e ao Tab: uma camada
 * aberta por cima de outra fecha sozinha e a de baixo continua como estava.
 */
const pilha: object[] = []

export interface CamadaEmpilhada {
  noTopo: () => boolean
  remover: () => void
}

export function empilharCamada(): CamadaEmpilhada {
  const marca = {}
  pilha.push(marca)
  return {
    noTopo: () => pilha[pilha.length - 1] === marca,
    remover: () => {
      const indice = pilha.indexOf(marca)
      if (indice >= 0) pilha.splice(indice, 1)
    },
  }
}

/** Seletor das camadas que cobrem a tela: os gestos de navegação do app não agem com elas abertas. */
export const SELETOR_CAMADAS = '.modal-fundo, .guia-aprender'
