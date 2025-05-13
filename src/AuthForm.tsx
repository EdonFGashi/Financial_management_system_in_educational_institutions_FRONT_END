import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import * as FiIcons from "react-icons/fi";
import { userCredentials } from "./auth/auth.models";

const FiUser = FiIcons.FiUser as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const FiMail = FiIcons.FiMail as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const FiLock = FiIcons.FiLock as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

function AuthForm(props: authFormProps) {
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const fullText = "Krijoni një llogari për të menaxhuar financat lehtësisht.";

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

  const strengthLabel = ["Shumë e dobët", "E dobët", "Mesatare", "Perfekte"];
  const strengthColor = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
  ];

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email-i është i detyrueshëm"),
    password: Yup.string()
      .required("Fjalëkalimi është i detyrueshëm")
  });

  // const checkStrength = (password: string) => {
  //   let score = 0;
  //   if (password.length >= 8) score++;
  //   if (/[A-Z]/.test(password)) score++;
  //   if (/[0-9]/.test(password)) score++;
  //   if (/[^A-Za-z0-9]/.test(password)) score++;
  //   setStrength(score);
  // };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">
            Kyçu
          </h1>
          <p className="text-gray-600 mb-8">
            Kyçuni në llogarinë tuaj.
          </p>

          <Formik
            initialValues={{ email: "", password: ""}}
            validationSchema={validationSchema}
            onSubmit={props.onSubmit}
          >
            {({ values, handleChange, handleBlur }) => (
              <Form className="space-y-5">
                {/* <div className="relative">
                  <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="fullName"
                    type="text"
                    placeholder="Emri i plotë"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage name="fullName" component="p" className="text-red-500 text-sm mt-1" />
                </div> */}

                <div className="relative">
                  <FiMail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email-i juaj"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="relative">
                  <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="password"
                    type="password"
                    placeholder="Fjalëkalimi"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* {values.password && (
                  <>
                    <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
                      <div
                        className={`h-2 ${strengthColor[strength - 1]}`}
                        style={{ width: `${(strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <p
                      className={`text-sm ${
                        strength < 3 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      Forca e fjalëkalimit:{" "}
                      <strong>{strengthLabel[strength - 1]}</strong>
                    </p>
                  </>
                )} */}

                {/* <div className="relative">
                  <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Konfirmo fjalëkalimin"
                    className={`w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1" />
                </div> */}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Kyçu
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center mt-6">
            Nuk keni llogari?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Regjistrohu
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

export default AuthForm;

interface authFormProps {
  model: userCredentials;
  onSubmit(
    values: userCredentials,
    actions: FormikHelpers<userCredentials>
  ): void;
}
