import { useState } from "react";
import Sidebar from "../Sidebar";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

interface ProduktiDto {
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

export default function RegjistriProdukteve() {
  const [produkte, setProdukte] = useState<ProduktiDto[]>([]);

  const formik = useFormik({
    initialValues: {
      emri: "",
      pershkrimi: "",
      cmimi: "",
      sasiaNeStok: "",
      origjina: "",
      prodhuesi: "",
      fotografia: "",
    },
    validationSchema: Yup.object({
      emri: Yup.string().required("Emri është i detyrueshëm"),
      cmimi: Yup.number().required("Çmimi është i detyrueshëm"),
      sasiaNeStok: Yup.number().required("Sasia në stok është e detyrueshme"),
      fotografia: Yup.string().max(1000, "URL është shumë e gjatë")
    }),
    onSubmit: async (values, { resetForm }) => {
      const newProduct: Omit<ProduktiDto, "id" | "createdAt"> = {
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
        const response = await axios.post("http://localhost:5102/api/produkti", newProduct);
        const createdProduct = response.data.data as ProduktiDto;
        setProdukte([...produkte, createdProduct]);
        resetForm();
      } catch (error) {
        console.error("Gabim gjatë shtimit të produktit:", error);
      }
    },
  });

  return (
    <div className="flex">
      <Sidebar />

      <main  className="flex-1 pb-16 overflow-y-auto">
      <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10 sticky top-0 z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Regjistri i Produkteve</h1>
          <p className="text-base sm:text-lg text-green-100">Lista dhe menaxhimi i produkteve</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md relative">
          <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="emri"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.emri}
              placeholder="Emri"
              className="border p-2 rounded"
            />
            <input
              type="number"
              name="cmimi"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.cmimi}
              placeholder="Çmimi"
              className="border p-2 rounded"
            />
            <input
              type="number"
              name="sasiaNeStok"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.sasiaNeStok}
              placeholder="Sasia në stok"
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="origjina"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.origjina}
              placeholder="Origjina"
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="prodhuesi"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.prodhuesi}
              placeholder="Prodhuesi"
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="fotografia"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fotografia}
              placeholder="URL e fotos"
              className="border p-2 rounded"
            />
            <textarea
              name="pershkrimi"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pershkrimi}
              placeholder="Përshkrimi"
              className="border p-2 rounded col-span-full"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition col-span-full"
            >
              Shto Produkt
            </button>
          </form>

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Lista e Produkteve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produkte.map((prod) => (
                <div key={prod.id} className="border p-4 rounded shadow bg-white">
                  {prod.fotografia && (
                    <img
                      src={prod.fotografia}
                      alt={prod.emri}
                      className="h-40 w-full object-cover mb-2 rounded"
                    />
                  )}
                  <h3 className="text-lg font-bold">{prod.emri}</h3>
                  <p className="text-gray-600">{prod.pershkrimi}</p>
                  <p className="text-sm text-gray-500">Origjina: {prod.origjina}</p>
                  <p className="text-sm text-gray-500">Prodhuesi: {prod.prodhuesi}</p>
                  <p className="text-sm text-gray-500">Sasia në stok: {prod.sasiaNeStok}</p>
                  <p className="text-rose-600 font-bold mt-2">€{prod.cmimi}</p>
                </div>
              ))}
            </div>
          </div>

      
        </div>
      </main>
    </div>
  );
}
