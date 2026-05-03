
// Estado global carregado do armazenamento local
let bancoDeDados = JSON.parse(localStorage.getItem('mahjong_pro_db')) || { 
    jogadores: [], 
    classificacao: {}, 
    chaveamento: null,
    mesasConcluidas: {}, // Armazena se a mesa está travada
    pontosDasMesas: {}   // Armazena os valores (incluindo negativos) para exibição
};

/**
 * Inicia o processo de criação do torneio.
 */
function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    const nomesBrutos = campoTexto.value.split(/,|\n/);
    
    const nomesProcessados = nomesBrutos
        .map(nome => {
            let n = nome.trim();
            if (n === "") return null;
            return n.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                return a.toUpperCase();
            });
        })
        .filter(n => n !== null);

    if (nomesProcessados.length < 8) {
        return alert("Erro: O torneio precisa de pelo menos 8 jogadores.");
    }
    if (nomesProcessados.length % 4 !== 0) {
        return alert(`Erro: Tens ${nomesProcessados.length} jogadores. O total deve ser múltiplo de 4.`);
    }

    // Reset de estado para novo torneio
    const nomesEmbaralhados = embaralharJogadores(nomesProcessados);
    bancoDeDados.jogadores = nomesEmbaralhados;
    bancoDeDados.classificacao = {};
    bancoDeDados.mesasConcluidas = {};
    bancoDeDados.pontosDasMesas = {}; 
    
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
 * Regista os resultados de uma mesa, aceitando valores negativos.
 */
function registrarResultadoDaMesa(rodadaIdx, mesaIdx, dadosDaMesa) {
    const mesaKey = `${rodadaIdx}_${mesaIdx}`;

    if (bancoDeDados.mesasConcluidas[mesaKey]) return;

    let pontuacoesDigitadas = dadosDaMesa.map((jogador, i) => {
        const input = document.getElementById(`score_${rodadaIdx}_${mesaIdx}_${i}`);
        
        // Remove pontos e vírgulas, mas preserva o sinal de menos (-)
        let valorLimpo = input.value.replace(/[\.,]/g, ''); 
        let scoreFinal = parseInt(valorLimpo) || 0;

        return { 
            nome: jogador.nome, 
            score: scoreFinal,
            valorTexto: input.value 
        };
    });

    // Resumo para conferência antes de travar
    let resumo = "CONFIRMAR PONTUAÇÕES DA MESA:\n\n";
    pontuacoesDigitadas.forEach(p => {
        resumo += `${p.nome}: ${p.valorTexto}\n`;
    });

    if (confirm(resumo + "\nAs pontuações estão corretas? A mesa será travada permanentemente.")) {
        
        const pontosCalculados = calcularPontosDaPartida(pontuacoesDigitadas);
        
        pontosCalculados.forEach(resultado => {
            bancoDeDados.classificacao[resultado.nome] += resultado.pontos;
        });

        // Salva metadados para persistência
        bancoDeDados.mesasConcluidas[mesaKey] = true;
        bancoDeDados.pontosDasMesas[mesaKey] = pontuacoesDigitadas.map(p => p.valorTexto);

        salvarDadosNoNavegador();
        renderizarInterfaceDoTorneio(); 
        alert("Mesa aprovada!");
    }
}

/**
 * Constrói a interface das mesas com validação de caracteres em tempo real.
 */
