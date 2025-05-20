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
import { 
  PlusIcon, 
  ExclamationTriangleIcon, 
  PhotoIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  GlobeEuropeAfricaIcon
} from "@heroicons/react/24/outline";

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

  // Calculate product stats
  const calculateProductStats = () => {
    const totalProducts = produkte.length;
    const totalValue = produkte.reduce((sum, p) => sum + (p.cmimi * p.sasiaNeStok), 0);
    const lowStockCount = produkte.filter(p => p.sasiaNeStok < 5).length;
    
    return {
      totalProducts,
      totalValue,
      lowStockCount,
      averagePrice: totalProducts ? (produkte.reduce((sum, p) => sum + p.cmimi, 0) / totalProducts) : 0
    };
  };
  
  const stats = calculateProductStats();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="hidden md:block fixed h-full w-64 bg-white border-r shadow-sm z-20">
        <Sidebar />
      </div>
      
      <main className="flex-1 md:ml-64 pb-16 overflow-y-auto">
        {/* Header - Updated with consistent styling */}
        <div className="bg-red-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-20"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Regjistri i Produkteve</h1>
                <p className="text-white text-lg max-w-2xl">
                  Menaxhoni produktet dhe inventarin tuaj
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Dashboard Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <ArchiveBoxIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Produktet Totale</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">{stats.totalProducts}</p>
            </div>
            
            {/* Total Value Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Vlera e Inventarit</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">
                €{stats.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            
            {/* Low Stock Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Produkte në Stok të Ulët</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">{stats.lowStockCount}</p>
            </div>
            
            {/* Average Price Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-sm p-6 border border-red-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-[100px] -z-0"></div>
              <div className="flex flex-col items-start mb-2 relative z-10">
                <div className="p-3 rounded-xl bg-red-100 mb-3">
                  <GlobeEuropeAfricaIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Çmimi Mesatar</h3>
              </div>
              <p className="text-3xl font-bold text-red-700 relative z-10">
                €{stats.averagePrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
          </div>

          {/* Add Product Form - Enhanced styling */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100 mb-8">
            <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Shto Produkt të Ri
              </h2>
            </div>
            <div className="p-6">
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
                  fotografia: Yup.string().url("URL e pavlefshme").nullable(),
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
                <Form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emri i Produktit</label>
                      <Field
                        name="emri"
                        type="text"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <ErrorMessage name="emri" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi (€)</label>
                      <Field
                        name="cmimi"
                        type="number"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <ErrorMessage name="cmimi" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sasia në Stok</label>
                      <Field
                        name="sasiaNeStok"
                        type="number"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <ErrorMessage name="sasiaNeStok" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Origjina</label>
                      <Field
                        name="origjina"
                        type="text"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prodhuesi</label>
                      <Field
                        name="prodhuesi"
                        type="text"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL e Fotografisë</label>
                      <Field
                        name="fotografia"
                        type="text"
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <ErrorMessage name="fotografia" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                      <Field
                        as="textarea"
                        name="pershkrimi"
                        rows={4}
                        className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-center mb-4">
                      <Field name="fotografia">
                        {({ field, form }: { field: any; form: any }) => (
                          <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4 border-2 border-dashed border-gray-300">
                            {field.value ? (
                              <img
                                src={field.value}
                                alt="Preview"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/300x300?text=Foto+e+Produktit";
                                }}
                              />
                            ) : (
                              <div className="text-center p-6">
                                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Vendos URL e fotografisë<br />për të shikuar rezultatin</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {isSubmitting ? "Duke shtuar..." : "Shto Produkt"}
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>

          {/* Products List - Improved grid layout and image display */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Lista e Produkteve</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produkte.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedProdukt(p)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 bg-white flex items-center justify-center">
                    {p.fotografia ? (
                      <img
                        src={p.fotografia}
                        alt={p.emri}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x300?text=Foto+e+Produktit";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <PhotoIcon className="h-16 w-16 text-gray-400" />
                        <span className="text-gray-500 mt-2">Nuk ka foto</span>
                      </div>
                    )}
                    
                    {p.sasiaNeStok < 5 && (
                      <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        Stok i ulët: {p.sasiaNeStok}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{p.emri}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{p.pershkrimi}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Origjina: {p.origjina || "—"}</span>
                      <span>Prodhuesi: {p.prodhuesi || "—"}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <span className="text-red-600 text-lg font-bold">€{p.cmimi.toFixed(2)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.sasiaNeStok > 10 
                          ? "bg-green-100 text-green-800" 
                          : p.sasiaNeStok > 0 
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {p.sasiaNeStok > 0 ? `${p.sasiaNeStok} në stok` : "Jashtë stokut"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {produkte.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nuk ka produkte</h3>
                <p className="text-gray-500">Nuk ka produkte të regjistruara në sistem. Shtoni produkte duke përdorur formularin më sipër.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Product Edit Modal - Enhanced */}
      {selectedProdukt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Përditëso Produktin</h2>
            </div>
            
            <div className="p-6">
              <Formik
                initialValues={selectedProdukt}
                enableReinitialize
                onSubmit={(values) => handleProduktUpdate(values)}
              >
                {({ values, handleChange }) => (
                  <Form className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emri i Produktit</label>
                        <Field
                          name="emri"
                          type="text"
                          value={values.emri}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Çmimi (€)</label>
                        <Field
                          name="cmimi"
                          type="number"
                          value={values.cmimi}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sasia në Stok</label>
                        <Field
                          name="sasiaNeStok"
                          type="number"
                          value={values.sasiaNeStok}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origjina</label>
                        <Field
                          name="origjina"
                          type="text"
                          value={values.origjina}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prodhuesi</label>
                        <Field
                          name="prodhuesi"
                          type="text"
                          value={values.prodhuesi}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL e Fotografisë</label>
                        <Field
                          name="fotografia"
                          type="text"
                          value={values.fotografia}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi</label>
                        <Field
                          as="textarea"
                          name="pershkrimi"
                          rows={4}
                          value={values.pershkrimi}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="bg-white p-4 rounded-lg mb-4 h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
                        {values.fotografia ? (
                          <img
                            src={values.fotografia}
                            alt={values.emri}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/300x300?text=Foto+e+Produktit";
                            }}
                          />
                        ) : (
                          <div className="text-center p-4">
                            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Nuk ka fotografi</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-3 mt-auto">
                        <button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={() => setSelectedProdukt(null)} 
                          className="w-full border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                          Anulo
                        </button>
                        
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
                          className="w-full border border-red-200 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors mt-2"
                        >
                          Fshi Produktin
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pattern background style */}
      <style>
        {`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        `}
      </style>
    </div>
  );
}
