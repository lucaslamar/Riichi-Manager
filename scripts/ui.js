/**
 * Estado global da aplicação, carregado do armazenamento local (LocalStorage).
 */
let bancoDeDados = JSON.parse(localStorage.getItem('mahjong_pro_db')) || { 
    jogadores: [], 
    classificacao: {}, 
    chaveamento: null 
};

/**
 * Inicia o processo de criação do torneio.
 * Valida a regra de negócio de mínimo 8 jogadores e múltiplos de 4.
 */
function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomesValidos = campoTexto.value.split('\n')
        .map(n => n.trim())
        .filter(n => n !== "");
    
    if (nomesValidos.length < 8) {
        return alert("Erro: Um torneio profissional exige pelo menos 8 jogadores (2 mesas).");
    }
    if (nomesValidos.length % 4 !== 0) {
        return alert("Erro: O total de jogadores deve ser múltiplo de 4 para que não haja mesas incompletas.");
    }

    // Preparação dos dados
    const nomesEmbaralhados = embaralharJogadores(nomesValidos);
    bancoDeDados.jogadores = nomesEmbaralhados;
    bancoDeDados.classificacao = {};
    
    nomesEmbaralhados.forEach(nome => {
        bancoDeDados.classificacao[nome] = 0;
    });

    bancoDeDados.chaveamento = gerarChaveamentoTorneio(nomesEmbaralhados);

    salvarDadosNoNavegador();
    renderizarInterfaceDoTorneio();
    
    document.getElementById('championship').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('championship').offsetTop, behavior: 'smooth' });
}

/**
 * Regista os resultados de uma mesa específica e atualiza o ranking.
 * * @param {number} rodadaIdx - Índice da rodada atual.
 * @param {number} mesaIdx - Índice da mesa dentro da rodada.
 * @param {Array} dadosDaMesa - Lista de jogadores daquela mesa.
 */
function registrarResultadoDaMesa(rodadaIdx, mesaIdx, dadosDaMesa) {
    let pontuacoesDigitadas = dadosDaMesa.map((jogador, i) => {
        const input = document.getElementById(`score_${rodadaIdx}_${mesaIdx}_${i}`);
        // Limpa pontos e vírgulas para converter em número inteiro
        const valorLimpo = parseInt(input.value.replace(/[\.,]/g, '')) || 0;
        return { nome: jogador.nome, score: valorLimpo };
    });

    const pontosCalculados = calcularPontosDaPartida(pontuacoesDigitadas);
    
    // Atualiza o ranking global acumulado
    pontosCalculados.forEach(resultado => {
        bancoDeDados.classificacao[resultado.nome] += resultado.pontos;
    });

    salvarDadosNoNavegador();
    alert("Resultados da mesa guardados com sucesso!");
}

/**
 * Constrói visualmente as mesas e rodadas no HTML.
 */
function renderizarInterfaceDoTorneio() {
    const contentorRodadas = document.getElementById('roundsContainer');
    contentorRodadas.innerHTML = "";
    
    if (!bancoDeDados.chaveamento) return;

    bancoDeDados.chaveamento.forEach((rodada, rIdx) => {
        contentorRodadas.innerHTML += `<div class="round-header">RODADA ${rIdx + 1}</div>`;
        
        rodada.forEach((mesa, mIdx) => {
            let htmlMesa = `<div class="mesa-box"><strong>MESA ${mIdx + 1}</strong><br><br>`;
            
            mesa.forEach((jogador, jIdx) => {
                htmlMesa += `
                    <div class="player-row">
                        <div>
                            <span class="vento-tag v-${jogador.vento}">${jogador.vento}</span> 
                            <strong>${jogador.nome}</strong>
                        </div>
                        <input type="text" id="score_${rIdx}_${mIdx}_${jIdx}" value="30.000" onclick="this.select()">
                    </div>`;
            });
            
            htmlMesa += `
                <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' class="btn-primary" style="width:100%; justify-content:center; margin-top:10px">
                    <span class="material-icons">save</span> GUARDAR MESA
                </button></div>`;
                
            contentorRodadas.innerHTML += htmlMesa;
        });
    });
    atualizarTabelaDeRanking();
}

/**
 * Atualiza a tabela visual de classificação geral por ordem de pontos.
 */
function atualizarTabelaDeRanking() {
    const corpoTabela = document.querySelector('#rankingTable tbody');
    corpoTabela.innerHTML = "";
    
    // Converte objeto em array e ordena do maior para o menor ponto
    const rankingOrdenado = Object.entries(bancoDeDados.classificacao)
        .sort((a, b) => b[1] - a[1]);

    rankingOrdenado.forEach((item, index) => {
        corpoTabela.innerHTML += `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${item[0]}</strong></td>
                <td style="text-align: right; font-weight: bold; color: var(--primary);">${item[1].toFixed(1)}</td>
            </tr>`;
    });
}

/**
 * Guarda o estado atual do banco de dados no LocalStorage do navegador.
 */
function salvarDadosNoNavegador() {
    localStorage.setItem('mahjong_pro_db', JSON.stringify(bancoDeDados));
    atualizarTabelaDeRanking();
}

/**
 * Limpa todos os dados e recarrega a página.
 */
function resetarTudo() {
    if(confirm("Tem a certeza que deseja reiniciar o torneio? Todos os dados serão perdidos.")) {
        localStorage.clear();
        location.reload();
    }
}

// Inicialização automática caso já existam dados salvos
if(bancoDeDados.jogadores.length >= 8) {
    renderizarInterfaceDoTorneio();
    document.getElementById('championship').classList.remove('hidden');
}