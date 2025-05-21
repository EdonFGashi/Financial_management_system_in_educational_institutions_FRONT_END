import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { userCredentials } from "./auth/auth.models";

function AuthForm(props: authFormProps) {
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
  
  const handleSubmit = async (values: userCredentials, actions: FormikHelpers<userCredentials>) => {
    setIsLoading(true);
    try {
      await props.onSubmit(values, actions);
    } finally {
      setIsLoading(false);
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email-i nuk është valid")
      .required("Email-i është i detyrueshëm"),
    password: Yup.string().required("Fjalëkalimi është i detyrueshëm"),
  });

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-indigo-700 mb-4">
              <span className="relative">
                Kyçu
                <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-indigo-400 rounded"></span>
              </span>
            </h1>
            <p className="text-gray-600">Kyçuni në llogarinë tuaj për të vazhduar.</p>
          </div>

          <Formik
            initialValues={{ email: props.model?.email || "", password: props.model?.password || "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email-i juaj"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Fjalëkalimi"
                    className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                    }}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                    )}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-sm mt-1 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Duke u kyçur...
                    </>
                  ) : (
                    "Kyçu"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center mt-6 text-gray-600">
            Nuk keni llogari?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Regjistrohu tani
            </Link>
          </p>

          <Link
            to="/"
            className="block mt-8 text-center text-indigo-600 hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Kthehu në ballinë
          </Link>
        </div>
      </div>

      {/* Right side - Gradient background with animated text centered */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 items-center justify-center overflow-hidden">
        <div className="absolute w-full h-full bg-[url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-10"></div>
        <div className="relative z-10 max-w-md px-8 py-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-white rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-4">
            {animatedText}
          </h2>
          <p className="text-white/80 text-center mb-6">
            Platforma jonë e menaxhimit financiar ju ndihmon të monitoroni shpenzimet, të analizoni burimet e të ardhurave dhe të optimizoni buxhetin e institucionit tuaj arsimor.
          </p>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center bg-white/20 p-3 rounded-lg">
                <span className="text-white text-2xl font-bold">100+</span>
                <span className="text-white/80 text-sm">Institucione</span>
              </div>
              <div className="flex flex-col items-center bg-white/20 p-3 rounded-lg">
                <span className="text-white text-2xl font-bold">5K+</span>
                <span className="text-white/80 text-sm">Përdorues</span>
              </div>
            </div>
          </div>
        </div>
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
  loading?: boolean;
  variant?: 'light' | 'dark';
}
