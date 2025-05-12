// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// interface Porosia {
//   cmimi: number;
//   dataPorosise: string;
//   emri: string;
//   id: number;
//   pershkrimi: string;
//   prodhuesi: string;
//   sasia: number;
//   shenime: string;
//   statusi: string;
//   kompania: string;
//   shkolla: string;
//   origjina: string;
//   selected?: boolean;
// }

// interface PdfGeneratorProps {
//   records: Porosia[];
//   onSuccess: (message: string) => void;
//   onError: (message: string) => void;
// }

// export const generateOrdersPDF = ({ records, onSuccess, onError }: PdfGeneratorProps) => {
//   try {
//     const selectedRecords = records.filter((r) => r.selected);
//     if (selectedRecords.length === 0) {
//       onError("Ju lutem përzgjidhni porositë që doni të përfshini në PDF.");
//       return;
//     }

//     const today = new Date().toLocaleDateString("sq-AL");
//     const fileName = `Raport-Porosite-${today}.pdf`;

//     const currentYear = new Date().getFullYear();


//     const doc = new jsPDF();

//     // Add header with logo
//     doc.setFillColor(63, 81, 181);
//     doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(24);
//     doc.setFont("helvetica", "bold");
//     doc.text("Raport i Porosive", 14, 25);

//     // Add date
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Data e gjenerimit: ${today}`, 14, 35);

//     // Add table
//     autoTable(doc, {
//       startY: 50,
//       head: [["Porosia", "Sasia", "Çmimi", "Kompania", "Shkolla", "Data", "Statusi"]],
//       body: selectedRecords.map((r) => [
//         r.emri,
//         r.sasia,
//         r.cmimi + " €",
//         r.kompania,
//         r.shkolla,
//         new Date(r.dataPorosise).toLocaleDateString("sq-AL"),
//         r.statusi,
//       ]),
//       headStyles: {
//         fillColor: [63, 81, 181],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//       },
//       alternateRowStyles: {
//         fillColor: [241, 245, 249],
//       },
//       styles: {
//         fontSize: 8,
//         cellPadding: 6,
//       },
//     });

//      // Totals
//      const totals = {
//       all: 0,
//       nePritje: 0,
//       paguar: 0,
//       fshire: 0,
//     };

//     selectedRecords.forEach((r) => {
//       totals.all += r.cmimi;
//       if (r.statusi === "Ne Pritje") totals.nePritje += r.cmimi;
//       else if (r.statusi === "Paguar") totals.paguar += r.cmimi;
//       else if (r.statusi === "Fshire") totals.fshire += r.cmimi;
//     });

//     let finalY = (doc as any).lastAutoTable.finalY + 10;

//     doc.setFontSize(10);
//     doc.setTextColor(0, 0, 0);
//     doc.text("Përmbledhje Totale të Çmimeve:", 14, finalY);
//     finalY += 6;
//     doc.text(`Totali Gjithsej: ${totals.all.toFixed(2)} €`, 14, finalY);
//     finalY += 6;
//     doc.text(`Totali 'Ne Pritje': ${totals.nePritje.toFixed(2)} €`, 14, finalY);
//     finalY += 6;
//     doc.text(`Totali 'Paguar': ${totals.paguar.toFixed(2)} €`, 14, finalY);
//     finalY += 6;
//     doc.text(`Totali 'Fshire': ${totals.fshire.toFixed(2)} €`, 14, finalY);

//     autoTable(doc, {
//       startY: finalY + 10,
//       head: [["Statusi", "Totali (€)"]],
//       body: [
//         ["Ne Pritje", totals.nePritje.toFixed(2)],
//         ["Paguar", totals.paguar.toFixed(2)],
//         ["Fshire", totals.fshire.toFixed(2)],
//         ["Gjithsej", totals.all.toFixed(2)],
//       ],
//       headStyles: {
//         fillColor: [22, 160, 133], // A teal color for variety
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//       },
//       styles: {
//         fontSize: 10,
//         halign: "center",
//         cellPadding: 4,
//       },
//       columnStyles: {
//         1: { halign: 'right' }
//       }
//     });
    

//     // Add footer with credits
//     const pageCount = (doc as any).internal.pages.length - 1;
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(10);
//       doc.setTextColor(128, 128, 128);
      
//       // Add credits
//       doc.text(`© ${currentYear} FIEK STUDENTS`, 
//         doc.internal.pageSize.width / 2, 
//         doc.internal.pageSize.height - 10, 
//         { align: "center" }
//       );
      
//       // Add page numbers
//       doc.text(
//         `Faqja ${i} nga ${pageCount}`,
//         doc.internal.pageSize.width - 20,
//         doc.internal.pageSize.height - 10,
//         { align: "right" }
//       );
//     }

//     doc.save(fileName);
//     onSuccess("PDF u gjenerua dhe u shkarkua me sukses!");
//   } catch (error) {
//     onError("Gabim gjatë gjenerimit të PDF-së.");
//     console.error("PDF generation error:", error);
//   }
// };




// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import Chart from "chart.js/auto";

// interface Porosia {
//   cmimi: number;
//   dataPorosise: string;
//   emri: string;
//   id: number;
//   pershkrimi: string;
//   prodhuesi: string;
//   sasia: number;
//   shenime: string;
//   statusi: string;
//   kompania: string;
//   shkolla: string;
//   origjina: string;
//   selected?: boolean;
// }

// interface PdfGeneratorProps {
//   records: Porosia[];
//   onSuccess: (message: string) => void;
//   onError: (message: string) => void;
// }

// export const generateOrdersPDF = async ({ records, onSuccess, onError }: PdfGeneratorProps) => {
//   try {
//     const selectedRecords = records.filter((r) => r.selected);
//     if (selectedRecords.length === 0) {
//       onError("Ju lutem përzgjidhni porositë që doni të përfshini në PDF.");
//       return;
//     }

//     const today = new Date().toLocaleDateString("sq-AL");
//     const fileName = `Raport-Porosite-${today}.pdf`;

//     const totals = {
//       all: 0,
//       nePritje: 0,
//       paguar: 0,
//       fshire: 0,
//     };

//     selectedRecords.forEach((r) => {
//       totals.all += r.cmimi;
//       if (r.statusi === "Ne Pritje") totals.nePritje += r.cmimi;
//       else if (r.statusi === "Paguar") totals.paguar += r.cmimi;
//       else if (r.statusi === "Fshire") totals.fshire += r.cmimi;
//     });

//     const canvas = document.createElement("canvas");
//     canvas.width = 400;
//     canvas.height = 400;
//     document.body.appendChild(canvas); // Optional, only needed if the chart doesn’t render off-screen
    
//     const ctx = canvas.getContext("2d");
//     if (!ctx) throw new Error("Could not get canvas context.");
    
//     let chartRendered = false;
    
//     // Create a Promise that resolves when chart is fully drawn
//     const chartReady = new Promise<void>((resolve) => {
//       new Chart(ctx, {
//         type: "pie",
//         data: {
//           labels: ["Ne Pritje", "Paguar", "Fshire"],
//           datasets: [
//             {
//               label: "Totali për Status",
//               data: [totals.nePritje, totals.paguar, totals.fshire],
//               backgroundColor: ["#FFC107", "#4CAF50", "#F44336"],
//             },
//           ],
//         },
//         options: {
//           animation: {
//             onComplete: () => {
//               chartRendered = true;
//               resolve();
//             },
//           },
//           plugins: {
//             legend: {
//               position: "bottom",
//               labels: {
//                 font: {
//                   size: 110,  // Increase the font size of the legend labels (default is usually 12)
//                 },
//               },
//             },
//           },
//         },
//       });
//     });
    
    
//     // Wait until chart finishes rendering
//     await chartReady;
    
//     // Get image data only after chart is fully drawn
//     const chartImg = canvas.toDataURL("image/png");
    
//     // Clean up canvas if added to DOM
//     canvas.remove();
    

//     // // Wait for chart to render properly
//     // chart.update();
//     // await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased to 1 second

//     // // Generate the chart image data
//     // const chartImg = canvas.toDataURL("image/png");

//     // Debugging: Log the image data
//     console.log("Chart image data:", chartImg);

//     // Check if the image data is valid
//     if (chartImg && chartImg.startsWith("data:image/png;base64,")) {
//       const doc = new jsPDF();

//       // Header
//       doc.setFillColor(63, 81, 181);
//       doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

//       doc.setTextColor(255, 255, 255);
//       doc.setFontSize(24);
//       doc.setFont("helvetica", "bold");
//       doc.text("Raport i Porosive", 14, 25);
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "normal");
//       doc.text(`Data e gjenerimit: ${today}`, 14, 35);

//       // Table
//       autoTable(doc, {
//         startY: 50,
//         head: [["Porosia", "Sasia", "Çmimi", "Kompania", "Shkolla", "Data", "Statusi"]],
//         body: selectedRecords.map((r) => [
//           r.emri,
//           r.sasia,
//           `${r.cmimi.toFixed(2)} €`,
//           r.kompania,
//           r.shkolla,
//           new Date(r.dataPorosise).toLocaleDateString("sq-AL"),
//           r.statusi,
//         ]),
//         headStyles: {
//           fillColor: [63, 81, 181],
//           textColor: [255, 255, 255],
//           fontStyle: "bold",
//         },
//         alternateRowStyles: {
//           fillColor: [241, 245, 249],
//         },
//         styles: {
//           fontSize: 8,
//           cellPadding: 6,
//         },
//       });

//       // Add Pie Chart Image
//       const finalY = (doc as any).lastAutoTable.finalY + 10;
//       doc.addImage(chartImg, "PNG", 50, finalY, 50, 50); // Add the chart image

//       // Footer
//       const currentYear = new Date().getFullYear();
//       const pageCount = (doc as any).internal.pages.length - 1;
//       for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i);
//         doc.setFontSize(10);
//         doc.setTextColor(128, 128, 128);

//         doc.text(`© ${currentYear} FIEK STUDENTS`,
//           doc.internal.pageSize.width / 2,
//           doc.internal.pageSize.height - 10,
//           { align: "center" }
//         );

//         doc.text(
//           `Faqja ${i} nga ${pageCount}`,
//           doc.internal.pageSize.width - 20,
//           doc.internal.pageSize.height - 10,
//           { align: "right" }
//         );
//       }

//       doc.save(fileName);
//       onSuccess("PDF u gjenerua dhe u shkarkua me sukses!");
//     } else {
//       console.error("Invalid chart image data:", chartImg);
//       onError("Gabim gjatë gjenerimit të diagramës në PDF.");
//     }
//   } catch (error) {
//     onError("Gabim gjatë gjenerimit të PDF-së.");
//     console.error("PDF generation error:", error);
//   }
// };













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

      // Header
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Raport i Porosive", 14, 25);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Data e gjenerimit: ${today}`, 14, 35);

     // Header
