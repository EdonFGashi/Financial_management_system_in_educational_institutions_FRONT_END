import { useState } from "react";
import Sidebar from "../Sidebar";
import { Formik, Form, Field } from "formik";
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

let staffIdCounter = 1;

function StafiShkolles() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filterPozita, setFilterPozita] = useState("");

    const handleDelete = (id: number) => {
        const updatedList = staffList.filter((s) => s.stafId !== id);
        setStaffList(updatedList);

        const newTotalPages = Math.max(Math.ceil(updatedList.length / itemsPerPage), 1);
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleInlineEdit = (
        id: number,
        field: keyof Omit<Staff, "stafId" | "numriPersonal" | "emri" | "mbiemri">,
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

    const totalPages = Math.max(Math.ceil(filteredList.length / itemsPerPage), 1);
    const paginatedStaff = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const uniquePozitat = Array.from(new Set(staffList.map((s) => s.pozita)));

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

                {/* Formik Form */}
                <div className="px-6 py-6">
                    <Formik
                        initialValues={{
                            numriPersonal: "",
                            pozita: "",
                            paga: 0,
                            numriOreve: 0,
                        }}
                        onSubmit={(values, { resetForm }) => {
                            const newStaff: Staff = {
                                stafId: staffIdCounter++,
                                emri: "",
                                mbiemri: "",
                                ...values,
                            };
                            setStaffList([newStaff, ...staffList]);
                            resetForm();
                            setCurrentPage(1);
                        }}
                    >
                        {() => (
                            <Form className="bg-white p-6 rounded-lg shadow space-y-4 md:max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1 font-medium">Numri Personal</label>
                                        <Field
                                            name="numriPersonal"
                                            type="text"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Pozita</label>
                                        <Field
                                            name="pozita"
                                            type="text"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Paga (€)</label>
                                        <Field
                                            name="paga"
                                            type="number"
                                            className="w-full border border-gray-300 p-2 rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium">Numri i orëve</label>
                                        <Field
                                            name="numriOreve"
                                            type="number"
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
                            </Form>
                        )}
                    </Formik>
                </div>

                {/* Filters */}
                <div className="px-6 pb-4 flex justify-end">
                    <select
                        value={filterPozita}
                        onChange={(e) => {
                            setFilterPozita(e.target.value);
                            setCurrentPage(1);
                        }}
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
