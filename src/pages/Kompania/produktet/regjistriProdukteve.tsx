import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useProdukte } from "../../../hooks/fetchProdukt";
import { Produkti } from "../../../models/produkte.model";
import Sidebar from "../Sidebar";
import axiosInstance from "../../../api/axiosInstance";
import { urlProdukte } from "../../../endpoints";
import Swal from "sweetalert2";
import { useState } from "react";

export default function RegjistriProdukteve() {
  const [produkte, , refetchProdukte] = useProdukte();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              } catch (error) {
                console.error("Gabim gjatë shtimit të produktit:", error);
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
                { name: "emri", placeholder: "Emri", type: "text" },
                { name: "cmimi", placeholder: "Çmimi", type: "number" },
                { name: "sasiaNeStok", placeholder: "Sasia në stok", type: "number" },
                { name: "origjina", placeholder: "Origjina", type: "text" },
                { name: "prodhuesi", placeholder: "Prodhuesi", type: "text" },
                { name: "fotografia", placeholder: "URL e fotos", type: "text" },
              ].map(({ name, placeholder, type }) => (
                <div key={name}>
                  <Field
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className="border p-2 rounded w-full"
                  />
                  <ErrorMessage
                    name={name}
                    component="div"
                    className="text-sm text-red-600 mt-1"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <Field
                  as="textarea"
                  name="pershkrimi"
                  placeholder="Përshkrimi"
                  className="border p-2 rounded w-full"
                />
                <ErrorMessage
                  name="pershkrimi"
                  component="div"
                  className="text-sm text-red-600 mt-1"
                />
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

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Lista e Produkteve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produkte.map((p) => (
                <div key={p.id} className="border p-4 rounded shadow bg-white">
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
                  <p className="text-rose-600 font-bold mt-2">€{p.cmimi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
