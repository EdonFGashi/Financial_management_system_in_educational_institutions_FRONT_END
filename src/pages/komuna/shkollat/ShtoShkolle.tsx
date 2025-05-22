import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BuildingLibraryIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  PencilIcon, 
  CalculatorIcon,
  ArrowLeftIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";
import { urlListShkolla } from "../../../endpoints";
import { urlAccounts } from "../../../endpoints";
import axiosInstance from "../../../api/axiosInstance";

interface UserInfoResponse {
  data: {
    email: string;
    fullName: string | null;
    komunaId: number;
  };
  succeeded: boolean;
  message: string | null;
  statusCode: number;
}

interface ShkollaForm {
  email: string;
  password: string;
  emriShkolles: string;
  nrNxenesve: string;
  kodiPostal: string;
  shkollaRruga: string;
  drejtoriNumriPersonal: string;
}

function ShtoShkolle() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [komunaId, setKomunaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchKomunaId = async () => {
      try {
        const response = await axiosInstance.get<UserInfoResponse>(`${urlAccounts}/me`);
        if (response.data.succeeded) {
          const { komunaId } = response.data.data;
          if (komunaId) {
            setKomunaId(komunaId);
          } else {
            throw new Error('KomunaId nuk u gjet');
          }
        } else {
          throw new Error(response.data.message || 'Nuk u gjetën të dhëna');
        }
      } catch (error: any) {
        setToast({
          message: error.message || 'Gabim gjatë marrjes së të dhënave',
          type: "error"
        });
      }
    };

    fetchKomunaId();
  }, []);

  const initialValues: ShkollaForm = {
    email: "",
    password: "",
    emriShkolles: "",
    nrNxenesve: "",
    kodiPostal: "",
    shkollaRruga: "",
    drejtoriNumriPersonal: "",
  };

  const validate = (values: ShkollaForm) => {
    const errors: Partial<ShkollaForm> = {};

    if (!values.emriShkolles) {
      errors.emriShkolles = "Emri i shkollës është i detyrueshëm";
    }

    if (!values.shkollaRruga) {
      errors.shkollaRruga = "Rruga është e detyrueshme";
    }

    if (!values.kodiPostal) {
      errors.kodiPostal = "Kodi postal është i detyrueshëm";
    }

    if (!values.nrNxenesve) {
      errors.nrNxenesve = "Numri i nxënësve është i detyrueshëm";
    } else if (Number(values.nrNxenesve) <= 0) {
      errors.nrNxenesve = "Numri i nxënësve duhet të jetë pozitiv";
    }

    if (!values.email) {
      errors.email = "Email adresa është e detyrueshme";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Email adresa nuk është valide";
    }

    if (!values.password) {
      errors.password = "Fjalëkalimi është i detyrueshëm";
    } else if (values.password.length < 8) {
      errors.password = "Fjalëkalimi duhet të ketë së paku 8 karaktere";
    }

    if (!values.drejtoriNumriPersonal) {
      errors.drejtoriNumriPersonal = "Numri personal i drejtorit është i detyrueshëm";
    } else if (!/^\d{10}$/.test(values.drejtoriNumriPersonal)) {
      errors.drejtoriNumriPersonal = "Numri personal duhet të ketë 10 shifra";
    } else {
      const numValue = parseInt(values.drejtoriNumriPersonal);
      if (isNaN(numValue) || numValue < 1000000000 || numValue > 9999999999) {
        errors.drejtoriNumriPersonal = "Numri personal duhet të jetë midis 1000000000 dhe 9999999999";
      }
    }

    return errors;
  };

  const handleSubmit = async (values: ShkollaForm, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }) => {
    if (!komunaId) {
      setToast({
        message: "Nuk u gjet ID e komunës",
        type: "error"
      });
      setSubmitting(false);
      return;
    }

    const errors = validate(values);
    
    if (Object.keys(errors).length > 0) {
      setToast({
        message: "Ju lutem plotësoni të gjitha fushat saktë",
        type: "error"
      });
      setSubmitting(false);
      return;
    }

    const result = await Swal.fire({
      title: 'A jeni të sigurt?',
      text: "Dëshironi të shtoni këtë shkollë?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Po, shto!',
      cancelButtonText: 'Anulo'
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.post(`${urlListShkolla}/register-shkolla`, {
          email: values.email,
          password: values.password,
          emriShkolles: values.emriShkolles,
          nrNxenesve: parseInt(values.nrNxenesve),
          buxhetiAktual: 0,
          buxhetiShfrytezuar: 0,
          qyteti: komunaId,
          drejtoriNumriPersonal: parseInt(values.drejtoriNumriPersonal),
          kodiPostal: values.kodiPostal,
          shkollaRruga: values.shkollaRruga
        });

        if (response.data.succeeded) {
          resetForm();
          setToast({
            message: "Shkolla u shtua me sukses!",
            type: "success"
          });
        } else {
          throw new Error(response.data.message || 'Ndodhi një gabim');
        }
      } catch (error: any) {
        setToast({
          message: error.response?.data?.message || error.message || 'Ndodhi një gabim gjatë shtimit të shkollës',
          type: "error"
        });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-800">
      <div className="hidden md:block fixed h-full w-64 bg-white shadow-sm z-30">
        <Sidebar />
      </div>
      
      <main className="flex-1 min-h-screen w-full md:pl-64 overflow-y-auto">
        {/* Toast notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Blue header with pattern */}
        <div className="bg-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Regjistro Shkollë të Re</h1>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Shtoni institucion të ri arsimor në sistemin e komunës suaj
                </p>
              </div>
              <Link
                to="/komuna/shkolla/listashkollave"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-blue-700 shadow-lg hover:bg-blue-50 transition-all duration-200 font-medium self-start"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Kthehu te Shkollat
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            {/* Form card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <UserPlusIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Formulari i Regjistrimit
                </h3>
              </div>
              
              <div className="p-6">
                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                    emriShkolles: "",
                    nrNxenesve: "",
                    kodiPostal: "",
                    shkollaRruga: "",
                    drejtoriNumriPersonal: "",
                  }}
                  validate={validate}
                  onSubmit={handleSubmit}
                  validateOnBlur={false}
                  validateOnChange={false}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emri i shkollës
                          </label>
                          <Field
                            name="emriShkolles"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Emri i shkollës"
                          />
                          <ErrorMessage name="emriShkolles" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rruga
                          </label>
                          <Field
                            name="shkollaRruga"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Rruga"
                          />
                          <ErrorMessage name="shkollaRruga" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kodi Postal
                          </label>
                          <Field
                            name="kodiPostal"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Kodi Postal"
                          />
                          <ErrorMessage name="kodiPostal" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numri i nxënësve
                          </label>
                          <Field
                            name="nrNxenesve"
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Numri i nxënësve"
                          />
                          <ErrorMessage name="nrNxenesve" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numri Personal i Drejtorit
                          </label>
                          <Field
                            name="drejtoriNumriPersonal"
                            type="text"
                            pattern="\d*"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10 shifra"
                            onKeyPress={(e: React.KeyboardEvent) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                          <ErrorMessage name="drejtoriNumriPersonal" component="div" className="text-red-500 text-sm mt-1" />
                        </div>
                        
                        <div className="md:col-span-2">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                            <h4 className="text-blue-800 font-medium mb-2">Të dhënat e Llogarisë</h4>
                            <p className="text-blue-600 text-sm mb-4">
                              Këto të dhëna do të përdoren për qasjen në sistem nga personeli i shkollës.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email
                                </label>
                                <Field
                                  name="email"
                                  type="email"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Email adresa"
                                />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fjalëkalimi
                                </label>
                                <Field
                                  name="password"
                                  type="password"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Fjalëkalimi"
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => navigate('/komuna/shkollat')}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg mr-4 hover:bg-gray-50"
                        >
                          Anulo
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Duke u procesuar...
                            </>
                          ) : (
                            <>
                              <BuildingLibraryIcon className="w-5 h-5 mr-2" />
                              Regjistro Shkollën
                            </>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pattern background style */}
      <style>
        {`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        `}
      </style>
    </div>
  );
}

export default ShtoShkolle;