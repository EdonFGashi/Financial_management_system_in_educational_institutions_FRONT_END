import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import * as FiIcons from "react-icons/fi";
import { userRegisterCredentials } from "./auth.models";

const FiUser = FiIcons.FiUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiMail = FiIcons.FiMail as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiLock = FiIcons.FiLock as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

function AuthRegister(props: authFormProps) {
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const fullText = "Krijoni një llogari për të menaxhuar financat lehtësisht.";

  const roles = ["admin", "komune", "shkolle", "kompani"];

  useEffect(() => {
    let i = 0;
    let forward = true;
    const interval = setInterval(() => {
      if (forward) {
        setAnimatedText(fullText.slice(0, i + 1));
        i++;
        if (i > fullText.length) {
          forward = false;
        }
      } else {
        setAnimatedText(fullText.slice(0, i - 1));
        i--;
        if (i <= 0) {
          forward = true;
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const validationSchema = Yup.object({
    organisationName: Yup.string().required("Emri i organizatës është i detyrueshëm"),
    role: Yup.string().required("Roli është i detyrueshëm"),
    email: Yup.string()
      .email("Email-i nuk është valid")
      .required("Email-i është i detyrueshëm"),
    password: Yup.string()
      .required("Fjalëkalimi është i detyrueshëm")
      .min(8, "Të paktën 8 karaktere")
      .matches(/[A-Z]/, "Duhet të përmbajë një shkronjë të madhe")
      .matches(/[0-9]/, "Duhet të përmbajë një numër")
      .matches(/[^A-Za-z0-9]/, "Duhet të përmbajë një karakter special"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), ""], "Fjalëkalimet nuk përputhen")
      .required("Konfirmimi i fjalëkalimit është i detyrueshëm"),
  });

  const checkStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">Regjistrohu</h1>
          <p className="text-gray-600 mb-8">Krijoni një llogari të re për të vazhduar.</p>

          <Formik
            initialValues={{
              organisationName: "",
              role: "",
              email: "",
              password: "",
              confirmPassword: ""
            }}
            validationSchema={validationSchema}
            onSubmit={props.onSubmit}
          >
            {({ values, handleChange, handleBlur }) => (
              <Form className="space-y-5">
                {/* Organisation Name */}
                <div className="relative">
                  <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="organisationName"
                    type="text"
                    placeholder="Emri i organizatës"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="organisationName" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Role Dropdown */}
                <div className="relative">
                  <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    as="select"
                    name="role"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Zgjidh rolin</option>
                    {roles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption.charAt(0) + roleOption.slice(1)}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="role" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Email */}
                <div className="relative">
                  <FiMail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email-i juaj"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Password */}
                <div className="relative">
                  <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Fjalëkalimi"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      checkStrength(e.target.value);
                    }}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-indigo-600 text-sm"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="confirmPassword"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Konfirmo fjalëkalimin"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                  disabled={strength < 4}
                >
                  Regjistrohu
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center mt-6">
            Keni llogari?{" "}
            <Link to="/signin" className="text-indigo-600 hover:underline">
              Kyçu këtu
            </Link>
          </p>

          <Link
            to="/"
            className="block mt-6 text-center text-indigo-600 hover:underline"
          >
            ← Kthehu në ballinë
          </Link>
        </div>
      </div>

      {/* Right side - Gradient background with animated text centered */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-indigo-500 via-blue-500 to-blue-700 items-center justify-center">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center px-10">
          {animatedText}
        </h2>
      </div>
    </div>
  );
}

export default AuthRegister;

interface authFormProps {
  model: userRegisterCredentials;
  onSubmit(
    values: userRegisterCredentials,
    actions: FormikHelpers<userRegisterCredentials>
  ): void;
}
