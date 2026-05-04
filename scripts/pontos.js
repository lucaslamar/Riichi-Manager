/**
 * @file pontos.js
 * @description Motor de cálculo de pontuação Riichi.
 */

/**
 * Calcula os Pontos de Torneio (PT) com base no score da mesa.
 * @param {Object[]} resultados - Lista de objetos {nome, score}
 * @returns {Object[]} - Lista ordenada com {nome, pontos}
 */
function calcularPontosDaPartida(resultados) {
    // 1. Cria uma cópia e ordena do maior score para o menor
    const ordenados = [...resultados].sort((a, b) => b.score - a.score);
    
    // 2. Tabela de bonificação (Cavalos)
    const cavalos = [8, 4, -4, -8];

    // 3. Aplica o cálculo: (Score - 30.000) / 1000 + Cavalo da posição
    return ordenados.map((res, index) => {
        const pontosBase = (res.score - 30000) / 1000;
        const ptsTorneio = pontosBase + cavalos[index];
        
        return {
            nome: res.nome,
            pontos: parseFloat(ptsTorneio.toFixed(1))
        };
    });
}

// Expõe a função para ser usada pelo ui.js
window.calcularPontosDaPartida = calcularPontosDaPartida;