/**
 * Módulo de Interface do Usuário (UI).
 * Responsável por renderizar a grade do torneio, ranking e gerenciar interações.
 */

// Estado global sincronizado com o storage
let bancoDeDados = storage.load();

/**
 * Alterna a visibilidade entre a tela de configuração (Setup) e a tela do Torneio.
 * @param {boolean} torneioAtivo - Define se o torneio já começou.
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
 * Inicializa o torneio: valida jogadores, embaralha, gera o chaveamento e salva o estado inicial.
 */
function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomesValidos = campoTexto.value
    .split(/,|\n/)
    .map(nome => {
        return nome.trim()
            .toLowerCase() // Primeiro deixa tudo minúsculo
            .split(/\s+/)  // Divide se houver nome e sobrenome (espaço)
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)) // Capitaliza cada palavra
            .join(' ');    // Junta de novo com espaço
    })
    .filter(nome => nome !== "");

    if (nomesValidos.length < 8 || nomesValidos.length % 4 !== 0) {
        return alert("Erro: Mínimo 8 jogadores e o total deve ser múltiplo de 4. \nQuantidade: " + nomesValidos.length);
    }

    // Preparação do banco de dados inicial
    bancoDeDados.jogadores = embaralharJogadores(nomesValidos);
    bancoDeDados.classificacao = {};
    bancoDeDados.mesasConcluidas = {};
    bancoDeDados.pontosDasMesas = {};
    
    // Inicializa ranking com zero para todos
    bancoDeDados.jogadores.forEach(nome => bancoDeDados.classificacao[nome] = 0);
    
    // Gera a Matriz Perfeita ou Rotação
    bancoDeDados.chaveamento = gerarChaveamentoTorneio(bancoDeDados.jogadores);

    storage.save(bancoDeDados);
    renderizarInterfaceDoTorneio();
    alternarInterface(true);
}

/**
 * Renderiza visualmente todas as rodadas e mesas do torneio.
 * Utiliza as cores vibrantes e estilos da MAIN.
 */
/**
 * Renderiza visualmente todas as rodadas e mesas do torneio.
 * Utiliza as cores vibrantes e estilos da MAIN.
 */
function renderizarInterfaceDoTorneio() {
    const container = document.getElementById('roundsContainer');
    if (!container || !bancoDeDados.chaveamento) return;

    const coresVivas = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63'];
    const nomesDosVentos = ["Leste", "Sul", "Oeste", "Norte"];

    container.innerHTML = bancoDeDados.chaveamento.map((rodada, rIdx) => {
        const corRodada = coresVivas[rIdx % coresVivas.length];

        return rodada.map((mesa, mIdx) => {
            const mesaKey = `${rIdx}_${mIdx}`;
            const estaTravada = bancoDeDados.mesasConcluidas[mesaKey];
            const pontosSalvos = bancoDeDados.pontosDasMesas[mesaKey] || ["30.000", "30.000", "30.000", "30.000"];

            return `
                <div class="mesa-box" style="border-top: 4px solid ${corRodada};">
                    <div class="mesa-header" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: white; background: ${corRodada}; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.75rem;">
                            RODADA ${rIdx + 1}
                        </span>
                        <span style="color: ${corRodada}; font-weight: 800; font-size: 0.75rem;">
                            MESA ${mIdx + 1}
                        </span>
                    </div>

                    ${mesa.map((jogador, jIdx) => `
                        <div class="player-row" style="display: flex; align-items: center; margin-bottom: 8px;">
                            <span class="vento-tag" style="background-color: ${coresVivas[jIdx]};">
                                ${nomesDosVentos[jIdx]}
                            </span>
                            <span style="flex-grow: 1; font-weight: 700; color: #444; margin-left: 10px;">
                                ${jogador.nome}
                            </span>
                            <input type="text" 
                                inputmode="numeric" 
                                pattern="[0-9]*"
                                id="score_${rIdx}_${mIdx}_${jIdx}" 
                                value="${pontosSalvos[jIdx]}" 
                                class="${estaTravada ? 'input-locked' : ''}"
                                ${estaTravada ? 'disabled' : ''}
                                onfocus="if(this.value=='30.000'){this.value=''}"
                                onblur="if(this.value==''){this.value='30.000'}"
                                oninput="this.value = this.value.replace(/[^-0-9.,]/g, '')">
                        </div>
                    `).join('')}

                    <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' 
                            class="btn-primary ${estaTravada ? 'btn-locked' : ''}" 
                            style="background: ${estaTravada ? '#999' : corRodada}; width: 100%; margin-top: 10px;">
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
 * Coleta os pontos da mesa, calcula os pontos de torneio e atualiza o ranking.
 * @param {number} rIdx - Índice da Rodada.
 * @param {number} mIdx - Índice da Mesa.
 * @param {Array} dadosJogadores - Array com os objetos dos jogadores da mesa.
 */
function registrarResultadoDaMesa(rIdx, mIdx, dadosJogadores) {
    const mesaKey = `${rIdx}_${mIdx}`;
    if (bancoDeDados.mesasConcluidas[mesaKey]) return;

    let resumoParaConfirmacao = "";
    const pontuacoesBrutas = dadosJogadores.map((jogador, index) => {
        const inputValor = document.getElementById(`score_${rIdx}_${mIdx}_${index}`).value;
        resumoParaConfirmacao += `\n${jogador.nome}: ${inputValor}`;
        
        return { 
            nome: jogador.nome, 
            score: parseInt(inputValor.replace(/[\.,]/g, '')) || 0,
            textoOriginal: inputValor
        };
    });

    const confirmar = confirm(`Confirmar resultados da Mesa ${mIdx + 1}?${resumoParaConfirmacao}`);

    if (confirmar) {
        const resultadosProcessados = calcularPontosDaPartida(pontuacoesBrutas);
        
        // Atualiza o ranking acumulado
        resultadosProcessados.forEach(res => {
            bancoDeDados.classificacao[res.nome] += res.pontos;
        });

        // Trava a mesa e salva os dados
        bancoDeDados.mesasConcluidas[mesaKey] = true;
        bancoDeDados.pontosDasMesas[mesaKey] = pontuacoesBrutas.map(p => p.textoOriginal);
        
        storage.save(bancoDeDados);
        renderizarInterfaceDoTorneio();
    }
}

/**
 * Atualiza o corpo da tabela de ranking no HTML, ordenando do maior para o menor.
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

/**
 * Gera e baixa o PDF da classificação atual.
 */
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataAtual = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    doc.setFontSize(18);
    doc.text("Classificação Geral - Riichi Tournament Pro", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exportado em: ${dataAtual}`, 14, 28);

    const linhasTabela = Object.entries(bancoDeDados.classificacao)
        .sort((a, b) => b[1] - a[1])
        .map(([nome, pontos], i) => [`${i + 1}º`, nome, pontos.toFixed(1)]);

    doc.autoTable({
        startY: 35,
        head: [['Pos', 'Jogador', 'Pontos PT']],
        body: linhasTabela,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }
    });

    doc.save(`ranking_mahjong_${new Date().getTime()}.pdf`);
}

// Inicialização ao carregar a página
window.onload = () => {
    const possuiTorneioAtivo = bancoDeDados.chaveamento && bancoDeDados.jogadores.length > 0;
    
    if (possuiTorneioAtivo) {
        renderizarInterfaceDoTorneio();
        alternarInterface(true);
    } else {
        alternarInterface(false);
    }
};

// Exposição de funções para o HTML
window.ui = {
    iniciarTorneio,
    resetarTudo: () => storage.clear(),
    gerarPDF
};