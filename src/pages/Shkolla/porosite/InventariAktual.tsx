import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Inventar {
    inventariId: number;
    emri: string;
    pershkrimi: string;
    sasia: number;
    shifra: string;
    createdAt: string;
}

// Mock data fillestare
const initialMockData: Inventar[] = [
    { inventariId: 1, emri: "Laptop Dell", pershkrimi: "Laptop për mësues", sasia: 5, shifra: "SHF1001", createdAt: new Date(2025, 3, 1).toISOString() },
    { inventariId: 2, emri: "Printer Canon", pershkrimi: "Printer për zyrë", sasia: 2, shifra: "SHF1002", createdAt: new Date(2025, 3, 2).toISOString() },
    { inventariId: 3, emri: "Projektor Epson", pershkrimi: "Projektor për sallë", sasia: 1, shifra: "SHF1003", createdAt: new Date(2025, 3, 3).toISOString() },
    { inventariId: 4, emri: "Router TP-Link", pershkrimi: "Router për rrjet", sasia: 3, shifra: "SHF1004", createdAt: new Date(2025, 3, 4).toISOString() },
    { inventariId: 5, emri: "Tabela e Bardhë", pershkrimi: "Tabela për klasë", sasia: 4, shifra: "SHF1005", createdAt: new Date(2025, 3, 5).toISOString() },
    { inventariId: 6, emri: "Switch Cisco", pershkrimi: "Switch për rrjet", sasia: 2, shifra: "SHF1006", createdAt: new Date(2025, 3, 6).toISOString() },
    { inventariId: 7, emri: "Karrige Zyre", pershkrimi: "Karrige komode për zyrë", sasia: 10, shifra: "SHF1007", createdAt: new Date(2025, 3, 7).toISOString() },
    { inventariId: 8, emri: "Smart TV Samsung", pershkrimi: "TV për prezantime", sasia: 2, shifra: "SHF1008", createdAt: new Date(2025, 3, 8).toISOString() },
    { inventariId: 9, emri: "Lapsa Bic", pershkrimi: "Pako me lapsa shkollorë", sasia: 50, shifra: "SHF1009", createdAt: new Date(2025, 3, 9).toISOString() },
    { inventariId: 10, emri: "Projektor BenQ", pershkrimi: "Projektor rezervë", sasia: 1, shifra: "SHF1010", createdAt: new Date(2025, 3, 10).toISOString() },
];

let inventariIdCounter = initialMockData.length + 1;

function InventariAktual() {
    const [inventariList, setInventariList] = useState<Inventar[]>(() => {
        const stored = localStorage.getItem("inventariList");
        return stored && JSON.parse(stored).length > 0 ? JSON.parse(stored) : initialMockData;
    });

    const [formData, setFormData] = useState({
        emri: "",
        pershkrimi: "",
        sasia: 0,
        shifra: "",
    });

    const [filterEmri, setFilterEmri] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        localStorage.setItem("inventariList", JSON.stringify(inventariList));
    }, [inventariList]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "sasia" ? Number(value) : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: Inventar = {
            inventariId: inventariIdCounter++,
            emri: formData.emri,
            pershkrimi: formData.pershkrimi,
            sasia: formData.sasia,
            shifra: formData.shifra,
            createdAt: new Date().toISOString(),
        };
        setInventariList([newItem, ...inventariList]);
        setFormData({
            emri: "",
            pershkrimi: "",
            sasia: 0,
            shifra: "",
        });
        setCurrentPage(1);
    };

    const handleDelete = (id: number) => {
        const updatedList = inventariList.filter((i) => i.inventariId !== id);
        setInventariList(updatedList);

        const newTotalPages = Math.ceil(updatedList.length / itemsPerPage);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
        }
    };

    const handleInlineEdit = (
        id: number,
        field: "emri" | "pershkrimi" | "sasia" | "shifra",
        value: string | number
    ) => {
        setInventariList((prev) =>
            prev.map((i) =>
                i.inventariId === id
                    ? { ...i, [field]: field === "sasia" ? Number(value) : value }
                    : i
            )
        );
    };

    const filteredList = inventariList.filter((i) =>
        i.emri.toLowerCase().includes(filterEmri.toLowerCase())
    );

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-lime-600 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Inventari Aktual</h1>
                    <p className="text-base sm:text-lg text-green-100">Shto dhe menaxho inventarin</p>
                </div>

                {/* Form */}
                <div className="px-6 py-6">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-1 font-medium">Emri</label>
                                <input
                                    type="text"
                                    name="emri"
                                    value={formData.emri}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Shifra</label>
                                <input
                                    type="text"
                                    name="shifra"
                                    value={formData.shifra}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Sasia</label>
                                <input
                                    type="number"
                                    name="sasia"
                                    value={formData.sasia}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-1 font-medium">Përshkrimi</label>
                                <textarea
                                    name="pershkrimi"
                                    value={formData.pershkrimi}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                            >
                                Shto Invertar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Filters */}
                <div className="px-6 pb-4 flex justify-end">
                    <input
                        type="text"
                        placeholder="Filtro sipas emrit..."
                        value={filterEmri}
                        onChange={(e) => {
                            setFilterEmri(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 px-4 py-2 rounded w-full md:max-w-xs"
                    />
                </div>

                {/* Table */}
                <div className="px-6 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">#</th>
                                <th className="py-3 px-4 text-left">Emri</th>
                                <th className="py-3 px-4 text-left">Përshkrimi</th>
                                <th className="py-3 px-4 text-left">Sasia</th>
                                <th className="py-3 px-4 text-left">Shifra</th>
                                <th className="py-3 px-4 text-left">Krijuar më</th>
                                <th className="py-3 px-4 text-left">Fshi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedList.length > 0 ? (
                                paginatedList.map((item) => (
                                    <tr key={item.inventariId} className="border-t border-gray-200">
                                        <td className="py-3 px-4">{item.inventariId}</td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.emri}
                                                onChange={(e) => handleInlineEdit(item.inventariId, "emri", e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.pershkrimi}
                                                onChange={(e) => handleInlineEdit(item.inventariId, "pershkrimi", e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={item.sasia}
                                                onChange={(e) => handleInlineEdit(item.inventariId, "sasia", e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.shifra}
                                                onChange={(e) => handleInlineEdit(item.inventariId, "shifra", e.target.value)}
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">{new Date(item.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleDelete(item.inventariId)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">
                                        Nuk ka të dhëna të inventarit.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 space-x-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                        >
                            <ChevronLeftIcon className="w-5 h-5" /> Kthehu
                        </button>
                        <span className="px-4 py-2 font-medium">
                            Faqja {currentPage} nga {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                        >
                            Tjetra <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InventariAktual;
