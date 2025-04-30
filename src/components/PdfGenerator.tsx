import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfGeneratorProps {
  records: any[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const generateOrdersPDF = ({ records, onSuccess, onError }: PdfGeneratorProps) => {
  try {
    const selectedRecords = records.filter((r) => r.selected);
    if (selectedRecords.length === 0) {
      onError("Ju lutem përzgjidhni porositë që doni të përfshini në PDF.");
      return;
    }

    const today = new Date().toLocaleDateString("sq-AL");
    const fileName = `Raport-Porosite-${today}.pdf`;

    const doc = new jsPDF();

    // Add header with logo
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Raport i Porosive", 14, 25);

    // Add date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Data e gjenerimit: ${today}`, 14, 35);

    // Add table
    autoTable(doc, {
      startY: 50,
      head: [["Porosia", "Sasia", "Kompania", "Shkolla", "Data", "Statusi"]],
      body: selectedRecords.map((r) => [
        r.porosia,
        r.sasia,
        r.kompania,
        r.shkolla,
        new Date(r.data).toLocaleDateString("sq-AL"),
        r.statusi,
      ]),
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      styles: {
        fontSize: 10,
        cellPadding: 6,
      },
    });

    // Add footer with credits
    const pageCount = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      
      // Add credits
      doc.text("© 2025 FIEK STUDENTS", 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: "center" }
      );
      
      // Add page numbers
      doc.text(
        `Faqja ${i} nga ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    doc.save(fileName);
    onSuccess("PDF u gjenerua dhe u shkarkua me sukses!");
  } catch (error) {
    onError("Gabim gjatë gjenerimit të PDF-së.");
    console.error("PDF generation error:", error);
  }
};