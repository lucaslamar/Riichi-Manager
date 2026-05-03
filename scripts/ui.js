/**
 * Riichi Tournament Pro - UI Module (v1.4.0)
 * Adaptado para o CSS do usuário e visual da Imagem 1.
 */

let bancoDeDados = JSON.parse(localStorage.getItem('mahjong_pro_db')) || {
    jogadores: [], classificacao: {}, chaveamento: null, mesasConcluidas: {}, pontosDasMesas: {}
};

function alternarInterface(torneioAtivo) {
    const setup = document.getElementById('setupContainer');
    const ranking = document.getElementById('championship');
    const mesas = document.getElementById('tablesContainer');

    if (torneioAtivo) {
        setup.classList.add('hidden');
        ranking.classList.remove('hidden');
        mesas.classList.remove('hidden');
    } else {
        setup.classList.remove('hidden');
        ranking.classList.add('hidden');
        mesas.classList.add('hidden');
    }
}

function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomes = campoTexto.value.split(/,|\n/).map(n => n.trim()).filter(n => n !== "");

    if (nomes.length < 8 || nomes.length % 4 !== 0) return alert("Erro: Mínimo 8 jogadores e múltiplo de 4.");

    bancoDeDados.jogadores = embaralharJogadores(nomes);
    bancoDeDados.classificacao = {};
    bancoDeDados.mesasConcluidas = {};
    bancoDeDados.pontosDasMesas = {};
    bancoDeDados.jogadores.forEach(n => bancoDeDados.classificacao[n] = 0);
    bancoDeDados.chaveamento = gerarChaveamentoTorneio(bancoDeDados.jogadores);

    salvarDadosNoNavegador();
    renderizarInterfaceDoTorneio();
    alternarInterface(true);
}

function renderizarInterfaceDoTorneio() {
    const container = document.getElementById('roundsContainer');
    if (!container || !bancoDeDados.chaveamento) return;

    container.innerHTML = "";
    const cores = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63'];

    bancoDeDados.chaveamento.forEach((rodada, rIdx) => {
        const corRodada = cores[rIdx % cores.length];

        rodada.forEach((mesa, mIdx) => {
            const mesaKey = `${rIdx}_${mIdx}`;
            const isTravada = bancoDeDados.mesasConcluidas[mesaKey];
            const pontos = bancoDeDados.pontosDasMesas[mesaKey] || ["30.000", "30.000", "30.000", "30.000"];

            let htmlMesa = `
                <div class="mesa-box" style="border-top-color: ${corRodada}">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">
                        <span style="color: white; background: ${corRodada}; padding: 2px 8px; border-radius: 4px;">RODADA ${rIdx + 1}</span>
                        <span style="color: ${corRodada}">MESA ${mIdx + 1}</span>
                    </div>`;

            mesa.forEach((jogador, jIdx) => {
                // jIdx define o vento: 0=Leste, 1=Sul, 2=Oeste, 3=Norte
                const ventos = ["Leste", "Sul", "Oeste", "Norte"];
                const vento = ventos[jIdx];

                htmlMesa += `
                    <div class="player-row">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="vento-tag v-${vento}">${vento}</span>
                            <span style="font-weight: 600;">${jogador.nome}</span>
                        </div>
                        <input type="text" id="score_${rIdx}_${mIdx}_${jIdx}" 
                               value="${pontos[jIdx]}" 
                               class="${isTravada ? 'input-locked' : ''}"
                               oninput="this.value = this.value.replace(/[^-0-9.,]/g, '')">
                    </div>`;
            });

            htmlMesa += `
    <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' 
            class="btn-primary ${isTravada ? 'btn-locked' : ''}" 
            style="width: 100%; justify-content: center; background: ${isTravada ? '#999' : corRodada}">
        ${isTravada
                    ? '<i class="fas fa-check-circle"></i> MESA ARQUIVADA'
                    : '<i class="fas fa-save"></i> GUARDAR MESA'}
    </button></div>`;
            container.innerHTML += htmlMesa;
        });
    });
    atualizarTabelaDeRanking();
}

// ... (Funções de Registrar, Ranking, Reset e Salvar continuam iguais às anteriores) ...

function registrarResultadoDaMesa(rIdx, mIdx, dados) {
    const mesaKey = `${rIdx}_${mIdx}`;
    if (bancoDeDados.mesasConcluidas[mesaKey]) return;

    // Coleta os valores e prepara a mensagem
    let resumoPontos = "";
    let pontuacoes = dados.map((jog, i) => {
        const val = document.getElementById(`score_${rIdx}_${mIdx}_${i}`).value;
        resumoPontos += `\n${jog.nome}: ${val}`; // Adiciona o nome e ponto na mensagem
        return { 
            nome: jog.nome, 
            score: parseInt(val.replace(/[\.,]/g, '')) || 0, 
            valorTexto: val 
        };
    });

    // Agora o alerta mostra os nomes e pontos
    if(confirm(`Deseja confirmar os resultados da Mesa ${mIdx + 1}?${resumoPontos}`)) {
        const resultados = calcularPontosDaPartida(pontuacoes);
        resultados.forEach(res => bancoDeDados.classificacao[res.nome] += res.pontos);
        
        bancoDeDados.mesasConcluidas[mesaKey] = true;
        bancoDeDados.pontosDasMesas[mesaKey] = pontuacoes.map(p => p.valorTexto);
        
        salvarDadosNoNavegador();
        renderizarInterfaceDoTorneio();
    }
}

function atualizarTabelaDeRanking() {
    const corpo = document.querySelector('#rankingTable tbody');
    if(!corpo) return;
    corpo.innerHTML = "";
    
    Object.entries(bancoDeDados.classificacao)
        .sort((a, b) => b[1] - a[1])
        .forEach((item, i) => {
            corpo.innerHTML += `
                <tr style="border-bottom: 1px solid #f5f5f5;">
                    <td style="padding: 12px 0;">${i+1}º</td>
                    <td style="font-weight: 800; color: #333;">${item[0]}</td>
                    <td style="text-align: right; font-weight: 800; color: #2196F3;">${item[1].toFixed(1)}</td>
                </tr>`;
        });
}

function salvarDadosNoNavegador() {
    localStorage.setItem('mahjong_pro_db', JSON.stringify(bancoDeDados));
}

function resetarTudo() {
    if (confirm("Reiniciar torneio? Todos os dados serão perdidos.")) {
        localStorage.clear();
        location.reload();
    }
}

window.onload = () => {
    if (bancoDeDados.jogadores.length > 0) {
        renderizarInterfaceDoTorneio();
        alternarInterface(true);
    } else {
        alternarInterface(false);
    }
};

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título do PDF
    doc.setFontSize(18);
    doc.text("Classificação Geral - Riichi Tournament Pro", 14, 20);
    
    // Data da exportação
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

    // Captura os dados da tabela HTML
    const rows = [];
    const tableRows = document.querySelectorAll("#rankingTable tbody tr");
    
    tableRows.forEach(row => {
        const td = row.querySelectorAll("td");
        rows.push([td[0].innerText, td[1].innerText, td[2].innerText]);
    });

    // Gera a tabela no PDF
    doc.autoTable({
        startY: 35,
        head: [['Pos', 'Jogador', 'Pontos']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }, // O azul do seu tema
        styles: { font: 'helvetica', fontSize: 10 }
    });

    doc.save("classificacao_torneio.pdf");
}