import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

interface TwoFAVerificationModalProps {
  isOpen: boolean;
  email: string;
  onCancel: () => void;
  onVerify: (code: string) => void;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required("Kodi është i detyrueshëm")
    .length(6, "Kodi duhet të jetë 6 shifra"),
});



export default function TwoFAVerificationModal({
  isOpen,
  email,
  onCancel,
  onVerify,
}: TwoFAVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
          Verifikimi me Email
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Një kod është dërguar në <strong>{email}</strong>. Shkruajeni më poshtë:
        </p>

        <Formik
          initialValues={{ code: "" }}
          validationSchema={validationSchema}
          onSubmit={(values) => onVerify(values.code)}
        >
          <Form className="space-y-4">
            <div>
              <Field
                name="code"
                type="text"
                placeholder="Kodi i verifikimit"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <ErrorMessage
                name="code"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
              >
                Anulo
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Verifiko
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
