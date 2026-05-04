/**
 * @file ui.js
 * @description Interface do torneio Riichi Mahjong.
 */

// Estado global sincronizado com o storage
let bancoDeDados = storage.load();

/**
 * Alterna a visibilidade entre a tela de configuração (Setup) e a tela do Torneio.
 */
const alternarInterface = (torneioAtivo) => {
    const setupContainer = document.getElementById('setupContainer');
    const rankingContainer = document.getElementById('championship');
    const mesasContainer = document.getElementById('tablesContainer');

    const acao = torneioAtivo ? 'add' : 'remove';
    const acaoInversa = torneioAtivo ? 'remove' : 'add';

    setupContainer.classList[acao]('hidden');
    rankingContainer.classList[acaoInversa]('hidden');
    mesasContainer.classList[acaoInversa]('hidden');
};

/**
 * Inicializa o torneio: valida jogadores, embaralha e gera o chaveamento.
 */
function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomesValidos = campoTexto.value
    .split(/,|\n/)
    .map(nome => {
        return nome.trim()
            .toLowerCase()
            .split(/\s+/)
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    })
    .filter(nome => nome !== "");

    if (nomesValidos.length < 8 || nomesValidos.length % 4 !== 0) {
        return alert("Erro: Mínimo 8 jogadores e o total deve ser múltiplo de 4. \nQuantidade: " + nomesValidos.length);
    }
    console.log("Gerando chaveamento otimizado...");

    bancoDeDados.jogadores = embaralharJogadores(nomesValidos);
    bancoDeDados.classificacao = {};
    bancoDeDados.mesasConcluidas = {};
    bancoDeDados.pontosDasMesas = {};
    
    bancoDeDados.jogadores.forEach(nome => bancoDeDados.classificacao[nome] = 0);
    bancoDeDados.chaveamento = gerarChaveamentoTorneio(bancoDeDados.jogadores);

    storage.save(bancoDeDados);
    renderizarInterfaceDoTorneio();
    alternarInterface(true);
}

/**
 * Renderiza visualmente todas as rodadas e mesas do torneio.
 */
function renderizarInterfaceDoTorneio() {
    const container = document.getElementById('roundsContainer');
    if (!container || !bancoDeDados.chaveamento) return;

    const coresVivas = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63'];
    const nomesDosVentos = ["Leste", "Sul", "Oeste", "Norte"];

    // 1. Limpa e configura o container pai para ser um GRID
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(320px, 1fr))";
    container.style.gap = "20px";
    container.style.alignItems = "stretch";

    container.innerHTML = bancoDeDados.chaveamento.map((rodada, rIdx) => {
        const corRodada = coresVivas[rIdx % coresVivas.length];

        return rodada.map((mesa, mIdx) => {
            const mesaKey = `${rIdx}_${mIdx}`;
            const estaTravada = bancoDeDados.mesasConcluidas[mesaKey];
            const pontosSalvos = bancoDeDados.pontosDasMesas[mesaKey] || ["30.000", "30.000", "30.000", "30.000"];

            return `
                <div class="mesa-box" style="border-top: 4px solid ${corRodada}; display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
                    <div class="mesa-header" style="display: flex; justify-content: space-between; margin-bottom: 15px; flex-shrink: 0;">
                        <span style="color: white; background: ${corRodada}; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.75rem;">
                            RODADA ${rIdx + 1}
                        </span>
                        <span style="color: ${corRodada}; font-weight: 800; font-size: 0.75rem;">
                            MESA ${mIdx + 1}
                        </span>
                    </div>

                    <div style="flex-grow: 1;">
                        ${mesa.map((jogador, jIdx) => `
                            <div class="player-row" style="display: flex; align-items: center; margin-bottom: 8px; gap: 5px;">
                                <span class="vento-tag" style="background-color: ${coresVivas[jIdx]}; flex-shrink: 0;">
                                    ${nomesDosVentos[jIdx]}
                                </span>
                                <span style="flex-grow: 1; font-weight: 700; color: #444; margin-left: 5px; min-height: 2.4em; display: flex; align-items: center; line-height: 1.1; font-size: 0.85rem; overflow: hidden;">
                                    ${jogador.nome}
                                </span>
                                <input type="text" 
                                    inputmode="numeric" 
                                    pattern="[0-9]*"
                                    id="score_${rIdx}_${mIdx}_${jIdx}" 
                                    value="${pontosSalvos[jIdx]}" 
                                    class="${estaTravada ? 'input-locked' : ''}"
                                    ${estaTravada ? 'disabled' : ''}
                                    style="width: 70px; flex-shrink: 0;"
                                    onfocus="if(this.value=='30.000'){this.value=''}"
                                    onblur="if(this.value==''){this.value='30.000'}"
                                    oninput="this.value = this.value.replace(/[^-0-9.,]/g, '')">
                            </div>
                        `).join('')}
                    </div>

                    <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' 
                            class="btn-primary ${estaTravada ? 'btn-locked' : ''}" 
                            style="background: ${estaTravada ? '#999' : corRodada}; width: 100%; margin-top: 15px; flex-shrink: 0;">
                        ${estaTravada 
                            ? '<i class="fas fa-check-circle"></i> MESA ARQUIVADA' 
                            : '<i class="fas fa-save"></i> GUARDAR MESA'}
                    </button>
                </div>
            `;
        }).join('');
    }).join('');

    atualizarTabelaDeRanking();
}

