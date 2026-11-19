/**
 * Avisa ao card de modo de jogo se a calculadora chinesa tem pedras na mão:
 * trocar de modo limpa a mão, então só nesse caso pede confirmação.
 */
let temPedras = false

export function marcarMaoEmAndamento(valor: boolean) {
  temPedras = valor
}

export function haMaoEmAndamento() {
  return temPedras
}
