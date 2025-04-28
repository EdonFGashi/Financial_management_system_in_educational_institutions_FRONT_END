import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { PlusIcon } from "@heroicons/react/24/outline";
import * as Yup from "yup";
import Sidebar from "../Sidebar";

interface Produkt {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  quantity: number;
  image: string;
  dateAdded: string;
}

interface ProductFormValues {
  emri: string;
  kategoria: string;
  subkategoria: string;
  pershkrimi: string;
  imazhi: string;
  qmimi: number;
  sasia: number;
}

const initialProductValues: ProductFormValues = {
  emri: "",
  kategoria: "",
  subkategoria: "",
  pershkrimi: "",
  imazhi: "",
  qmimi: 0,
  sasia: 0,
};

const productValidationSchema = Yup.object({
  emri: Yup.string().required("Emri është i detyrueshëm"),
  kategoria: Yup.string().required("Kategoria është e detyrueshme"),
  subkategoria: Yup.string().required("Subkategoria është e detyrueshme"),
  pershkrimi: Yup.string().required("Përshkrimi është i detyrueshëm"),
  imazhi: Yup.string().url("Duhet të jetë një URL valide").required("Imazhi është i detyrueshëm"),
  qmimi: Yup.number().positive("Çmimi duhet të jetë më i madh se 0").required("Çmimi është i detyrueshëm"),
  sasia: Yup.number().min(0, "Sasia nuk mund të jetë negative").required("Sasia është e detyrueshme"),
});

const initialProducts: Produkt[] = [
    {
      id: 1,
      name: "Laptop Edukativ",
      description: "Laptop i lehtë dhe praktik për nxënës",
      price: 450,
      category: "Teknologji",
      subcategory: "Kompjutera",
      quantity: 10,
      image: "https://via.placeholder.com/150?text=Laptop",
      dateAdded: "2025-04-27",
    },
    {
      id: 2,
      name: "Libra Shkollore",
      description: "Set librash për shkollë fillore",
      price: 35,
      category: "Libra",
      subcategory: "Tekste",
      quantity: 100,
      image: "https://via.placeholder.com/150?text=Libra",
      dateAdded: "2025-04-27",
    },
    {
        id: 3,
        name: "Libra Shkollore",
        description: "Set librash për shkollë fillore",
        price: 35,
        category: "Libra",
        subcategory: "Tekste",
        quantity: 100,
        image: "https://via.placeholder.com/150?text=Libra",
        dateAdded: "2025-04-27",
      },
  ];

export default function RegjistriProdukteve() {
  const [product, setProducts] = useState<Produkt[]>(initialProducts);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 pb-16 overflow-y-auto">
        <div className="bg-gradient-to-r from-rose-800 to-red-500 text-white px-4 sm:px-6 md:px-12 py-8 md:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Regjistri i Produkteve</h1>
          <p className="text-base sm:text-lg text-green-100">Lista dhe menaxhimi i produkteve</p>
        </div>
        <div className="mx-4 sm:mx-6 md:mx-12">
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Produktet e regjistruara</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 shadow">
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-4" />
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-gray-600">{p.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xl font-bold text-rose-600 mb-4">€{p.price}</span>
                    <span className="text-m font-bold text-rose-600 mb-4">Sasia: {p.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        <div className="px-6 py-6">
        <div
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-rose-600 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-rose-50 transition"
            >
              <PlusIcon className="w-10 h-10 text-rose-600" />
              <span className="mt-2 text-rose-600 font-semibold">Shto Produktin</span>
            </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-4">Shto Produkt të Ri</h2>
                <Formik
                  initialValues={initialProductValues}
                  validationSchema={productValidationSchema}
                  onSubmit={(values, { resetForm }) => {
                    const newProduct: Produkt = {
                      id: product.length + 1,
                      name: values.emri,
                      description: values.pershkrimi,
                      price: values.qmimi,
                      category: values.kategoria,
                      subcategory: values.subkategoria,
                      quantity: values.sasia,
                      image: values.imazhi,
                      dateAdded: new Date().toISOString().split("T")[0],
                    };
                    setProducts([newProduct, ...product]);
                    resetForm();
                    setShowModal(false);
                  }}
                >
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-1 font-medium">Emri</label>
                        <Field name="emri" type="text" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="emri" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Kategoria</label>
                        <Field name="kategoria" type="text" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="kategoria" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Subkategoria</label>
                        <Field name="subkategoria" type="text" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="subkategoria" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Përshkrimi</label>
                        <Field name="pershkrimi" as="textarea" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="pershkrimi" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Imazhi (URL)</label>
                        <Field name="imazhi" type="text" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="imazhi" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Çmimi (€)</label>
                        <Field name="qmimi" type="number" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="qmimi" component="div" className="text-red-500 text-sm" />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Sasia</label>
                        <Field name="sasia" type="number" className="w-full border border-gray-300 p-2 rounded" />
                        <ErrorMessage name="sasia" component="div" className="text-red-500 text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Anulo
                      </button>
                      <button
                        type="submit"
                        className="bg-rose-600 text-white px-5 py-2 rounded hover:bg-rose-700"
                      >
                        Ruaj Produktin
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          )}

            </div>
        </div>
      </main>
    </div>
  );
}