/**
 * Coleta os pontos, formata para o confirm e salva os resultados.
 */
function registrarResultadoDaMesa(rIdx, mIdx, dadosJogadores) {
    const mesaKey = `${rIdx}_${mIdx}`;
    if (bancoDeDados.mesasConcluidas[mesaKey]) return;

    let resumoParaConfirmacao = "";
    
    const pontuacoesBrutas = dadosJogadores.map((jogador, index) => {
        const inputElement = document.getElementById(`score_${rIdx}_${mIdx}_${index}`);
        const valorRaw = inputElement.value;

        // Limpa separadores para o cálculo matemático
        const valorLimpo = parseInt(valorRaw.replace(/[\.,]/g, '')) || 0;

        // Formata visualmente para 30.000 no alert
        const valorFormatado = valorLimpo.toLocaleString('pt-BR');
        resumoParaConfirmacao += `\n${jogador.nome}: ${valorFormatado}`;
        
        return { 
            nome: jogador.nome, 
            score: valorLimpo, 
            textoOriginal: valorFormatado 
        };
    });

    const confirmar = confirm(`Confirmar resultados da Mesa ${mIdx + 1}?${resumoParaConfirmacao}`);

    if (confirmar) {
        const resultadosProcessados = calcularPontosDaPartida(pontuacoesBrutas);
        
        resultadosProcessados.forEach(res => {
            bancoDeDados.classificacao[res.nome] += res.pontos;
        });

        bancoDeDados.mesasConcluidas[mesaKey] = true;
        bancoDeDados.pontosDasMesas[mesaKey] = pontuacoesBrutas.map(p => p.textoOriginal);
        
        storage.save(bancoDeDados);
        renderizarInterfaceDoTorneio();
    }
}

/**
 * Atualiza a tabela de ranking.
 */
function atualizarTabelaDeRanking() {
    const corpoTabela = document.querySelector('#rankingTable tbody');
    if (!corpoTabela) return;

    const rankingOrdenado = Object.entries(bancoDeDados.classificacao)
        .sort(([, pontosA], [, pontosB]) => pontosB - pontosA);

    corpoTabela.innerHTML = rankingOrdenado.map(([nome, pontos], index) => `
        <tr class="ranking-row" style="border-bottom: 1px solid #f5f5f5;">
            <td style="padding: 12px 5px;">${index + 1}º</td>
            <td style="font-weight: 800; color: #333;">${nome}</td>
            <td style="text-align: right; font-weight: 800; color: #2196F3;">
                ${pontos.toFixed(1)}
            </td>
        </tr>
    `).join('');
}

window.onload = () => {
    const possuiTorneioAtivo = bancoDeDados.chaveamento && bancoDeDados.jogadores.length > 0;
    
    if (possuiTorneioAtivo) {
        renderizarInterfaceDoTorneio();
        alternarInterface(true);
    } else {
        alternarInterface(false);
    }
};

window.ui = {
    iniciarTorneio,
    resetarTudo: () => {
        storage.clear(); // 1. Limpa os dados
        window.location.href = './index.html'; // 2. Recarrega de forma segura e relativa
    }
};