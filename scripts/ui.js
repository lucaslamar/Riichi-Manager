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
 * Tratamento de dados:
 * 1. Separa nomes por quebra de linha ou vírgula.
 * 2. Formata nomes (Primeira Letra Maiúscula, demais minúsculas).
 * 3. Valida regras de negócio (Mínimo 8 jogadores e múltiplo de 4).
 */
function iniciarTorneio() {
    const campoTexto = document.getElementById('playerList');
    
    // REGEX: Separa por vírgula (,) OU quebra de linha (\n)
    const nomesBrutos = campoTexto.value.split(/,|\n/);
    
    const nomesProcessados = nomesBrutos
        .map(nome => {
            // Remove espaços extras no início e fim
            let n = nome.trim();
            if (n === "") return null;

            // FORMATAÇÃO: Primeira letra maiúscula de cada palavra (Title Case)
            // Ex: "kitos mio" -> "Kitos Mio", "LAMAR" -> "Lamar"
            return n.toLowerCase().replace(/(?:^|\s)\S/g, function(a) {
                return a.toUpperCase();
            });
        })
        .filter(n => n !== null); // Remove entradas vazias

    // Validação de Regra de Negócio
    if (nomesProcessados.length < 8) {
        return alert("Erro: O torneio precisa de pelo menos 8 jogadores.");
    }
    if (nomesProcessados.length % 4 !== 0) {
        return alert(`Erro: Tens ${nomesProcessados.length} jogadores. O total deve ser múltiplo de 4.`);
    }

    // Preparação e Chaveamento
    const nomesEmbaralhados = embaralharJogadores(nomesProcessados);
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

/**
 * Gera um arquivo PDF profissional com o ranking atual do torneio.
 * Utiliza as bibliotecas jsPDF e jsPDF-AutoTable.
 */
function gerarPDF() {
    try {
        // 1. Inicializa o documento PDF (formato A4)
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 2. Configurações de Estilo e Cabeçalho
        const dataHoje = new Date().toLocaleDateString('pt-BR');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(33, 150, 243); // Azul Primário
        doc.text("Riichi Tournament Pro", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(`Relatório Oficial de Ranking - Gerado em: ${dataHoje}`, 14, 30);

        // 3. Preparação dos Dados da Tabela
        // Convertemos o objeto de classificação num array ordenado para o PDF
        const dadosParaTabela = Object.entries(bancoDeDados.classificacao)
            .sort((a, b) => b[1] - a[1])
            .map((item, index) => [
                `${index + 1}º`, // Posição
                item[0],        // Nome do Jogador
                item[1].toFixed(1) // Pontuação Acumulada
            ]);

        // 4. Criação da Tabela usando o Plugin AutoTable
        doc.autoTable({
            startY: 40,
            head: [['Posição', 'Nome do Jogador', 'Pontos de Torneio']],
            body: dadosParaTabela,
            theme: 'striped',
            headStyles: {
                fillColor: [33, 150, 243],
                textColor: [255, 255, 255],
                fontSize: 12,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 30 }, // Pos
                1: { halign: 'left' },                 // Nome
                2: { halign: 'right', fontStyle: 'bold' } // Pontos
            },
            styles: {
                font: "helvetica",
                fontSize: 11,
                cellPadding: 5
            },
            didDrawPage: function (data) {
                // Rodapé com numeração de página
                const str = "Página " + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        // 5. Nome do arquivo baseado na data e download
        const nomeArquivo = `Ranking_Riichi_Torneio_${dataHoje.replace(/\//g, '-')}.pdf`;
        doc.save(nomeArquivo);

    } catch (erro) {
        console.error("Erro ao gerar PDF:", erro);
        alert("Não foi possível gerar o PDF. Certifique-se de que está ligado à internet para carregar as bibliotecas de exportação.");
    }
}