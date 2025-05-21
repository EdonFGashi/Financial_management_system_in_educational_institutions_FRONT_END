import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { userRegisterCredentialsKomuna } from "./auth.models";
import { useKomunaOptions } from "../hooks/useKomunaOptions";
import { fetchPersonByNrPersonal } from "../hooks/grabPersonDetails";



type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  role: "Kompani" ;
  qyteti?: string;
  nrPopullsis?: number | null;
  buxhetiAktual?: number | null;
  ditaNdarjesAuto?: boolean;

  // Optional for Shkollë
  EmriShkolles?: string;
  komunaId?: string;
  ShkollaRruga?: string;
  drejtori?: {
    personalNumber?: string;
    name?: string;
    surname?: string;
    street?: string;
  };
};


function RegisterKompani(props: authFormProps) {
  const navigate = useNavigate();
  const [drejtorFetched, setDrejtorFetched] = useState(false);
  const [loadingDrejtor, setLoadingDrejtor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const komunaOptions = useKomunaOptions();
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastNrValue, setLastNrValue] = useState(""); // Track the last personal number value
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const fullText = "Menaxhim i automatizuar i shërbimeve të furnizuesve për institucionet arsimore.";
  
  const strengthLabel = ["Shumë e dobët", "E dobët", "Mesatare", "Perfekte"];
  const strengthColor = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
  ];

  // Collection of background images to cycle through
  const backgroundImages = [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  useEffect(() => {
    // Set up a timer to switch background images every 10 seconds
    const timer = setInterval(() => {
      setBackgroundIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);

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
    .oneOf([Yup.ref("password")], "Fjalëkalimet nuk përputhen"),

  role: Yup.string().required("Roli është i detyrueshëm"),

  EmriKompanis: Yup.string().when("role", {
    is: "Kompani",
    then: schema => schema.required("Emri i Kompanisë është i detyrueshëm"),
  }),

  Sherbimi: Yup.string().when("role", {
    is: "Kompani",
    then: schema => schema.required("Sherbimi është i detyrueshëm"),
  }),

  NrXhirologaris: Yup.number()
    .typeError("Duhet të jetë numër")
    .required("Nr i xhirollogarisë është i detyrueshëm")
    .moreThan(0, "Nuk mund të jetë zero"),

  Qyteti: Yup.number()
    .typeError("Zgjidhni një qytet")
    .required("Qyteti është i detyrueshëm"),

  KompaniaRruga: Yup.string().when("role", {
    is: "Kompani",
    then: schema => schema.required("Rruga e kompanisë është e detyrueshme"),
  }),

  PronariNumriPersonal: Yup.number()
    .typeError("Duhet të jetë numër")
    .required("Nr personal i pronarit është i detyrueshëm")
    .test("length", "Duhet të ketë saktësisht 10 shifra", val => val?.toString().length === 10),

  KodiPostal: Yup.string().nullable(), // Optional
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
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-rose-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {toast.message}
        </div>
      )}
      
      <div className="min-h-screen flex">
        {/* Left side - Sign Up form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
          <div className="max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-rose-700 mb-4">
                <span className="relative">
                  Regjistro Kompaninë
                  <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-rose-400 rounded"></span>
                </span>
              </h1>
              <p className="text-gray-600">Krijoni një llogari për kompaninë tuaj dhe bëhuni pjesë e platformës sonë për furnizim të institucioneve arsimore.</p>
            </div>

            <Formik<userRegisterCredentialsKompania>
              initialValues={{
                email: "",
                password: "",
                confirmPassword: "",
                role: "Kompani",
                EmriKompanis: "",
                Sherbimi: "",
                NrXhirologaris: undefined,
                Qyteti: 0,
                KompaniaRruga: "",
                PronariNumriPersonal: undefined,
                KodiPostal: "10000"
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, actions) => {
                setIsSubmitting(true);
                try {
                  const { confirmPassword, ...cleaned } = values;
                  console.log("Submitted raw values:", values);
                  
                  // Call onSubmit without checking its return value
                  await props.onSubmit(
                    cleaned as userRegisterCredentialsKompania,
                    actions as FormikHelpers<userRegisterCredentialsKompania>
                  );
                  
                  // Consider it a success if we reach here without errors being thrown
                  // We can assume if the API call succeeded without exceptions, registration was successful
                  setToast({ message: "Kompania u regjistrua me sukses!", type: "success" });
                  setTimeout(() => {
                    navigate("/register");
                  }, 1500);
                  
                } catch (error) {
                  console.error("Registration failed:", error);
                  // Show an error toast
                  setToast({ message: "Regjistrimi dështoi. Provoni përsëri.", type: "error" });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {({ values, handleChange, handleBlur, setFieldValue }) => {
                // Define fetchPersonDetails inside Formik context to have access to setFieldValue
                const fetchPersonDetails = async (personalNumber: string) => {
                  if (personalNumber.length === 10 && personalNumber !== lastNrValue) {
                    setLastNrValue(personalNumber);
                    setLoadingDrejtor(true);
                    try {
                      const person = await fetchPersonByNrPersonal(personalNumber);
                      if (person) {
                        setFieldValue("pronari.name", person.emri);
                        setFieldValue("pronari.surname", person.mbiemri);
                        setFieldValue("pronari.street", person.adresa?.rruga || "");
                        setDrejtorFetched(true);
                      } else {
                        setFieldValue("pronari.name", "");
                        setFieldValue("pronari.surname", "");
                        setFieldValue("pronari.street", "");
                        setDrejtorFetched(false);
                      }
                    } catch (error) {
                      console.error("Error fetching person:", error);
                      setDrejtorFetched(false);
                    } finally {
                      setLoadingDrejtor(false);
                    }
                  } else if (personalNumber.length !== 10) {
                    // Clear fetched state when number is incomplete
                    setDrejtorFetched(false);
                  }
                };

                return (
                <Form className="space-y-5">
                    {/* Email */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                      </div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email-i i kompanisë"
                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                      </div>
                      <Field
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Fjalëkalimi"
                        className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
                          <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-rose-500" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400 hover:text-rose-500" />
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
                      <LockClosedIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field
                      name="confirmPassword"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Konfirmo fjalëkalimin"
                      className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Të dhënat e Kompanisë</h3>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field 
                      name="EmriKompanis" 
                      placeholder="Emri i Kompanisë" 
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <ErrorMessage name="EmriKompanis" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <HomeIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field 
                      as="select" 
                      name="Qyteti" 
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all appearance-none"
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
                    <ErrorMessage name="Qyteti" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPinIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field 
                      name="KompaniaRruga" 
                      placeholder="Rruga e Kompanisë" 
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <ErrorMessage name="KompaniaRruga" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field 
                      name="Sherbimi" 
                      placeholder="Shërbimi që ofron kompania" 
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <ErrorMessage name="Sherbimi" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CreditCardIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field 
                      name="NrXhirologaris"  
                      placeholder="Numri i Xhirollogarisë" 
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <ErrorMessage name="NrXhirologaris" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Të dhënat e Pronarit</h3>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <IdentificationIcon className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <Field
                      name="PronariNumriPersonal"
                      placeholder="Nr Personal i Pronarit"
                      className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        // Call fetchPersonDetails when value changes
                        fetchPersonDetails(e.target.value);
                      }}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        handleBlur(e);
                        // Keep the onBlur for validation purposes
                        fetchPersonDetails(e.target.value);
                      }}
                    />
                    <ErrorMessage name="PronariNumriPersonal" component="p" className="text-red-500 text-sm mt-1 font-medium" />
                  </div>

                  {loadingDrejtor && (
                    <div className="flex items-center justify-center space-x-2 text-rose-600">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Duke verifikuar pronarin...</span>
                    </div>
                  )}

                  {values.PronariNumriPersonal?.toString().length === 10 && !loadingDrejtor && !drejtorFetched && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-red-600 text-sm font-medium flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Personi me këtë numër personal nuk u gjet. Ju lutem verifikoni numrin.
                      </p>
                    </div>
                  )}

                  {drejtorFetched && !loadingDrejtor && (
                    <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                      <h3 className="text-rose-700 font-medium mb-2 text-sm">Të dhënat e pronarit:</h3>
                      <div className="space-y-2">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <Field
                            name="pronari.name"
                            placeholder="Emri i Pronarit"
                            readOnly
                            className="w-full p-3 pl-10 rounded-lg border border-rose-200 bg-white/70 cursor-not-allowed"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <Field
                            name="pronari.surname"
                            placeholder="Mbiemri i Pronarit"
                            readOnly
                            className="w-full p-3 pl-10 rounded-lg border border-rose-200 bg-white/70 cursor-not-allowed"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <Field
                            name="pronari.street"
                            placeholder="Rruga e Pronarit"
                            readOnly
                            className="w-full p-3 pl-10 rounded-lg border border-rose-200 bg-white/70 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full bg-rose-600 text-white p-3 rounded-lg hover:bg-rose-700 transition transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed ${(strength < 4 || !drejtorFetched) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={strength < 4 || !drejtorFetched || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Duke regjistruar kompaninë...
                      </>
                    ) : (
                      "Regjistro Kompaninë"
                    )}
                  </button>
                </Form>
              );
            }}
            </Formik>

            <p className="text-center mt-6 text-gray-600">
              Keni llogari?{" "}
              <Link to="/signin" className="text-rose-600 font-medium hover:underline">
                Kyçu këtu
              </Link>
            </p>

            <Link
              to="/"
              className="block mt-8 text-center text-rose-600 hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kthehu në ballinë
            </Link>
          </div>
        </div>

        {/* Right side - Gradient background with animated text centered */}
        <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-rose-700 via-red-600 to-red-700 items-center justify-center overflow-hidden">
          {/* Background image with crossfade effect */}
          {backgroundImages.map((url, index) => (
            <div 
              key={url}
              className={`absolute w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
                index === backgroundIndex ? 'opacity-10' : 'opacity-0'
              }`}
              style={{backgroundImage: `url(${url})`}}
            ></div>
          ))}
          
          <div className="relative z-10 max-w-md px-8 py-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl">
            {/* Background image controls */}
            <div className="absolute top-2 right-2 flex space-x-1">
              {backgroundImages.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setBackgroundIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === backgroundIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Switch to background ${index + 1}`}
                ></button>
              ))}
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="p-2 bg-white rounded-full">
                <BuildingOfficeIcon className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-4">
              {animatedText}
            </h2>
            <p className="text-white/80 text-center mb-6">
              Si kompani e regjistruar në platformën tonë, do të keni mundësinë të ofroni shërbimet tuaja për institucionet arsimore në mënyrë të automatizuar dhe transparent.
            </p>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterKompani;
type userRegisterCredentialsKompania= any;

interface authFormProps {
  model: userRegisterCredentialsKompania;
  onSubmit(
    values: userRegisterCredentialsKompania,
      actions: FormikHelpers<userRegisterCredentialsKompania>
  ): void;
}
