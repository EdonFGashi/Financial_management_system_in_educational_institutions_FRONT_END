import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Staff {
    stafId: number;
    emri: string;
    mbiemri: string;
    numriPersonal: string;
    pozita: string;
    paga: number;
    numriOreve: number;
}

let staffIdCounter = 3;

function StafiShkolles() {
    const [staffList, setStaffList] = useState<Staff[]>(() => {
        const stored = localStorage.getItem("staffList");
        return stored ? JSON.parse(stored) : [
            {
                stafId: 1,
                emri: "Trim",
                mbiemri: "Krasniqi",
                numriPersonal: "123456789",
                pozita: "Mësues",
                paga: 520,
                numriOreve: 18,
            },
            {
                stafId: 2,
                emri: "Blerta",
                mbiemri: "Gashi",
                numriPersonal: "987654321",
                pozita: "Psikolog",
                paga: 580,
                numriOreve: 20,
            }
        ];
    });

    const [formData, setFormData] = useState({
        emri: "",
        mbiemri: "",
        numriPersonal: "",
        pozita: "",
        paga: 0,
        numriOreve: 0,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filterPozita, setFilterPozita] = useState("");

    const uniquePozitat = Array.from(new Set(staffList.map((s) => s.pozita)));

    useEffect(() => {
        localStorage.setItem("staffList", JSON.stringify(staffList));
    }, [staffList]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "paga" || name === "numriOreve" ? Number(value) : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newStaff: Staff = {
            stafId: staffIdCounter++,
            ...formData,
        };
        setStaffList([newStaff, ...staffList]);
        setFormData({
            emri: "",
            mbiemri: "",
            numriPersonal: "",
            pozita: "",
            paga: 0,
            numriOreve: 0,
        });
    };

    const handleDelete = (id: number) => {
        setStaffList(staffList.filter((s) => s.stafId !== id));
    };

    const handleInlineEdit = (
        id: number,
        field: "pozita" | "paga" | "numriOreve",
        value: string | number
    ) => {
        setStaffList((prev) =>
            prev.map((s) =>
                s.stafId === id
                    ? {
                        ...s,
                        [field]: field === "pozita" ? value : Number(value),
                    }
                    : s
            )
        );
    };

    const filteredList = staffList.filter(
        (s) => !filterPozita || s.pozita.toLowerCase() === filterPozita.toLowerCase()
    );

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const paginatedStaff = filteredList.slice(
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
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Stafi i Shkollës</h1>
                    <p className="text-base sm:text-lg text-green-100">Lista dhe menaxhimi i stafit</p>
                </div>

                {/* Form */}
                <div className="px-6 py-6">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-1 font-medium">Numri Personal</label>
                                <input
                                    type="text"
                                    name="numriPersonal"
                                    value={formData.numriPersonal}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Pozita</label>
                                <input
                                    type="text"
                                    name="pozita"
                                    value={formData.pozita}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Paga (€)</label>
                                <input
                                    type="number"
                                    name="paga"
                                    value={formData.paga}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Numri i orëve</label>
                                <input
                                    type="number"
                                    name="numriOreve"
                                    value={formData.numriOreve}
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
                                Shto Stafin
                            </button>
                        </div>
                    </form>
                </div>

                {/* Filters */}
                <div className="px-6 pb-4 flex justify-end">
                    <select
                        value={filterPozita}
                        onChange={(e) => setFilterPozita(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded"
                    >
                        <option value="">Filtro sipas pozitës</option>
                        {uniquePozitat.map((pozita, idx) => (
                            <option key={idx} value={pozita}>
                                {pozita}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="px-6 pb-10 overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow text-sm">
                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">#</th>
                                <th className="py-3 px-4 text-left">Emri Mbiemri</th>
                                <th className="py-3 px-4 text-left">Numri Personal</th>
                                <th className="py-3 px-4 text-left">Pozita</th>
                                <th className="py-3 px-4 text-left">Paga (€)</th>
                                <th className="py-3 px-4 text-left">Numri i orëve</th>
                                <th className="py-3 px-4 text-left">Fshi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStaff.length > 0 ? (
                                paginatedStaff.map((staff) => (
                                    <tr key={staff.stafId} className="border-t border-gray-200">
                                        <td className="py-3 px-4">{staff.stafId}</td>
                                        <td className="py-3 px-4">{`${staff.emri} ${staff.mbiemri}`}</td>
                                        <td className="py-3 px-4">{staff.numriPersonal}</td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={staff.pozita}
                                                onChange={(e) =>
                                                    handleInlineEdit(staff.stafId, "pozita", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={staff.paga}
                                                onChange={(e) =>
                                                    handleInlineEdit(staff.stafId, "paga", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={staff.numriOreve}
                                                onChange={(e) =>
                                                    handleInlineEdit(staff.stafId, "numriOreve", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleDelete(staff.stafId)}
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
                                        Nuk ka staf të regjistruar.
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
                            Faqja {currentPage} nga {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
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

export default StafiShkolles;
