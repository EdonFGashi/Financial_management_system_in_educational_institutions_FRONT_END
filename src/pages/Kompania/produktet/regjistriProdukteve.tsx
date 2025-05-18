import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Sidebar from "../Sidebar";
import { useProdukte } from "../../../hooks/fetchProdukt";
import { Produkti } from "../../../models/produkte.model";
import axiosInstance from "../../../api/axiosInstance";
import { urlProdukte } from "../../../endpoints";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function RegjistriProdukteve() {
  const [selectedProdukt, setSelectedProdukt] = useState<Produkti | null>(null);
  const [produkte, , refetchProdukte] = useProdukte();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProduktUpdate = async (updatedProdukt: Produkti) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`${urlProdukte}/${updatedProdukt.id}`, updatedProdukt);
      refetchProdukte();
      setSelectedProdukt(null);
      Swal.fire("U përditësua!", "Produkti u përditësua me sukses.", "success");
    } catch {
      Swal.fire("Gabim", "Nuk u përditësua produkti.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProduktDelete = async (id: number) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`${urlProdukte}/${id}`);
      refetchProdukte();
      setSelectedProdukt(null);
      Swal.fire("U fshi!", "Produkti u fshi me sukses.", "success");
    } catch {
      Swal.fire("Gabim", "Nuk u fshi produkti.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-6 py-8 sticky top-0 z-10">
          <h1 className="text-3xl font-bold mb-2">Regjistri i Produkteve</h1>
          <p className="text-lg text-green-100">Lista dhe menaxhimi i produkteve</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <Formik
            initialValues={{
              emri: "",
              pershkrimi: "",
              cmimi: "",
              sasiaNeStok: "",
              origjina: "",
              prodhuesi: "",
              fotografia: "",
            }}
            validationSchema={Yup.object({
              emri: Yup.string().required("Emri është i detyrueshëm"),
              cmimi: Yup.number().typeError("Duhet të jetë numër").required("Çmimi është i detyrueshëm"),
              sasiaNeStok: Yup.number().typeError("Duhet të jetë numër").required("Sasia në stok është e detyrueshme"),
              fotografia: Yup.string().url("URL e pavlefshme"),
            })}
            onSubmit={async (values, { resetForm }) => {
              const produkt: Omit<Produkti, "id" | "createdAt"> = {
                emri: values.emri,
                pershkrimi: values.pershkrimi,
                cmimi: parseFloat(values.cmimi),
                sasiaNeStok: parseInt(values.sasiaNeStok),
                origjina: values.origjina,
                prodhuesi: values.prodhuesi,
                fotografia: values.fotografia,
                kompaniaId: 1,
                updatedAt: undefined,
              };

              try {
                setIsSubmitting(true);
                await axiosInstance.post(urlProdukte, produkt);
                refetchProdukte();
                resetForm();
                Swal.fire({
                  icon: "success",
                  title: "Produkti u shtua me sukses!",
                  timer: 1800,
                  showConfirmButton: false,
                });
              } catch {
                Swal.fire({
                  icon: "error",
                  title: "Dështoi shtimi!",
                  text: "Ju lutem provoni përsëri.",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { name: "emri", type: "text", placeholder: "Emri" },
                { name: "cmimi", type: "number", placeholder: "Çmimi" },
                { name: "sasiaNeStok", type: "number", placeholder: "Sasia në stok" },
                { name: "origjina", type: "text", placeholder: "Origjina" },
                { name: "prodhuesi", type: "text", placeholder: "Prodhuesi" },
                { name: "fotografia", type: "text", placeholder: "URL e fotos" },
              ].map(({ name, type, placeholder }) => (
                <div key={name}>
                  <Field name={name} type={type} placeholder={placeholder} className="border p-2 rounded w-full" />
                  <ErrorMessage name={name} component="div" className="text-sm text-red-600 mt-1" />
                </div>
              ))}

              <div className="md:col-span-2">
                <Field as="textarea" name="pershkrimi" placeholder="Përshkrimi" className="border p-2 rounded w-full" />
                <ErrorMessage name="pershkrimi" component="div" className="text-sm text-red-600 mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "bg-gray-400" : "bg-rose-600 hover:bg-rose-700"
                } text-white px-6 py-2 rounded transition col-span-full`}
              >
                {isSubmitting ? "Duke shtuar..." : "Shto Produkt"}
              </button>
            </Form>
          </Formik>

          {/* Produktet */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Lista e Produkteve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produkte.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProdukt(p)}
                  className={`border p-4 rounded shadow cursor-pointer transition duration-200 hover:ring-2 hover:ring-rose-500 ${
                    p.sasiaNeStok < 5 ? "bg-red-100 border-red-400" : "bg-white"
                  }`}
                >
                  {p.fotografia && (
                    <img
                      src={p.fotografia}
                      alt={p.emri}
                      className="h-40 w-full object-cover mb-2 rounded"
                    />
                  )}
                  <h3 className="text-lg font-bold">{p.emri}</h3>
                  <p className="text-gray-600">{p.pershkrimi}</p>
                  <p className="text-sm text-gray-500">Origjina: {p.origjina}</p>
                  <p className="text-sm text-gray-500">Prodhuesi: {p.prodhuesi}</p>
                  <p className="text-sm text-gray-500">Sasia në stok: {p.sasiaNeStok}</p>
                  {p.sasiaNeStok < 5 && (
                    <div className="flex items-center text-red-600 mb-2 animate-pulse">
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                      </svg>
                      <span>Sasia e ulët</span>
                    </div>
                  )}
                  <p className="text-rose-600 font-bold mt-2">€{p.cmimi}</p>
                </div>
              ))}

              {/* MODAL */}
              {selectedProdukt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                  >
                    <h2 className="text-xl font-bold mb-4">Përditëso Produktin</h2>
                    <Formik
                      initialValues={selectedProdukt}
                      enableReinitialize
                      onSubmit={(values) => handleProduktUpdate(values)}
                    >
                      {({ values, handleChange }) => (
                        <Form className="space-y-3">
                          {["emri", "pershkrimi", "cmimi", "sasiaNeStok", "origjina", "prodhuesi", "fotografia"].map((field) => (
                            <Field
                              key={field}
                              type={["cmimi", "sasiaNeStok"].includes(field) ? "number" : "text"}
                              name={field}
                              value={values[field as keyof Produkti]}
                              onChange={handleChange}
                              placeholder={field}
                              className="border p-2 w-full rounded"
                            />
                          ))}

                          <div className="flex justify-between items-center pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                Swal.fire({
                                  title: "A jeni i sigurt?",
                                  text: "Produkti do të fshihet përgjithmonë!",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  cancelButtonColor: "#3085d6",
                                  confirmButtonText: "Po, fshije!",
                                  cancelButtonText: "Anulo",
                                }).then((result) => {
                                  if (result.isConfirmed && selectedProdukt?.id) {
                                    handleProduktDelete(selectedProdukt.id);
                                  }
                                });
                              }}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Fshi Produktin
                            </button>

                            <div className="flex gap-2">
                              <button type="button" onClick={() => setSelectedProdukt(null)} className="text-gray-600">
                                Anulo
                              </button>
                              <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">
                                {isSubmitting ? "Duke përditësuar..." : "Ruaj"}
                              </button>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
