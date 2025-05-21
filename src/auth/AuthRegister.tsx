import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  HomeIcon,
  BookOpenIcon,
  MapIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { userRegisterCredentialsShkolla, userRegisterCredentialsKomuna, userRegisterCredentialsAdmin } from "./auth.models";
import { useKomunaOptions } from "../hooks/useKomunaOptions";
import { fetchPersonByNrPersonal } from "../hooks/grabPersonDetails";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast"; // Import the Toast component


type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  role: "Komunë" | "Shkollë"| "Admin";
  qyteti?: string;
  nrPopullsis?: number | null;
  buxhetiAktual?: number | null;
  ditaNdarjesAuto?: boolean;

  // Optional for Shkollë
  EmriShkolles?: string;
  komunaId?: string;
  ShkollaRruga?: string;
  drejtori?: {
    DrejtoriNumriPersonal?: string;
    name?: string;
    surname?: string;
    street?: string;
  };
};


function AuthRegister(props: authFormProps) {
  const [drejtorFetched, setDrejtorFetched] = useState(false);
  const [loadingDrejtor, setLoadingDrejtor] = useState(false);
  const komunaOptions = useKomunaOptions();
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
  const [successfullyRegistered, setSuccessfullyRegistered] = useState(false);
  const fullText = "Krijoni llogari të reja për të menaxhuar financat e institucioneve arsimore.";
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const roles = ["Admin", "Komunë", "Shkollë"];
  
  const strengthLabel = ["Shumë e dobët", "E dobët", "Mesatare", "Perfekte"];
  const strengthColor = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
  ];

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
      .required("Konfirmimi është i detyrueshëm")
      .test("passwords-match", "Fjalëkalimet nuk përputhen", function (value) {
        return this.parent.password === value;
      }),
    role: Yup.string().required("Roli është i detyrueshëm"),
    qyteti: Yup.string().when("role", ([role], schema) =>
      role === "Komunë" ? schema.required("Emri Komunës është i detyrueshëm") : schema
    ),
    EmriShkolles: Yup.string().when("role", ([role], schema) =>
      role === "Shkollë" ? schema.required("Emri Shkollës është i detyrueshëm") : schema
    ),
    komunaId: Yup.string().when("role", ([role], schema) =>
      role === "Shkollë" ? schema.required("Komuna duhet të zgjidhet") : schema
    ),
    ShkollaRruga: Yup.string().when("role", ([role], schema) =>
      role === "Shkollë" ? schema.required("Rruga e shkollës është e detyrueshme") : schema
    ),
    drejtori: Yup.object({
      personalNumber: Yup.string().when("role", ([role], schema) =>
        role === "Shkollë" ? schema.required("Numri personal i drejtorit është i detyrueshëm") : schema
      ),
      name: Yup.string().when("role", ([role], schema) =>
        role === "Shkollë" ? schema.required("Emri i drejtorit është i detyrueshëm") : schema
      ),
      surname: Yup.string().when("role", ([role], schema) =>
        role === "Shkollë" ? schema.required("Mbiemri i drejtorit është i detyrueshëm") : schema
      ),
      street: Yup.string().when("role", ([role], schema) =>
        role === "Shkollë" ? schema.required("Rruga e drejtorit është e detyrueshme") : schema
      )
    })
  });

  const checkStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  };

  // Function to show toast
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(null);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

  return (
    <>
      {/* Use the custom Toast component */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast 
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        </div>
      )}
      
      <div className="min-h-screen flex">
        {/* Left side - Sign Up form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
          <div className="max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-indigo-700 mb-4">
                <span className="relative">
                  Krijo llogari të re
                  <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-indigo-400 rounded"></span>
                </span>
              </h1>
              <p className="text-gray-600">Regjistro një institucion ose administrator të ri në platformë.</p>
            </div>

            {successfullyRegistered ? (
              <div className="text-center p-8 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <CheckCircleIcon className="h-12 w-12 text-indigo-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-indigo-800 mb-3">Llogaria u regjistrua me sukses!</h2>
                <p className="text-gray-600 mb-6">
                  Llogaria e re është krijuar me sukses dhe tani është aktive në platformën tonë.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => setSuccessfullyRegistered(false)}
                    className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50"
                  >
                    Regjistro llogari tjetër
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Kthehu në panel
                  </Link>
                </div>
              </div>
            ) : (
              <Formik<FormValues>
                initialValues={{
                  email: "",
                  password: "",
                  confirmPassword: "",
                  role: "Komunë",
                  qyteti: "",
                  nrPopullsis: null,
                  buxhetiAktual: null,
                  ditaNdarjesAuto: false,
                  EmriShkolles: "",
                  komunaId: "",
                  ShkollaRruga: "",
                  drejtori: {
                    DrejtoriNumriPersonal: "",
                    name: "",
                    surname: "",
                    street: ""
                  }
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, actions) => {
                  setIsSubmitting(true);
                  try {
                    const { confirmPassword, ...cleaned } = values;
                    await props.onSubmit(
                      cleaned as userRegisterCredentials,
                      actions as FormikHelpers<userRegisterCredentials>
                    );
                    
                    // Show success message and reset form for new registration
                    showToast("Llogaria u krijua me sukses!", "success");
                    setSuccessfullyRegistered(true);
                    actions.resetForm();
                  } catch (error) {
                    console.error("Registration failed:", error);
                    showToast("Regjistrimi dështoi. Provoni përsëri.", "error");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {({ values, handleChange, handleBlur, setFieldValue }) => (
                  <Form className="space-y-5">
                    {/* Email */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email-i i llogarisë"
                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <Field
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Fjalëkalimi i llogarisë"
                        className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          checkStrength(e.target.value);
                        }}
                        onBlur={handleBlur}
                        value={values.password}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
                        )}
                      </button>
                      <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                    </div>

                    {values.password && (
                      <>
                        <div className="w-full bg-gray-200 rounded-lg overflow-hidden h-2">
                          <div
                            className={`h-full ${strengthColor[strength - 1] || ''}`}
                            style={{ width: `${(strength / 4) * 100}%` }}
                          ></div>
                        </div>
                        <p className={`text-sm ${strength < 3 ? "text-red-500" : "text-green-600"}`}>
                          Forca e fjalëkalimit: <strong>{strengthLabel[strength - 1] || 'Nuk plotëson kriteret'}</strong>
                        </p>
                      </>
                    )}

                    {/* Confirm Password */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <Field
                        name="confirmPassword"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Konfirmo fjalëkalimin e llogarisë"
                        className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                    </div>

                    {/* Role Dropdown */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <Field
                        as="select"
                        name="role"
                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="">Zgjidh llojin e llogarisë</option>
                        {roles.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption.charAt(0) + roleOption.slice(1)}
                          </option>
                        ))}
                      </Field>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <ErrorMessage name="role" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                    </div>

                    {values.role === "Komunë" && (
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <HomeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <Field 
                          name="qyteti" 
                          placeholder="Emri i Komunës" 
                          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                        />
                        <ErrorMessage name="qyteti" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                      </div>
                    )}

                    {values.role === "Shkollë" && (
                      <>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <BookOpenIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                          </div>
                          <Field 
                            name="EmriShkolles" 
                            placeholder="Emri i Shkollës" 
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <ErrorMessage name="EmriShkolles" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <HomeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                          </div>
                          <Field 
                            as="select" 
                            name="komunaId" 
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                          >
                            <option value="">Zgjidh Komunën</option>
                            {komunaOptions.map(k => (
                              <option key={k.komunaId} value={k.komunaId}>{k.qyteti}</option>
                            ))}
                          </Field>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          <ErrorMessage name="komunaId" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                          </div>
                          <Field 
                            name="ShkollaRruga" 
                            placeholder="Rruga e Shkollës" 
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <ErrorMessage name="ShkollaRruga" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                        </div>

                        {/* Drejtori Info */}
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <IdentificationIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                          </div>
                          <Field
                            name="DrejtoriNumriPersonal"
                            placeholder="Nr Personal Drejtorit"
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            onBlur={async (e: React.FocusEvent<HTMLInputElement>) => {
                              const nr = e.target.value;
                              if (!nr) return;
                              setLoadingDrejtor(true);
                              const person = await fetchPersonByNrPersonal(nr);
                              if (person) {
                                setFieldValue("drejtori.name", person.emri);
                                setFieldValue("drejtori.surname", person.mbiemri);
                                setFieldValue("drejtori.street", person.adresa?.rruga || "");
                                setDrejtorFetched(true);
                              } else {
                                setFieldValue("drejtori.name", "");
                                setFieldValue("drejtori.surname", "");
                                setFieldValue("drejtori.street", "");
                                setDrejtorFetched(false);
                              }
                              setLoadingDrejtor(false);
                            }}
                          />
                          <ErrorMessage name="DrejtoriNumriPersonal" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                        </div>

                        {loadingDrejtor && (
                          <div className="flex items-center justify-center space-x-2 text-indigo-600">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Duke kërkuar drejtorin...</span>
                          </div>
                        )}

                        {drejtorFetched && !loadingDrejtor && (
                          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                            <h3 className="text-indigo-700 font-medium mb-2 text-sm">Të dhënat e drejtorit:</h3>
                            <div className="space-y-2">
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <Field
                                  name="drejtori.name"
                                  placeholder="Emri i Drejtorit"
                                  readOnly
                                  className="w-full p-3 pl-10 rounded-lg border border-indigo-200 bg-white/70 cursor-not-allowed"
                                />
                              </div>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <Field
                                  name="drejtori.surname"
                                  placeholder="Mbiemri i Drejtorit"
                                  readOnly
                                  className="w-full p-3 pl-10 rounded-lg border border-indigo-200 bg-white/70 cursor-not-allowed"
                                />
                              </div>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <MapIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <Field
                                  name="drejtori.street"
                                  placeholder="Rruga e Drejtorit"
                                  readOnly
                                  className="w-full p-3 pl-10 rounded-lg border border-indigo-200 bg-white/70 cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="submit"
                      className={`w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed ${strength < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={strength < 4 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Duke krijuar llogarinë...
                        </>
                      ) : (
                        "Krijo llogari"
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            )}

            <p className="text-center mt-6 text-gray-600">
              Dëshironi të ktheheni?{" "}
              <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline">
                Paneli i kontrollit
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
          <div className="absolute w-full h-full bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover opacity-10"></div>
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
              Si administrator, mund të krijoni dhe menaxhoni llogaritë për komunat dhe shkollat në platformën tonë të menaxhimit financiar. Monitoroni shpenzimet dhe optimizoni buxhetin në shkallë të gjerë.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthRegister;
type userRegisterCredentials = userRegisterCredentialsKomuna | userRegisterCredentialsShkolla| userRegisterCredentialsAdmin;

interface authFormProps {
  model: userRegisterCredentials;
  onSubmit(
    values: userRegisterCredentials,
    actions: FormikHelpers<userRegisterCredentials>
  ): void;
}
