import type { JsPdfWindow, TournamentState } from "./types";

// Mantem a exportacao isolada para trocar biblioteca ou layout de PDF sem mexer no app.
export function exportRankingPdf(tournament: TournamentState): void {
  const pdfWindow = window as JsPdfWindow;

  if (!pdfWindow.jspdf) {
    window.alert("Biblioteca PDF ainda nao carregou. Tente novamente em alguns segundos.");
    return;
  }

  const document = new pdfWindow.jspdf.jsPDF();
  const rows = Object.entries(tournament.classification)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
    .map(([player, points], index) => [
      `${index + 1}o`,
      player,
      points.toFixed(1),
    ]);

  document.setFontSize(18);
  document.setTextColor(33, 150, 243);
  document.text("Classificacao Geral - Riichi Tournament Pro", 14, 20);
  document.setFontSize(10);
  document.setTextColor(100);
  document.text(
    `Relatorio oficial gerado em: ${new Date().toLocaleString("pt-BR")}`,
    14,
    28,
  );
  document.autoTable({
    startY: 35,
    head: [["Rank", "Nome do Atleta", "Pontuacao (PT)"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      2: { halign: "right", fontStyle: "bold" },
    },
    didDrawPage: (data: { settings: { margin: { left: number } } }) => {
      const page = `Pagina ${document.internal.getNumberOfPages()}`;
      document.setFontSize(8);
      document.text(page, data.settings.margin.left, document.internal.pageSize.height - 10);
    },
  });
  document.save(`ranking_mahjong_${Date.now()}.pdf`);
}
