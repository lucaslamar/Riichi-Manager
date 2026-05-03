/**
 * Riichi Tournament Pro - UI Module (v1.2.0)
 * Design com diferenciação cromática por rodada para evitar confusão visual.
 */

let bancoDeDados = JSON.parse(localStorage.getItem('mahjong_pro_db')) || { 
    jogadores: [], 
    classificacao: {}, 
    chaveamento: null,
    mesasConcluidas: {},
    pontosDasMesas: {}  
};

// Paleta de cores para diferenciar as rodadas visualmente
const CORES_RODADAS = [
    '#2196F3', // Azul (R1)
    '#4CAF50', // Verde (R2)
    '#FF9800', // Laranja (R3)
    '#E91E63', // Rosa (R4)
    '#9C27B0', // Roxo (R5)
    '#00BCD4',  // Ciano (R6)
    '#000000'
];

function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomesBrutos = campoTexto.value.split(/,|\n/);
    
    const nomesProcessados = nomesBrutos
        .map(nome => {
            let n = nome.trim();
            if (n === "") return null;
            return n.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
        })
        .filter(n => n !== null);

    if (nomesProcessados.length < 8) return alert("Erro: O torneio precisa de pelo menos 8 jogadores.");
    if (nomesProcessados.length % 4 !== 0) return alert(`Erro: O total deve ser múltiplo de 4.`);

    bancoDeDados.jogadores = embaralharJogadores(nomesProcessados);
    bancoDeDados.classificacao = {};
    bancoDeDados.mesasConcluidas = {};
    bancoDeDados.pontosDasMesas = {};
    
    bancoDeDados.jogadores.forEach(nome => bancoDeDados.classificacao[nome] = 0);
    bancoDeDados.chaveamento = gerarChaveamentoTorneio(bancoDeDados.jogadores);

    salvarDadosNoNavegador();
    renderizarInterfaceDoTorneio();
    
    document.getElementById('championship').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('championship').offsetTop, behavior: 'smooth' });
}

function registrarResultadoDaMesa(rodadaIdx, mesaIdx, dadosDaMesa) {
    const mesaKey = `${rodadaIdx}_${mesaIdx}`;
    if (bancoDeDados.mesasConcluidas[mesaKey]) return;

    let pontuacoesDigitadas = dadosDaMesa.map((jogador, i) => {
        const input = document.getElementById(`score_${rodadaIdx}_${mesaIdx}_${i}`);
        let valorLimpo = input.value.replace(/[\.,]/g, ''); 
        return { 
            nome: jogador.nome, 
            score: parseInt(valorLimpo) || 0,
            valorTexto: input.value
        };
    });

    let resumo = `CONFIRMAR RODADA ${rodadaIdx + 1} - MESA ${mesaIdx + 1}:\n\n`;
    pontuacoesDigitadas.forEach(p => resumo += `${p.nome}: ${p.valorTexto}\n`);

    if (confirm(resumo + "\nDeseja aprovar e travar esta mesa?")) {
        const pontosCalculados = calcularPontosDaPartida(pontuacoesDigitadas);
        pontosCalculados.forEach(res => bancoDeDados.classificacao[res.nome] += res.pontos);

        bancoDeDados.mesasConcluidas[mesaKey] = true;
        bancoDeDados.pontosDasMesas[mesaKey] = pontuacoesDigitadas.map(p => p.valorTexto);

        salvarDadosNoNavegador();
        renderizarInterfaceDoTorneio(); 
    }
}

