import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import Sidebar from "../Sidebar";
import { urlFatura } from "../../../endpoints";
import { Fatura } from "../../../models/fatura.model";
import { generateInvoice } from "../../../utils/InvoiceGenerator";
import Swal from "sweetalert2";
import axios from "axios";


export function useFatura() {
  const [faturat, setFaturat] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFaturat = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${urlFatura}/paginated`, {
        params: { page: 1, pageSize: 1000 },
      });
      setFaturat(response.data.data);
    } catch (error) {
      Swal.fire("Gabim", "Nuk u arrit të merret lista e faturave", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaturat(); }, []);

  return { faturat, loading };
}

export default function ListaFaturave() {
  const { faturat, loading } = useFatura();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [filterValues, setFilterValues] = useState({
    productName: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: ""
  });

  const filteredFaturat = (faturat || []).filter((fatura) => {
    const totalPrice = fatura.cmimiTotal;
    const dataPageses = new Date(fatura.dataPageses);
    const startDate = filterValues.startDate ? new Date(filterValues.startDate) : null;
    const endDate = filterValues.endDate ? new Date(filterValues.endDate) : null;

  return (
    (!filterValues.productName || fatura.emriProduktit.toLowerCase().includes(filterValues.productName.toLowerCase())) &&
    (!filterValues.minPrice || totalPrice >= Number(filterValues.minPrice)) &&
    (!filterValues.maxPrice || totalPrice <= Number(filterValues.maxPrice)) &&
    (!startDate || dataPageses >= startDate) &&
    (!endDate || dataPageses <= endDate)
  );
  });

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSelectedFaturat = () => {
    return selectedIds.length > 0
      ? filteredFaturat.filter(p => selectedIds.includes(p.id))
      : [];
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-6 py-8 sticky top-0 z-10">
          <h1 className="text-3xl font-bold mb-2">Lista e Faturave</h1>
          <p className="text-lg text-green-100">Lista e faturave nga porosite e paguara</p>
        </div>

        <div className="mx-6 mt-8">
          <Formik initialValues={filterValues} onSubmit={() => {}}>
            {({ values, handleChange }) => {
              setFilterValues(values);

              return (
                <>
                  {/* FILTERS */}
                  <Form className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <Field name="productName" placeholder="Artikulli" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="minPrice" type="number" placeholder="Çmimi min" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="maxPrice" type="number" placeholder="Çmimi max" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="startDate" type="date" placeholder="Data Fillestare" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="endDate" type="date" placeholder="Data Perfundimtare" className="border p-2 rounded" onChange={handleChange} />
                  </Form>
                  {/* TABLE */}
                  <div className="overflow-x-auto rounded shadow bg-white">
                    <table className="w-full table-auto border-collapse text-sm">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">
                            <label className="inline-flex items-center cursor-pointer gap-2">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === filteredFaturat.length && filteredFaturat.length > 0}
                                onChange={() => {
                                  if (selectedIds.length === filteredFaturat.length) {
                                    setSelectedIds([]);
                                  } else {
                                    setSelectedIds(filteredFaturat.map(p => p.id));
                                  }
                                }}
                                className="peer hidden"
                              />
                              <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all relative flex items-center justify-center">
                                {selectedIds.length === filteredFaturat.length && filteredFaturat.length > 0 && (
                                  <span className="text-white text-[10px] font-bold">✓</span>
                                )}
                              </span>
                              <span className="text-xs">Të gjitha</span>
                            </label>
                          </th>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Porosia ID</th>
                          <th className="px-4 py-2 text-left">Artikulli</th>
                          <th className="px-4 py-2 text-left">Sasia</th>
                          <th className="px-4 py-2 text-left">Çmimi Total</th>
                          <th className="px-4 py-2 text-left">Çmimi Total me TVSH</th>
                          <th className="px-4 py-2 text-left">Data e Pageses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 text-center text-gray-500">Duke u ngarkuar...</td>
                          </tr>
                        ) : filteredFaturat.length > 0 ? (
                          filteredFaturat.map((fatura) => {
                            const isChecked = selectedIds.includes(fatura.id);
                            return (
                              <tr key={fatura.id} className={`border-t ${isChecked ? "bg-rose-50" : ""}`}>
                                <td className="px-4 py-2">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleSelect(fatura.id)}
                                      className="peer hidden"
                                    />
                                    <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all relative flex items-center justify-center">
                                      {isChecked && (
                                        <span className="text-white text-[10px] font-bold">✓</span>
                                      )}
                                    </span>
                                  </label>
                                </td>
                                <td className="px-4 py-2">{fatura.id}</td>
                                <td className="px-4 py-2">{fatura.porosiaId}</td>
                                <td className="px-4 py-2">{fatura.emriProduktit}</td>
                                <td className="px-4 py-2">{fatura.sasia}</td>
                                <td className="px-4 py-2">€{(fatura.cmimiTotal).toFixed(2)}</td>
                                <td className="px-4 py-2">€{(fatura.cmimiTotalMeTVSH).toFixed(2)}</td>
                                <td className="px-4 py-2">{new Date(fatura.dataPageses).toLocaleDateString()}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 text-center text-gray-500">Nuk u gjet asnjë faturë</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* INVOICE BUTTON */}
                  <div className="mt-6 flex justify-end">
                    <button
                      className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded disabled:opacity-50"
                      disabled={selectedIds.length === 0}
                      onClick={() => generateInvoice(getSelectedFaturat())}
                    >
                      Shkarko Faturën
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