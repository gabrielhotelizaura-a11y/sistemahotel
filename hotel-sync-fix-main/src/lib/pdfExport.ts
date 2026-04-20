import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExpensePdfItem {
  date: string;
  description: string;
  value: number;
}

interface StatisticsPdfInput {
  monthLabel: string;
  totalRevenue: number;
  totalReservations: number;
  occupancyRate: number;
  averageStay: number;
  completedReservations: Array<{
    room: string;
    guest: string;
    checkIn: string;
    checkOut: string;
    total: number;
  }>;
}

export function exportExpensesPdf(monthLabel: string, total: number, items: ExpensePdfItem[]) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Relatório de Despesas Operacionais', 14, 16);
  doc.setFontSize(11);
  doc.text(`Mês: ${monthLabel}`, 14, 24);
  doc.text(`Total: R$ ${total.toFixed(2)}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [['Data', 'Descrição', 'Valor (R$)']],
    body: items.map((item) => [item.date, item.description, item.value.toFixed(2)]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`despesas-${monthLabel.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function exportStatisticsPdf(input: StatisticsPdfInput) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Relatório de Estatísticas', 14, 16);
  doc.setFontSize(11);
  doc.text(`Mês: ${input.monthLabel}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [['Indicador', 'Valor']],
    body: [
      ['Receita total', `R$ ${input.totalRevenue.toFixed(2)}`],
      ['Total de reservas', String(input.totalReservations)],
      ['Taxa de ocupação', `${input.occupancyRate.toFixed(1)}%`],
      ['Estadia média', `${input.averageStay.toFixed(1)} dias`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [39, 174, 96] },
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Quarto', 'Hóspede', 'Check-in', 'Check-out', 'Total (R$)']],
    body: input.completedReservations.map((item) => [
      item.room,
      item.guest,
      item.checkIn,
      item.checkOut,
      item.total.toFixed(2),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [39, 174, 96] },
  });

  doc.save(`estatisticas-${input.monthLabel.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
