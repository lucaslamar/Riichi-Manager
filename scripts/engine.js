/**
 * @file engine.js
 * @description Motor de lógica para o Riichi Tournament Pro - Versão CMC Justiça Total.
 */

function embaralharJogadores(array) {
    let lista = [...array];
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

function gerarChaveamentoTorneio(jogadores) {
    const total = jogadores.length;
    const totalRodadas = 4;
    let rodadasEstrutura = [];

    // --- 1. MATRIZES DE OPONENTES (SOCIAL GOLFER) ---
    // Garante que ninguém joga com a mesma pessoa duas vezes
    if (total === 16) {
        rodadasEstrutura = [
            [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]],
            [[0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15]],
            [[0, 5, 10, 15], [1, 4, 11, 14], [2, 7, 8, 13], [3, 6, 9, 12]],
            [[0, 6, 11, 13], [1, 7, 10, 12], [2, 4, 9, 15], [3, 5, 8, 14]]
        ];
    } else if (total === 8) {
        rodadasEstrutura = [
            [[0, 1, 2, 3], [4, 5, 6, 7]],
            [[0, 4, 5, 1], [2, 6, 7, 3]],
            [[0, 6, 1, 7], [4, 2, 5, 3]],
            [[0, 5, 6, 2], [1, 7, 4, 3]]
        ];
    } else {
        // Fallback para outros números de jogadores
        const saltos = [1, 5, 7, 11];
        for (let r = 0; r < totalRodadas; r++) {
            let rodada = [];
            let pulo = saltos[r] || (r * 2 + 1);
            for (let m = 0; m < total / 4; m++) {
                let mesa = [];
                for (let v = 0; v < 4; v++) {
                    let idx = (m + (v * pulo * (total / 4))) % total;
                    mesa.push(Math.floor(idx));
                }
                rodada.push(mesa);
            }
            rodadasEstrutura.push(rodada);
        }
    }

    // --- 2. ROTAÇÃO DE VENTOS ABSOLUTA (SISTEMA CARROSSEL) ---
    // Em vez de calcular pelo ID, giramos a mesa inteira baseada na rodada
    return rodadasEstrutura.map((rodadaIndices, rIdx) => {
        return rodadaIndices.map(mesaIdxs => {
            // Converte os índices da matriz para objetos com nomes
            let mesaComNomes = mesaIdxs.map(idx => ({ nome: jogadores[idx] }));

            // Rotaciona a posição física na mesa baseado na Rodada
            // Rodada 1: 0 pulos | Rodada 2: 1 pulo | Rodada 3: 2 pulos | Rodada 4: 3 pulos
            const shift = rIdx % 4;
            for (let i = 0; i < shift; i++) {
                mesaComNomes.push(mesaComNomes.shift());
            }
            
            return mesaComNomes;
        });
    });
}

function calcularPontosDaPartida(resultados) {
    const ordenados = [...resultados].sort((a, b) => b.score - a.score);
    const cavalos = [15, 5, -5, -15];

    return ordenados.map((res, index) => {
        const pontosBase = (res.score - 30000) / 1000;
        const ptsTorneio = pontosBase + cavalos[index];
        return {
            nome: res.nome,
            pontos: parseFloat(ptsTorneio.toFixed(1))
        };
    });
}