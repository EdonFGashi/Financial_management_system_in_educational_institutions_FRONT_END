// src/types/jspdf-autotable.d.ts
import jsPDF from "jspdf";

declare module "jspdf" {
  interface jsPDF {
    autoTable: any; // This makes sure TypeScript recognizes autoTable
  }
}
