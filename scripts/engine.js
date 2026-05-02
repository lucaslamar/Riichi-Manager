/**
 * Constante que define a tabela de pontuação UMA.
 * A regra de negócio do Riichi Mahjong aplica bônus/penalidades baseadas 
 * em quantos jogadores terminaram acima da pontuação base (30.000).
 */
const REGRAS_PONTUACAO = { 
    UMA: { 
        0: [8, 4, -4, -8], // 0 jogadores acima de 30k
        1: [12, -1, -3, -8], // 1 jogador acima de 30k
        2: [8, 4, -4, -8], // 2 jogadores acima de 30k (Padrão)
        3: [8, 3, 1, -12], // 3 jogadores acima de 30k
        4: [8, 4, -4, -8]  // Todos acima de 30k
    } 
};

/**
 * Embaralha um array de forma aleatória usando o algoritmo Fisher-Yates.
 * Essencial para garantir que o início do torneio seja imparcial.
 * * @param {Array} lista - A lista de jogadores a ser embaralhada.
 * @returns {Array} A lista embaralhada.
 */
function embaralharJogadores(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

/**
 * Gera o chaveamento do torneio para 4 rodadas.
 * Aplica uma rotação matemática para garantir que cada jogador passe por todos 
 * os ventos (Leste, Sul, Oeste, Norte) exatamente uma vez.
 * * @param {Array} nomesDosJogadores - Lista de nomes já embaralhada.
 * @returns {Array} Estrutura contendo rodadas, mesas e assentos.
 */
function gerarChaveamentoTorneio(nomesDosJogadores) {
    const totalJogadores = nomesDosJogadores.length;
    const nomesDosVentos = ["Leste", "Sul", "Oeste", "Norte"];
    let gradeDoTorneio = [];

    for (let rodada = 0; rodada < 4; rodada++) {
        let mesasDaRodada = [];
        for (let mesaIdx = 0; mesaIdx < totalJogadores / 4; mesaIdx++) {
            let jogadoresNaMesa = [];
            for (let ventoIdx = 0; ventoIdx < 4; ventoIdx++) {
                // Cálculo de Rotação Scramble:
                // Garante que o jogador mude de mesa e de assento a cada rodada.
                let indiceDoJogador = (mesaIdx * 4 + ventoIdx + rodada) % totalJogadores;
                
                jogadoresNaMesa.push({
                    nome: nomesDosJogadores[indiceDoJogador],
                    vento: nomesDosVentos[ventoIdx]
                });
            }
            mesasDaRodada.push(jogadoresNaMesa);
        }
        gradeDoTorneio.push(mesasDaRodada);
    }
    return gradeDoTorneio;
}

/**
 * Calcula a pontuação final de uma mesa após o término da partida.
 * Converte a pontuação bruta em pontos de torneio seguindo a regra da UMA.
 * * @param {Array} pontuacoesBrutas - Array de objetos {nome, score}.
 * @returns {Array} Array com {nome, pontosDeTorneio}.
 */
function calcularPontosDaPartida(pontuacoesBrutas) {
    // Ordena do maior score para o menor
    let ordenados = [...pontuacoesBrutas].sort((a, b) => b.score - a.score);
    
    // Regra de negócio: conta quantos fizeram 30.000 ou mais
    const jogadoresAcimaDoBase = ordenados.filter(p => p.score >= 30000).length;
    const tabelaUmaSelecionada = REGRAS_PONTUACAO.UMA[jogadoresAcimaDoBase];

    return ordenados.map((jogador, posicao) => {
        // Cálculo: (Score - 30.000) / 1000 + Bônus da UMA
        let pontosDeTorneio = ((jogador.score - 30000) / 1000) + tabelaUmaSelecionada[posicao];
        
        // Penalidade 'Tobi': Se o jogador ficou negativo, perde 3 pontos extras
        if (jogador.score < 0) pontosDeTorneio -= 3;
        
        return { 
            nome: jogador.nome, 
            pontos: parseFloat(pontosDeTorneio.toFixed(1)) 
        };
    });
}