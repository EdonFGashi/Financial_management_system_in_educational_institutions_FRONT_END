export interface Produkti {
    id: number;
    emri: string;
    pershkrimi?: string;
    cmimi: number;
    sasiaNeStok: number;
    origjina?: string;
    prodhuesi?: string;
    fotografia?: string;
    kompaniaId: number;
    createdAt: Date;
    updatedAt?: Date;
}