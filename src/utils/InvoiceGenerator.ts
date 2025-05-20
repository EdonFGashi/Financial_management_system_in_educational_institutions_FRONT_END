import jsPDF from "jspdf";
import "jspdf-autotable"; // important to extend doc.autoTable types
import { Fatura } from "../models/fatura.model";

export function generateInvoice(faturat: Fatura[]) {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("sq-AL");

  // Header
  doc.setFontSize(18);
  doc.text("Fatura e Porosive", 14, 20);
  doc.setFontSize(11);
  doc.text(`Data: ${today}`, 14, 28);

  // Buyer Info
  if (faturat.length > 0) {
    const { kompaniaEmri } = faturat[0];
    doc.setFontSize(12);
    doc.text("Kompania:", 14, 38);
    doc.setFont("bold");
    doc.text(kompaniaEmri || "—", 40, 38);
    doc.setFont("normal");
  }

  // ✅ Correctly using doc.autoTable to get finalY
  doc.autoTable({
    startY: 48,
    head: [["Fatura ID", "Porosia ID", "Produkti", "Sasia", "Çmimi Total", "Data e Pageses"]],
    body: faturat.map((p) => [
      p.id,
      p.porosiaId,
      p.emriProduktit,
      p.sasia,
      `€${(p.cmimiTotal).toFixed(2)}`,
      new Date(p.dataPageses).toLocaleDateString("sq-AL")
    ]),
    theme: "grid",
    styles: { fontSize: 10 },
  });

  const finalY = doc.autoTable.previous?.finalY ?? 90;

  // Total
  const total = faturat.reduce((sum, p) => 0 + p.cmimiTotalMeTVSH * 1, 0);
  doc.setFontSize(12);
  doc.setFont("bold");
  doc.text(`Çmimi Total me TVSH: €${total.toFixed(2)}`, 14, finalY + 10);

  // Footer
  doc.setFontSize(10);
  doc.setFont("italic");
  doc.text("Faleminderit për porosinë tuaj!", 14, finalY + 20);

  doc.save("fatura_porosive.pdf");
}