function renderizarInterfaceDoTorneio() {
    const contentorRodadas = document.getElementById('roundsContainer');
    contentorRodadas.innerHTML = "";
    
    if (!bancoDeDados.chaveamento) return;

    bancoDeDados.chaveamento.forEach((rodada, rIdx) => {
        contentorRodadas.innerHTML += `<div class="round-header">RODADA ${rIdx + 1}</div>`;
        
        rodada.forEach((mesa, mIdx) => {
            const mesaKey = `${rIdx}_${mIdx}`;
            const isTravada = bancoDeDados.mesasConcluidas[mesaKey] || false;
            const pontosSalvos = bancoDeDados.pontosDasMesas[mesaKey] || ["30.000", "30.000", "30.000", "30.000"];
            
            let htmlMesa = `<div class="mesa-box" style="${isTravada ? 'border-left: 5px solid #607d8b;' : ''}">
                                <strong>MESA ${mIdx + 1}</strong><br><br>`;
            
            mesa.forEach((jogador, jIdx) => {
                htmlMesa += `
                    <div class="player-row">
                        <div>
                            <span class="vento-tag v-${jogador.vento}">${jogador.vento}</span> 
                            <strong>${jogador.nome}</strong>
                        </div>
                        <input type="text" 
                               id="score_${rIdx}_${mIdx}_${jIdx}" 
                               value="${pontosSalvos[jIdx]}" 
                               ${isTravada ? 'readonly' : ''}
                               style="${isTravada ? 'background:#f8f9fa; color:#555; font-weight:bold; pointer-events:none;' : ''}"
                               oninput="this.value = this.value.replace(/[^-0-9.,]/g, '')" 
                               onclick="this.select()">
                    </div>`;
            });
            
            const btnLabel = isTravada ? 'APROVADO' : 'GUARDAR MESA';
            const btnIcon = isTravada ? 'lock' : 'save';
            const btnStyle = isTravada ? 'background:#607d8b; cursor:not-allowed' : '';

            htmlMesa += `
                <button onclick='registrarResultadoDaMesa(${rIdx}, ${mIdx}, ${JSON.stringify(mesa)})' 
                        class="btn-primary" 
                        ${isTravada ? 'disabled' : ''}
                        style="width:100%; justify-content:center; margin-top:10px; ${btnStyle}">
                    <span class="material-icons">${btnIcon}</span> ${btnLabel}
                </button></div>`;
                
            contentorRodadas.innerHTML += htmlMesa;
        });
    });
    atualizarTabelaDeRanking();
}

/**
 * Atualiza a tabela de classificação geral.
 */
function atualizarTabelaDeRanking() {
    const corpoTabela = document.querySelector('#rankingTable tbody');
    if(!corpoTabela) return;
    corpoTabela.innerHTML = "";
    
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
 * Salva o estado atual no LocalStorage.
 */
function salvarDadosNoNavegador() {
    localStorage.setItem('mahjong_pro_db', JSON.stringify(bancoDeDados));
    atualizarTabelaDeRanking();
}

/**
 * Reinicia o torneio e limpa o armazenamento.
 */
function resetarTudo() {
    if(confirm("Tem a certeza que deseja reiniciar o torneio? Todos os dados serão perdidos.")) {
        localStorage.clear();
        location.reload();
    }
}

// Inicialização automática
if(bancoDeDados.jogadores.length >= 8) {
    renderizarInterfaceDoTorneio();
    document.getElementById('championship').classList.remove('hidden');
}

/**
 * Gera o PDF com os resultados atuais.
 */
function gerarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dataHoje = new Date().toLocaleDateString('pt-BR');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(33, 150, 243); 
        doc.text("Riichi Tournament Pro", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Relatório Oficial de Ranking - Gerado em: ${dataHoje}`, 14, 30);

        const dadosParaTabela = Object.entries(bancoDeDados.classificacao)
            .sort((a, b) => b[1] - a[1])
            .map((item, index) => [`${index + 1}º`, item[0], item[1].toFixed(1)]);

        doc.autoTable({
            startY: 40,
            head: [['Posição', 'Nome do Jogador', 'Pontos de Torneio']],
            body: dadosParaTabela,
            theme: 'striped',
            headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255], halign: 'center' },
            columnStyles: { 0: { halign: 'center' }, 2: { halign: 'right', fontStyle: 'bold' } }
        });

        doc.save(`Ranking_Riichi_Torneio_${dataHoje.replace(/\//g, '-')}.pdf`);

    } catch (erro) {
        alert("Erro ao gerar PDF. Verifique sua conexão.");
    }
}