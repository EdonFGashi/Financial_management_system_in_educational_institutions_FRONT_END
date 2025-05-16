import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Chart } from "chart.js/auto";  // Ensure chart.js is imported correctly

// Define the Porosia interface
interface Porosia {
  cmimi: number;
  dataPorosise: string;
  emri: string;
  id: number;
  pershkrimi: string;
  prodhuesi: string;
  sasia: number;
  shenime: string;
  statusi: string;
  kompania: string;
  shkolla: string;
  origjina: string;
  selected?: boolean;
}

// Define the PdfGeneratorProps interface
interface PdfGeneratorProps {
  records: Porosia[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// Add this interface near the top with other interfaces
interface AutoTableHookData {
  pageCount: number;
  cursor: { x: number; y: number };
  settings: any;
  doc: jsPDF;
  [key: string]: any;
}

export const generateOrdersPDF = async ({ records, filters, onSuccess, onError }: PdfGeneratorProps & { filters: { ngaData: string, deriData: string } }) => {
  try {
    const selectedRecords = records.filter((r) => r.selected);
    if (selectedRecords.length === 0) {
      onError("Ju lutem përzgjidhni porositë që doni të përfshini në PDF.");
      return;
    }

    const today = new Date().toLocaleDateString("sq-AL");
    const fileName = `Raport-Porosite-${today}.pdf`;

    const totals = {
      all: 0,
      nePritje: 0,
      paguar: 0,
      fshire: 0,
    };

    selectedRecords.forEach((r) => {
      totals.all += r.cmimi;
      if (r.statusi === "Ne Pritje") totals.nePritje += r.cmimi;
      else if (r.statusi === "Paguar") totals.paguar += r.cmimi;
      else if (r.statusi === "Fshire") totals.fshire += r.cmimi;
    });

    // Calculate the percentages for each status
    const nePritjePercent = (totals.nePritje / totals.all) * 100;
    const paguarPercent = (totals.paguar / totals.all) * 100;
    const fshirePercent = (totals.fshire / totals.all) * 100;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context.");

    let chartRendered = false;

    const chartReady = new Promise<void>((resolve) => {
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Ne Pritje", "Paguar", "Fshire"],
          datasets: [
            {
              label: "Totali për Status",
              data: [totals.nePritje, totals.paguar, totals.fshire],
              backgroundColor: ["#FFC107", "#4CAF50", "#F44336"],
            },
          ],
        },
        options: {
          animation: {
            onComplete: () => {
              chartRendered = true;
              resolve();
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: {
                  size: 100,
                },
              },
            },
          },
        },
      });
    });

    // Wait for the chart to finish rendering
    await chartReady;

    const chartImg = canvas.toDataURL("image/png");

    // Clean up canvas after rendering
    canvas.remove();

    if (chartImg && chartImg.startsWith("data:image/png;base64,")) {
      const doc = new jsPDF();

      // Header for first page
      const addHeader = (doc: jsPDF) => {
        doc.setFillColor(63, 81, 181);
        doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("Raport i Porosive", 14, 15);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Data e gjenerimit: ${today}`, 14, 25);
        
        if (filters.ngaData && filters.deriData) {
          const periodText = `Për periudhën ${filters.ngaData} deri më ${filters.deriData}`;
          doc.text(periodText, 14, 32);
        }
      };

      // Add header to first page
      addHeader(doc);

      // Orders Table
      const orderTableData = selectedRecords.map((r) => [
        r.emri,
        r.dataPorosise.split("T")[0],
        r.pershkrimi,
        r.sasia,
        r.cmimi.toFixed(2),
        r.statusi,
      ]);

      const orderTableHeader = [
        "Emri",
        "Data Porosisë",
        "Përshkrimi",
        "Sasia",
        "Çmimi (€)",
        "Statusi",
      ];

      // Generate main table
      doc.autoTable({
        startY: 50,
        head: [orderTableHeader],
        body: orderTableData,
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
        },
        styles: {
          fontSize: 8,
          cellPadding: 6,
        },
        didDrawPage: (data: AutoTableHookData) => {
          // Add header to each page except the last one
          if (data.pageCount !== doc.internal.pages.length - 1) {
            addHeader(doc);
          }
        },
      });

      // Add new page for graphs and signatures
      doc.addPage();

      // Title for summary page
      doc.setFontSize(24);
      doc.setTextColor(63, 81, 181);
      doc.setFont("helvetica", "bold");
      doc.text("Përmbledhje e Raportit", doc.internal.pageSize.width / 2, 30, { align: "center" });

      // Add pie chart
      doc.addImage(chartImg, "PNG", (doc.internal.pageSize.width - 100) / 2, 50, 100, 100);

      // Summary table below the chart
      const summaryData = [
        ["Statusi", "Totali (€)", "Përqindja (%)"],
        ["Ne Pritje", `${totals.nePritje.toFixed(2)} €`, `${((totals.nePritje / totals.all) * 100).toFixed(1)}%`],
        ["Paguar", `${totals.paguar.toFixed(2)} €`, `${((totals.paguar / totals.all) * 100).toFixed(1)}%`],
        ["Fshire", `${totals.fshire.toFixed(2)} €`, `${((totals.fshire / totals.all) * 100).toFixed(1)}%`],
        ["Totali", `${totals.all.toFixed(2)} €`, "100%"],
      ];

      doc.autoTable({
        startY: 160,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          halign: 'center',
          fontSize: 10,
        },
        margin: { left: 50, right: 50 },
      });

      // Signature section
      const signatureY = doc.internal.pageSize.height - 60;
      
      // Left side
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("Emri i zyrtarit:", 20, signatureY);
      doc.line(20, signatureY + 5, 100, signatureY + 5);
      
      doc.text("Nënshkrimi i zyrtarit:", 20, signatureY + 20);
      doc.line(20, signatureY + 25, 100, signatureY + 25);

      // Right side
      const rightX = doc.internal.pageSize.width - 100;
      doc.text("Vula:", rightX, signatureY);
      doc.line(rightX, signatureY + 5, rightX + 80, signatureY + 5);
      
      doc.text("Nr i protokollit:", rightX, signatureY + 20);
      doc.line(rightX, signatureY + 25, rightX + 80, signatureY + 25);

      // Footer for all pages
      const pageCount = doc.internal.pages.length;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(
          `© ${new Date().getFullYear()} FinancaEdu | Faqja ${i} nga ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      doc.save(fileName);
      onSuccess("PDF u gjenerua dhe u shkarkua me sukses!");
    } else {
      console.error("Invalid chart image data:", chartImg);
      onError("Gabim gjatë gjenerimit të diagramës në PDF.");
    }
  } catch (error) {
    onError("Gabim gjatë gjenerimit të PDF-së.");
    console.error("PDF generation error:", error);
  }
};