function renderizarInterfaceDoTorneio() {
    const contentorRodadas = document.getElementById('roundsContainer');
    contentorRodadas.innerHTML = "";
    
    if (!bancoDeDados.chaveamento) return;

    bancoDeDados.chaveamento.forEach((rodada, rIdx) => {
        // Cor dinâmica baseada no índice da rodada
        const corRodada = CORES_RODADAS[rIdx % CORES_RODADAS.length]; 

        rodada.forEach((mesa, mIdx) => {
            const mesaKey = `${rIdx}_${mIdx}`;
            const isTravada = bancoDeDados.mesasConcluidas[mesaKey] || false;
            const pontosSalvos = bancoDeDados.pontosDasMesas[mesaKey] || ["30.000", "30.000", "30.000", "30.000"];
            
            let htmlMesa = `
                <div class="mesa-box" style="border-top: 4px solid ${corRodada}; ${isTravada ? 'opacity: 0.85; background: #fdfdfd;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #eee;">
                        <span style="background: ${corRodada}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">
                            Rodada ${rIdx + 1}
                        </span>
                        <span style="font-size: 0.85rem; font-weight: 800; color: ${corRodada};">
                            MESA ${mIdx + 1}
                        </span>
                    </div>`;
            
            mesa.forEach((jogador, jIdx) => {
                htmlMesa += `
                    <div class="player-row" style="margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="vento-tag v-${jogador.vento}">${jogador.vento}</span> 
                            <span style="font-weight: 600; font-size: 0.9rem;">${jogador.nome}</span>
                        </div>
                        <input type="text" 
                               id="score_${rIdx}_${mIdx}_${jIdx}" 
                               value="${pontosSalvos[jIdx]}" 
                               ${isTravada ? 'readonly' : ''}
                               style="width: 80px; text-align: right; border-radius: 4px; border: 1px solid #ddd; padding: 4px; ${isTravada ? 'background:#f1f1f1; color:#777; border:none;' : ''}"
                               oninput="this.value = this.value.replace(/[^-0-9.,]/g, '')" 
                               onclick="this.select()">
                    </div>`;
            });
            
            const btnLabel = isTravada ? 'MESA ARQUIVADA' : 'GUARDAR MESA';
            const btnIcon = isTravada ? 'check_circle' : 'save';

            htmlMesa += `
                <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' 
                        class="btn-primary" 
                        ${isTravada ? 'disabled' : ''}
                        style="width:100%; justify-content:center; margin-top:10px; background: ${isTravada ? '#999' : corRodada}">
                    <span class="material-icons" style="font-size: 18px;">${btnIcon}</span> ${btnLabel}
                </button></div>`;
                
            contentorRodadas.innerHTML += htmlMesa;
        });
    });
    atualizarTabelaDeRanking();
}

function atualizarTabelaDeRanking() {
    const corpoTabela = document.querySelector('#rankingTable tbody');
    if(!corpoTabela) return;
    corpoTabela.innerHTML = "";
    
    const rankingOrdenado = Object.entries(bancoDeDados.classificacao).sort((a, b) => b[1] - a[1]);

    rankingOrdenado.forEach((item, index) => {
        corpoTabela.innerHTML += `
            <tr>
                <td>${index + 1}º</td>
                <td><strong>${item[0]}</strong></td>
                <td style="text-align: right; font-weight: bold; color: var(--primary);">${item[1].toFixed(1)}</td>
            </tr>`;
    });
}

function salvarDadosNoNavegador() {
    localStorage.setItem('mahjong_pro_db', JSON.stringify(bancoDeDados));
    atualizarTabelaDeRanking();
}

function resetarTudo() {
    if(confirm("Reiniciar torneio? Todos os dados serão apagados.")) {
        localStorage.clear();
        location.reload();
    }
}

if(bancoDeDados.jogadores.length >= 8) {
    renderizarInterfaceDoTorneio();
    document.getElementById('championship').classList.remove('hidden');
}

function gerarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Ranking Riichi Tournament Pro", 14, 20);
        const dados = Object.entries(bancoDeDados.classificacao).sort((a, b) => b[1] - a[1])
            .map((item, index) => [`${index + 1}º`, item[0], item[1].toFixed(1)]);
        doc.autoTable({ head: [['Pos', 'Nome', 'Pontos']], body: dados, startY: 30 });
        doc.save(`Ranking_${new Date().toLocaleDateString()}.pdf`);
    } catch (e) { alert("Erro ao gerar PDF."); }
}