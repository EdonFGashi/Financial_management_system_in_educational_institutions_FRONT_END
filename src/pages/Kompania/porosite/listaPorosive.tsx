import { useState } from "react";
import { Formik, Form, Field } from "formik";
import Sidebar from "../Sidebar";
import { usePorosite } from "../../../hooks/usePorosite";
import { generateInvoice } from "../../../utils/InvoiceGenerator";

export default function ListaPorosiveKompani() {
  const { porosite, loading } = usePorosite();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [filterValues, setFilterValues] = useState({
    item: "",
    school: "",
    shkolla: "",
    orderStatus: "",
    minPrice: "",
    maxPrice: "",
  });

  const filteredPorosite = (porosite || []).filter((porosi) => {
    const totalPrice = porosi.produktiCmimi * porosi.sasia;
    return (
      (!filterValues.item || porosi.produktiEmri.toLowerCase().includes(filterValues.item.toLowerCase())) &&
      (!filterValues.school || porosi.kompaniaEmri.toLowerCase().includes(filterValues.school.toLowerCase())) &&
      (!filterValues.shkolla || porosi.shkollaEmri?.toLowerCase().includes(filterValues.shkolla.toLowerCase())) &&
      (!filterValues.orderStatus || porosi.statusi === filterValues.orderStatus) &&
      (!filterValues.minPrice || totalPrice >= Number(filterValues.minPrice)) &&
      (!filterValues.maxPrice || totalPrice <= Number(filterValues.maxPrice))
    );
  });

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSelectedPorosite = () => {
    return selectedIds.length > 0
      ? filteredPorosite.filter(p => selectedIds.includes(p.id))
      : [];
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-6 py-8 sticky top-0 z-10">
          <h1 className="text-3xl font-bold mb-2">Lista e Porosive</h1>
          <p className="text-lg text-green-100">Lista dhe menaxhimi i produkteve</p>
        </div>

        <div className="mx-6 mt-8">
          <Formik initialValues={filterValues} onSubmit={() => {}}>
            {({ values, handleChange }) => {
              setFilterValues(values);

              return (
                <>
                  {/* FILTERS */}
                  <Form className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <Field name="item" placeholder="Artikulli" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="shkolla" placeholder="Shkolla" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="orderStatus" as="select" className="border p-2 rounded" onChange={handleChange}>
                      <option value="">Statusi</option>
                      <option value="Në pritje">Në proces</option>
                      <option value="Paguar">Paguar</option>
                      <option value="Anuluar">Anuluar</option>
                    </Field>
                    <Field name="minPrice" type="number" placeholder="Çmimi min" className="border p-2 rounded" onChange={handleChange} />
                    <Field name="maxPrice" type="number" placeholder="Çmimi max" className="border p-2 rounded" onChange={handleChange} />
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
                                checked={selectedIds.length === filteredPorosite.length && filteredPorosite.length > 0}
                                onChange={() => {
                                  if (selectedIds.length === filteredPorosite.length) {
                                    setSelectedIds([]);
                                  } else {
                                    setSelectedIds(filteredPorosite.map(p => p.id));
                                  }
                                }}
                                className="peer hidden"
                              />
                              <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all relative flex items-center justify-center">
                                {selectedIds.length === filteredPorosite.length && filteredPorosite.length > 0 && (
                                  <span className="text-white text-[10px] font-bold">✓</span>
                                )}
                              </span>
                              <span className="text-xs">Të gjitha</span>
                            </label>
                          </th>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Artikulli</th>
                          <th className="px-4 py-2 text-left">Sasia</th>
                          <th className="px-4 py-2 text-left">Data</th>
                          <th className="px-4 py-2 text-left">Çmimi Total</th>
                          <th className="px-4 py-2 text-left">Statusi</th>
                          <th className="px-4 py-2 text-left">Shkolla</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 text-center text-gray-500">Duke u ngarkuar...</td>
                          </tr>
                        ) : filteredPorosite.length > 0 ? (
                          filteredPorosite.map((porosi) => {
                            const isChecked = selectedIds.includes(porosi.id);
                            return (
                              <tr key={porosi.id} className={`border-t ${isChecked ? "bg-rose-50" : ""}`}>
                                <td className="px-4 py-2">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleSelect(porosi.id)}
                                      className="peer hidden"
                                    />
                                    <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:border-rose-600 peer-checked:bg-rose-600 transition-all relative flex items-center justify-center">
                                      {isChecked && (
                                        <span className="text-white text-[10px] font-bold">✓</span>
                                      )}
                                    </span>
                                  </label>
                                </td>
                                <td className="px-4 py-2">{porosi.id}</td>
                                <td className="px-4 py-2">{porosi.produktiEmri}</td>
                                <td className="px-4 py-2">{porosi.sasia}</td>
                                <td className="px-4 py-2">{new Date(porosi.dataPorosise).toLocaleDateString()}</td>
                                <td className="px-4 py-2">€{(porosi.produktiCmimi * porosi.sasia).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    porosi.statusi === "Paguar"
                                      ? "bg-green-100 text-green-800"
                                      : porosi.statusi === "Në pritje"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {porosi.statusi}
                                  </span>
                                </td>
                                <td className="px-4 py-2">{porosi.shkollaEmri || "—"}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 text-center text-gray-500">Nuk u gjet asnjë porosi</td>
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
                      onClick={() => generateInvoice(getSelectedPorosite())}
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