// New code for generating history PDF
interface HistoryEntry {
  id: number;
  shkollaId: number;
  emriShkolles: string;
  shuma: number;
  lloji: "Rritje" | "Zvogëlim";
  data: string;
  shenime: string;
  selected?: boolean;
  emriDrejtorit: string;
  mbiemriDrejtorit: string;
}

export const generateHistoryPDF = async ({ 
  entries, 
  filters, 
  onSuccess, 
  onError 
}: { 
  entries: HistoryEntry[],
  filters: { ngaData: string, deriData: string, shkolla?: string, drejtori?: string },
  onSuccess: (message: string) => void,
  onError: (message: string) => void
}) => {
  try {
    const selectedEntries = entries.filter(e => e.selected);
    if (selectedEntries.length === 0) {
      onError("Ju lutem përzgjidhni së paku një regjistrim.");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("sq-AL");
    const fileName = `Historiku-Transaksioneve-${today}.pdf`;

    // Header
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Historiku i Transaksioneve", 14, 15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Data e gjenerimit: ${today}`, 14, 25);

    if (filters.ngaData && filters.deriData) {
      doc.text(`Periudha: ${filters.ngaData} - ${filters.deriData}`, 14, 32);
    }

    // Calculate totals
    const totals = {
      rritje: selectedEntries.filter(e => e.lloji === "Rritje")
        .reduce((acc, curr) => acc + curr.shuma, 0),
      zvogelim: selectedEntries.filter(e => e.lloji === "Zvogëlim")
        .reduce((acc, curr) => acc + curr.shuma, 0)
    };

    // Main table
    doc.autoTable({
      startY: 50,
      head: [["Drejtori", "Shkolla", "Lloji", "Shuma", "Data", "Përshkrimi"]],
      body: selectedEntries.map(e => [
        `${e.emriDrejtorit} ${e.mbiemriDrejtorit}`,
        e.emriShkolles,
        e.lloji,
        `${e.lloji === "Rritje" ? "+" : "-"}${e.shuma.toFixed(2)} €`,
        new Date(e.data).toLocaleDateString("sq-AL"),
        e.shenime
      ]),
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249]
      },
      styles: {
        fontSize: 10,
        cellPadding: 6
      }
    });

    // Add new page for summary
    doc.addPage();

    // Summary page header
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Përmbledhje e Transaksioneve", doc.internal.pageSize.width / 2, 25, { align: "center" });

    // Add decorative element
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(2);
    doc.line(20, 50, doc.internal.pageSize.width - 20, 50);

    // Summary statistics in a grid layout
    const startY = 70;
    const colWidth = doc.internal.pageSize.width / 2;
    
    // Style for stat boxes
    const drawStatBox = (title: string, value: string, x: number, y: number, color: string) => {
      doc.setFillColor(color);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(x, y, colWidth - 30, 40, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(title, x + 10, y + 15);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + 10, y + 35);
    };

    // Draw stat boxes
    drawStatBox("Totali i Rritjeve", `+${totals.rritje.toFixed(2)} €`, 20, startY, '#4CAF50');
    drawStatBox("Totali i Zvogëlimeve", `-${totals.zvogelim.toFixed(2)} €`, colWidth, startY, '#F44336');

    // Net balance box spans full width
    const netBalance = totals.rritje - totals.zvogelim;
    const balanceColor = netBalance >= 0 ? '#2196F3' : '#FF5722';
    doc.setFillColor(balanceColor);
    doc.roundedRect(20, startY + 60, doc.internal.pageSize.width - 40, 50, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Bilanci Total", doc.internal.pageSize.width / 2, startY + 80, { align: "center" });
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${netBalance >= 0 ? '+' : ''}${netBalance.toFixed(2)} €`,
      doc.internal.pageSize.width / 2,
      startY + 100,
      { align: "center" }
    );

    // Add period info if available
    if (filters.ngaData && filters.deriData) {
      doc.setTextColor(128);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Periudha: ${filters.ngaData} - ${filters.deriData}`,
        doc.internal.pageSize.width / 2,
        startY + 130,
        { align: "center" }
      );
    }

    // Signature section at bottom of summary page
    const signatureY = doc.internal.pageSize.height - 60;
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    // Left side
    doc.text("Emri i zyrtarit:", 20, signatureY);
    doc.line(20, signatureY + 5, 100, signatureY + 5);
    doc.text("Nënshkrimi i zyrtarit:", 20, signatureY + 20);
    doc.line(20, signatureY + 25, 100, signatureY + 25);

    // Right side
    const rightX = doc.internal.pageSize.width - 100;
    doc.text("Vula:", rightX, signatureY);
    doc.line(rightX, signatureY + 5, rightX + 80, signatureY + 5);
    doc.text("Nr i protokollit:", rightX, signatureY + 20);
    doc.line(rightX, signatureY + 25, rightX + 80, signatureY + 25);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(
      `© ${new Date().getFullYear()} FinancaEdu`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    doc.save(fileName);
    onSuccess("PDF u gjenerua dhe u shkarkua me sukses!");
  } catch (error) {
    console.error("PDF generation error:", error);
    onError("Gabim gjatë gjenerimit të PDF-së.");
  }
};