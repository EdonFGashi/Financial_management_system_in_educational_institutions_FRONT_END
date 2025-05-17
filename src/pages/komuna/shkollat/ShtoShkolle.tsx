import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BuildingLibraryIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  PencilIcon, 
  CalculatorIcon 
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 animate-float-slow">
          <AcademicCapIcon className="w-16 h-16 text-indigo-200" />
        </div>
        <div className="absolute top-1/3 right-10 animate-float-delayed">
          <BookOpenIcon className="w-12 h-12 text-blue-200" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float">
          <PencilIcon className="w-10 h-10 text-indigo-200" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float-slow">
          <CalculatorIcon className="w-14 h-14 text-blue-200" />
        </div>
      </div>

      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10 relative z-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-blue-50/50"></div>
            
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-8">
                <BuildingLibraryIcon className="w-8 h-8 text-indigo-600" />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Shto Shkollë të Re
                </span>
              </h2>

              <Formik
                initialValues={initialValues}
                validate={validate}
                onSubmit={handleSubmit}
                validateOnBlur={false}
                validateOnChange={false}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emri i shkollës
                      </label>
                      <Field
                        name="emriShkolles"
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Numri i nxënësve"
                      />
                      <ErrorMessage name="nrNxenesve" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Fjalëkalimi"
                      />
                      <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Numri personal i drejtorit (10 shifra)"
                        onKeyPress={(e: React.KeyboardEvent) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <ErrorMessage name="drejtoriNumriPersonal" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="flex pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {isSubmitting ? "Duke u procesuar..." : "Shto Shkollën"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShtoShkolle;