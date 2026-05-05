/**
 * Módulo de Exportação de Documentos.
 * Responsável por converter a tabela de classificação em um arquivo PDF profissional.
 */
function gerarPDF() {
    // Inicializa a instância do jsPDF a partir da biblioteca externa
    const { jsPDF } = window.jspdf;
    const documento = new jsPDF();

    // --- CONFIGURAÇÃO DE CABEÇALHO ---
    documento.setFontSize(18);
    documento.setTextColor(33, 150, 243); // Cor Primary (--primary)
    documento.text("Classificação Geral - Riichi Tournament Pro", 14, 20);
    
    documento.setFontSize(10);
    documento.setTextColor(100); // Tom cinza para metadados
    const carimboDataHora = `${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`;
    documento.text(`Relatório oficial gerado em: ${carimboDataHora}`, 14, 28);

    // --- COLETA DE DADOS ---
    // Captura as linhas da tabela que o ui.js gerou
    const linhasTabelaInput = document.querySelectorAll("#rankingTable tbody tr");
    const dadosFormatados = [];
    
    linhasTabelaInput.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        if (colunas.length >= 3) {
            dadosFormatados.push([
                colunas[0].innerText, // Posição (ex: 1º)
                colunas[1].innerText, // Nome do Jogador
                colunas[2].innerText  // Pontuação Total
            ]);
        }
    });

    // --- GERAÇÃO DA TABELA (AUTO-TABLE) ---
    documento.autoTable({
        startY: 35,
        head: [['Rank', 'Nome do Atleta', 'Pontuação (PT)']],
        body: dadosFormatados,
        theme: 'striped', // Estilo zebrado para facilitar leitura
        headStyles: { 
            fillColor: [33, 150, 243], // Azul do sistema
            textColor: [255, 255, 255],
            fontStyle: 'bold' 
        },
        styles: { 
            font: 'helvetica', 
            fontSize: 10,
            cellPadding: 4 
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 20 }, // Rank centralizado
            2: { halign: 'right', fontStyle: 'bold' } // Pontos à direita e em negrito
        },
        didDrawPage: (data) => {
            // Rodapé simples com número de página
            const str = "Página " + documento.internal.getNumberOfPages();
            documento.setFontSize(8);
            documento.text(str, data.settings.margin.left, documento.internal.pageSize.height - 10);
        }
    });

    // --- DOWNLOAD ---
    // Usa um timestamp no nome para evitar arquivos duplicados com o mesmo nome
    const timestamp = new Date().getTime();
    documento.save(`ranking_mahjong_${timestamp}.pdf`);

    // No final do arquivo pdf.js (referência imagem_e11e42.png)
    window.ui.gerarPDF = gerarPDF;
}