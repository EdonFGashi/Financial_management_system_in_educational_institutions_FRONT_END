import jsPDF from "jspdf";
import "jspdf-autotable"; // important to extend doc.autoTable types
import { Porosia } from "../models/porosia.model";

export function generateInvoice(porosite: Porosia[]) {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("sq-AL");

  // Header
  doc.setFontSize(18);
  doc.text("Fatura e Porosive", 14, 20);
  doc.setFontSize(11);
  doc.text(`Data: ${today}`, 14, 28);

  // Buyer Info
  if (porosite.length > 0) {
    const { kompaniaEmri } = porosite[0];
    doc.setFontSize(12);
    doc.text("Kompania:", 14, 38);
    doc.setFont("bold");
    doc.text(kompaniaEmri || "—", 40, 38);
    doc.setFont("normal");
  }

  // ✅ Correctly using doc.autoTable to get finalY
  doc.autoTable({
    startY: 48,
    head: [["ID", "Produkti", "Sasia", "Data", "Çmimi", "Statusi"]],
    body: porosite.map((p) => [
      p.id,
      p.produktiEmri,
      p.sasia,
      new Date(p.dataPorosise).toLocaleDateString("sq-AL"),
      `€${(p.produktiCmimi * p.sasia).toFixed(2)}`,
      p.statusi,
    ]),
    theme: "grid",
    styles: { fontSize: 10 },
  });

  const finalY = doc.autoTable.previous?.finalY ?? 90;

  // Total
  const total = porosite.reduce((sum, p) => sum + p.produktiCmimi * p.sasia, 0);
  doc.setFontSize(12);
  doc.setFont("bold");
  doc.text(`Totali: €${total.toFixed(2)}`, 14, finalY + 10);

  // Footer
  doc.setFontSize(10);
  doc.setFont("italic");
  doc.text("Faleminderit për porosinë tuaj!", 14, finalY + 20);

  doc.save("fatura_porosive.pdf");
}
