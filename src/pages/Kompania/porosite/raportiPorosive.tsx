import { useState } from "react";
import { Formik, Form, Field } from "formik";
import Sidebar from "../Sidebar";

interface Porosia {
  id: number;
  item: string;
  quantity: number;
  dateCreated: string;
  school: string;
  approvalStatus: "Pending" | "Approved" | "Refused";
  orderStatus: "Processing" | "Completed" | "Cancelled";
  price: number;
}

const initialPorosite: Porosia[] = [
  {
    id: 1,
    item: "Laptop",
    quantity: 2,
    dateCreated: "2025-04-27",
    school: "Shkolla 1",
    approvalStatus: "Pending",
    orderStatus: "Processing",
    price: 1200,
  },
  {
    id: 2,
    item: "Libra",
    quantity: 50,
    dateCreated: "2025-04-26",
    school: "Shkolla 2",
    approvalStatus: "Approved",
    orderStatus: "Completed",
    price: 300,
  },
];

export default function ListaPorosiveKompani() {
  const [porosite] = useState<Porosia[]>(initialPorosite);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10 sticky top-0 z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Raporti i Porosive</h1>
          <p className="text-base sm:text-lg text-green-100">Gjenero raportet e produkteve produkteve</p>
        </div>

        <div className="mx-4 sm:mx-6 md:mx-12 mt-10 p-6">
          <Formik
            initialValues={{
              item: "",
              school: "",
              approvalStatus: "",
              orderStatus: "",
              minPrice: "",
              maxPrice: "",
            }}
            onSubmit={() => {}}
          >
            {({ values, handleChange }) => {
              const filteredPorosite = porosite.filter((porosi) => {
                return (
                  (!values.item || porosi.item.toLowerCase().includes(values.item.toLowerCase())) &&
                  (!values.school || porosi.school.toLowerCase().includes(values.school.toLowerCase())) &&
                  (!values.approvalStatus || porosi.approvalStatus === values.approvalStatus) &&
                  (!values.orderStatus || porosi.orderStatus === values.orderStatus) &&
                  (!values.minPrice || porosi.price >= Number(values.minPrice)) &&
                  (!values.maxPrice || porosi.price <= Number(values.maxPrice))
                );
              });

              return (
                <>
                  <Form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Form fields... */}
                    <div>
                      <label className="block mb-1 text-gray-700">Artikulli</label>
                      <Field name="item" type="text" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700">Shkolla</label>
                      <Field name="school" type="text" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700">Statusi i Miratimit</label>
                      <Field name="approvalStatus" as="select" onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="">Të gjitha</option>
                        <option value="Pending">Në Pritje</option>
                        <option value="Approved">Miratuar</option>
                        <option value="Refused">Refuzuar</option>
                      </Field>
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700">Statusi i Porosisë</label>
                      <Field name="orderStatus" as="select" onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="">Të gjitha</option>
                        <option value="Processing">Në Proces</option>
                        <option value="Completed">Përfunduar</option>
                        <option value="Cancelled">Anuluar</option>
                      </Field>
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700">Çmimi Minimal (€)</label>
                      <Field name="minPrice" type="number" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700">Çmimi Maksimal (€)</label>
                      <Field name="maxPrice" type="number" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>
                  </Form>

                  {/* Table */}
                  <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700 font-semibold">
                        <tr>
                          <th className="px-4 py-3 border-b whitespace-nowrap">Porosia</th>
                          <th className="px-4 py-3 border-b whitespace-nowrap">Sasia</th>
                          <th className="px-4 py-3 border-b whitespace-nowrap">Shkolla</th>
                          <th className="px-4 py-3 border-b whitespace-nowrap">Data</th>
                          <th className="px-4 py-3 border-b whitespace-nowrap">Përfshi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPorosite.map((porosi) => (
                          <tr key={porosi.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{porosi.item}</td>
                            <td className="px-4 py-3">{porosi.quantity}</td>
                            <td className="px-4 py-3">{porosi.school}</td>
                            <td className="px-4 py-3">{porosi.dateCreated}</td>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(porosi.id)}
                                onChange={() => toggleSelection(porosi.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        const selectedPorosite = porosite.filter(p => selectedIds.includes(p.id));
                        console.log("Selected for report:", selectedPorosite);
                      }}
                      className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800 transition"
                    >
                      Gjenero raportin
                    </button>
                  </div>
                </>
              );
            }}
          </Formik>
        </div>
      </main>
    </div>
  );
}
