import { useState } from "react";
import Sidebar from "./Sidebar";
import { Formik, Form, Field } from "formik";
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Inventar {
    inventariId: number;
    emri: string;
    pershkrimi: string;
    sasia: number;
    shifra: string;
    createdAt: string;
}

let inventariIdCounter = 1;

function InventariAktual() {
    const [inventariList, setInventariList] = useState<Inventar[]>([]);
    const [filterEmri, setFilterEmri] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

                {/* Formik Form */}
                <div className="px-6 py-6">
                    <Formik
                        initialValues={{
                            emri: "",
                            pershkrimi: "",
                            sasia: 0,
                            shifra: "",
                        }}
                        onSubmit={(values, { resetForm }) => {
                            const newItem: Inventar = {
                                inventariId: inventariIdCounter++,
                                emri: values.emri,
                                pershkrimi: values.pershkrimi,
                                sasia: values.sasia,
                                shifra: values.shifra,
                                createdAt: new Date().toISOString(),
                            };
                            setInventariList([newItem, ...inventariList]);
                            resetForm();
                            setCurrentPage(1);
                        }}
                    >
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Emri</label>
                                        <Field
                                            name="emri"
                                            type="text"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Shifra</label>
                                        <Field
                                            name="shifra"
                                            type="text"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Sasia</label>
                                        <Field
                                            name="sasia"
                                            type="number"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-medium">Përshkrimi</label>
                                        <Field
                                            name="pershkrimi"
                                            as="textarea"
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
                                        Shto Inventar
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
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
                                                onChange={(e) =>
                                                    handleInlineEdit(item.inventariId, "emri", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.pershkrimi}
                                                onChange={(e) =>
                                                    handleInlineEdit(item.inventariId, "pershkrimi", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                value={item.sasia}
                                                onChange={(e) =>
                                                    handleInlineEdit(item.inventariId, "sasia", e.target.value)
                                                }
                                                className="border rounded px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="text"
                                                value={item.shifra}
                                                onChange={(e) =>
                                                    handleInlineEdit(item.inventariId, "shifra", e.target.value)
                                                }
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
