/**
 * RIICHI TOURNAMENT PRO - MOTOR FINAL (VENTOS E OPONENTES PERFEITOS)
 */

const REGRAS_PONTUACAO = { 
    UMA: { 
        0: [8, 4, -4, -8], 1: [12, -1, -3, -8], 2: [8, 4, -4, -8], 3: [8, 3, 1, -12], 4: [8, 4, -4, -8] 
    } 
};

function gerarChaveamentoTorneio(nomesDosJogadores) {
    const n = nomesDosJogadores.length;
    const nomesDosVentos = ["Leste", "Sul", "Oeste", "Norte"];
    let gradeDoTorneio = [];

    // ====================================================================
    // CASO ESPECIAL: 8 JOGADORES (A Matriz Perfeita)
    // Garante 0% de repetição de ventos e máximo de 2 encontros por pessoa.
    // ====================================================================
    if (n === 8) {
        const matrizPerfeita = [
            [ [0, 1, 2, 3], [4, 5, 6, 7] ], // Rodada 1
            [ [5, 4, 0, 1], [2, 3, 7, 6] ], // Rodada 2
            [ [6, 0, 4, 2], [1, 7, 3, 5] ], // Rodada 3
            [ [3, 6, 5, 0], [7, 2, 1, 4] ]  // Rodada 4
        ];

        for (let rIdx = 0; rIdx < 4; rIdx++) {
            let mesasDaRodada = [];
            matrizPerfeita[rIdx].forEach(mesaIndices => {
                let jogadoresNaMesa = mesaIndices.map((pIdx, vIdx) => {
                    return {
                        nome: nomesDosJogadores[pIdx],
                        vento: nomesDosVentos[vIdx] // A cadeira física dita o vento
                    };
                });
                mesasDaRodada.push(jogadoresNaMesa);
            });
            gradeDoTorneio.push(mesasDaRodada);
        }
        return gradeDoTorneio;
    }

    // ====================================================================
    // CASO GERAL: 12, 16, 20+ JOGADORES (Motor de Rotação)
    // Garante ventos únicos e mistura avançada de mesas.
    // ====================================================================
    for (let rIdx = 0; rIdx < 4; rIdx++) {
        let mesasDaRodada = [];
        let nPorMesa = n / 4; 
        
        for (let m = 0; m < nPorMesa; m++) {
            let jogadoresNaMesa = [];
            for (let v = 0; v < 4; v++) {
                let grupoFonte = (v + rIdx) % 4;
                let deslocamento = (m + rIdx * (v + 1)) % nPorMesa;
                let pIdx = (grupoFonte * nPorMesa) + deslocamento;

                jogadoresNaMesa.push({
                    nome: nomesDosJogadores[pIdx],
                    vento: nomesDosVentos[v] 
                });
            }
            mesasDaRodada.push(jogadoresNaMesa);
        }
        gradeDoTorneio.push(mesasDaRodada);
    }
    return gradeDoTorneio;
}

function embaralharJogadores(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

function calcularPontosDaPartida(pontuacoesBrutas) {
    let ordenados = [...pontuacoesBrutas].sort((a, b) => b.score - a.score);
    const jogadoresAcimaDoBase = ordenados.filter(p => p.score >= 30000).length;
    const tabelaUmaSelecionada = REGRAS_PONTUACAO.UMA[jogadoresAcimaDoBase];

    return ordenados.map((jogador, posicaoIdx) => {
        let pontosTorneio = ((jogador.score - 30000) / 1000) + tabelaUmaSelecionada[posicaoIdx];
        if (jogador.score < 0) pontosTorneio -= 3;
        return { nome: jogador.nome, pontos: parseFloat(pontosTorneio.toFixed(1)) };
    });
}