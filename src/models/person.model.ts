import { Adresa } from "./adresa.model";

export interface Person {
    nrPersonal: number;
    emri: string;
    mbiemri: string 
    nacionaliteti: string;
    adresaId: number;
    adresa?: Adresa;
    gjinia: string;
    dataLindjes: string;
}  