doc.setFillColor(63, 81, 181);
doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(24);
doc.setFont("helvetica", "bold");
doc.text("Raport i Porosive", 14, 15);
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.text(`Data e gjenerimit: ${today}`, 14, 25);

// Add the period line before the table content
if (filters.ngaData && filters.deriData) {
  const periodText = `Për periudhën ${filters.ngaData} deri më ${filters.deriData}`;
  doc.text(periodText, 14, 32); // Ensure this comes before the table and other content
}

      // Orders Table
      const orderTableData = selectedRecords.map((r) => [
        r.emri,
        r.dataPorosise.split("T")[0], // To only display the date part (yyyy-mm-dd)
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

      let currentY = 50; // Starting position for the order table

      // Use autoTable to create the order table
      doc.autoTable({
        startY: currentY,
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
        didDrawPage: (data: any) => {
          // Check if there is enough space for both the table and the pie chart
          const pageHeight = doc.internal.pageSize.height;
          const tableEndY = data.cursor.y;

          // If there's not enough space left, add a new page
          const remainingHeight = pageHeight - tableEndY;
          if (remainingHeight < 120) {
            doc.addPage();
            currentY = 20; // Reset Y to start from the top of the new page
          }

          // Now draw the title for the balance table
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Bilanci i qarkullimit", 14, currentY);

          // Draw the small totals table
          const smallTableData = [
            ["Statusi", "Totali (€)", "Përqindja (%)"],
            ["Ne Pritje", `${totals.nePritje.toFixed(2)} €`, `${nePritjePercent.toFixed(2)}%`],
            ["Paguar", `${totals.paguar.toFixed(2)} €`, `${paguarPercent.toFixed(2)}%`],
            ["Fshire", `${totals.fshire.toFixed(2)} €`, `${fshirePercent.toFixed(2)}%`],
          ];

          doc.autoTable({
            startY: currentY + 10,  // Start below the title
            head: [smallTableData[0]],  // Wrap the header inside an array
            body: smallTableData.slice(1),  // Rest of the table data
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
            tableWidth: 100, // Adjust table width to make it smaller
          });

          // Add Pie Chart Image
          const chartX = doc.internal.pageSize.width - 80; // Right side of the page
          const chartY = currentY + 10;  // Align with the start of the table
          doc.addImage(chartImg, "PNG", chartX, chartY, 55, 55);  // Positioned to the right side
        },
      });

      //  Footer
      const currentYear = new Date().getFullYear();
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);

        doc.text(`© ${currentYear} FinancaEdu`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );

        doc.text(
          `Faqja ${i} nga ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );

        // Signature section on the left side
  const leftX = 14;
  const signatureY = doc.internal.pageSize.height - 30;
  
  doc.text("Emri i zyrtarit: _________________________", leftX, signatureY);
  doc.text("Nënshkrimi i zyrtarit: ____________________", leftX, signatureY + 10);

  // Stamp section on the right side
  const rightX = doc.internal.pageSize.width - 70;
  
  doc.text("Vula: _____________________", rightX, signatureY);
  doc.text("Nr i protokollit: ______________", rightX, signatureY + 10);
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