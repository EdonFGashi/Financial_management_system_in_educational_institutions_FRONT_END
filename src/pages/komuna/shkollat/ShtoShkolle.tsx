import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Sidebar from "../Sidebar";
import Toast from "../../../components/Toast";
import Swal from "sweetalert2";

interface ShkollaForm {
  emri: string;
  lokacioni: string;
  nrNxenesve: string;
  nrPersonalDrejtorit: string;
  email: string;
  password: string;
}

function ShtoShkolle() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const initialValues: ShkollaForm = {
    emri: "",
    lokacioni: "",
    nrNxenesve: "",
    nrPersonalDrejtorit: "",
    email: "",
    password: "",
  };

  const validate = (values: ShkollaForm) => {
    const errors: Partial<ShkollaForm> = {};

    if (!values.emri) {
      errors.emri = "Emri i shkollës është i detyrueshëm";
    }

    if (!values.lokacioni) {
      errors.lokacioni = "Lokacioni është i detyrueshëm";
    }

    if (!values.nrNxenesve) {
      errors.nrNxenesve = "Numri i nxënësve është i detyrueshëm";
    } else if (Number(values.nrNxenesve) <= 0) {
      errors.nrNxenesve = "Numri i nxënësve duhet të jetë pozitiv";
    }

    if (!values.nrPersonalDrejtorit) {
      errors.nrPersonalDrejtorit = "Numri personal i drejtorit është i detyrueshëm";
    } else if (values.nrPersonalDrejtorit.length !== 10) {
      errors.nrPersonalDrejtorit = "Numri personal duhet të ketë 10 karaktere";
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

    return errors;
  };

  const handleSubmit = async (values: ShkollaForm, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    // First validate all fields
    const errors = validate(values);
    
    if (Object.keys(errors).length > 0) {
      // If there are errors, show them in toast
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
        // Add your API call here
        Swal.fire({
          title: 'Sukses!',
          text: 'Shkolla u shtua me sukses',
          icon: 'success',
          confirmButtonColor: '#4F46E5'
        }).then(() => {
          navigate('/komuna/shkollat');
        });
      } catch (error) {
        Swal.fire({
          title: 'Gabim!',
          text: 'Ndodhi një gabim gjatë shtimit të shkollës',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {toast && (
          <div className="fixed top-5 right-5 z-50">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-8">
            <BuildingLibraryIcon className="w-7 h-7 text-indigo-600" />
            Shto Shkollë të Re
          </h2>

          <div className="bg-white rounded-xl shadow-lg p-6">
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
                      name="emri"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Emri i shkollës"
                    />
                    <ErrorMessage name="emri" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokacioni
                    </label>
                    <Field
                      name="lokacioni"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Lokacioni"
                    />
                    <ErrorMessage name="lokacioni" component="div" className="text-red-500 text-sm mt-1" />
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
                      Nr. Personal i Drejtorit
                    </label>
                    <Field
                      name="nrPersonalDrejtorit"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Numri personal i drejtorit"
                    />
                    <ErrorMessage name="nrPersonalDrejtorit" component="div" className="text-red-500 text-sm mt-1" />
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
      </main>
    </div>
  );
}

export default ShtoShkolle;