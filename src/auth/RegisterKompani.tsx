import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import * as FiIcons from "react-icons/fi";
import { userRegisterCredentialsShkolla, userRegisterCredentialsKomuna } from "./auth.models";
import { useKomunaOptions } from "../hooks/useKomunaOptions";
import { fetchPersonByNrPersonal } from "../hooks/grabPersonDetails";



const FiUser = FiIcons.FiUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiMail = FiIcons.FiMail as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiLock = FiIcons.FiLock as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiHouse= FiIcons.FiHome as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiBook= FiIcons.FiBook as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiRoad= FiIcons.FiCompass as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiLicense= FiIcons.FiCreditCard as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
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
  const [drejtorFetched, setDrejtorFetched] = useState(false);
  const [loadingDrejtor, setLoadingDrejtor] = useState(false);
  const komunaOptions = useKomunaOptions();
  const [strength, setStrength] = useState(0);
  const [animatedText, setAnimatedText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const fullText = "Krijoni një llogari për të menaxhuar Kompani.";

  const roles = ["Admin", "Komunë", "Shkollë"];

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

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-rose-700 mb-4">Regjistro Kompaninë</h1>
          <p className="text-gray-600 mb-8">Krijoni një llogari të re për të vazhduar.</p>

          <Formik<userRegisterCredentialsKompania>
  initialValues={{
  email: "", 
  password: "",
  confirmPassword: "",
  role: "Kompani",
  EmriKompanis: "",
  Sherbimi: "",
  NrXhirollogaris: 0,
  qyteti: "", // 
  KompaniaRruga: "",
  personalNumber: "",
  pronari: {
    personalNumber: "",
    name: "",
    surname: "",
    street: ""
  }
}}

  validationSchema={validationSchema}
  onSubmit={(values, actions) => {
    const { confirmPassword, ...cleaned } = values;
  
    props.onSubmit(
      cleaned as userRegisterCredentialsKompania,
      actions as FormikHelpers<userRegisterCredentialsKompania>
    );
    
  }}
>


            {({ values, handleChange, handleBlur, setFieldValue }) => (
              <Form className="space-y-5">

                

                {/* Email */}
                <div className="relative">
                  <FiMail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email-i juaj"
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      checkStrength(e.target.value);
                    }}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-rose-600 text-sm"
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
                    className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="relative">
                <FiBook className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Field name="EmriKompanis" placeholder="Emri i Kompanisë" className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <ErrorMessage name="EmriKompanis" component="p" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative">
                <FiHouse className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Field as="select" name="Qyteti" className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="">Zgjidh Komunën</option>
                  {komunaOptions.map(k => (
                    <option key={k.komunaId} value={k.komunaId}>{k.qyteti}</option>
                  ))}
                </Field>
                <ErrorMessage name="Qyteti" component="p" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative">
                <FiRoad className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Field name="KompaniaRruga" placeholder="Rruga e Kompanis" className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                <ErrorMessage name="KompaniaRruga" component="p" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative">
                <FiRoad className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Field name="Sherbimi" placeholder="Sherbimi" className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                <ErrorMessage name="Sherbimi" component="p" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative">
                <FiRoad className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Field name="NrXhirollogaris" placeholder="Numri i Xhirrollagaris" className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                <ErrorMessage name="NrXhirollogaris" component="p" className="text-red-500 text-sm mt-1" />
                </div>
                <div className="relative">
                                      <FiLicense className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                      <Field
                                        name="pronari.personalNumber"
                                        placeholder="Nr Personal Pronari"
                                        className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        onBlur={async (e: React.FocusEvent<HTMLInputElement>) => {
                                          const nr = e.target.value;
                                          if (!nr) return;
                                          setLoadingDrejtor(true);
                                            const person = await fetchPersonByNrPersonal(nr);
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
                                            setLoadingDrejtor(false);
                                        }}
                                      />
                                      <ErrorMessage name="pronari.personalNumber" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                    {loadingDrejtor && (
                                      <p className="text-rose-500 text-sm mt-1">Duke kërkuar drejtorin...</p>
                                    )}
                                    {drejtorFetched && !loadingDrejtor && (
                                        <>
                                          <div className="relative">
                                            <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                            <Field
                                              name="pronari.name"
                                              placeholder="Emri i Pronari"
                                              readOnly
                                              className="w-full p-3 pl-10 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                                            />
                                            <ErrorMessage name="pronari.name" component="p" className="text-red-500 text-sm mt-1" />
                                          </div>
                                          <div className="relative">
                                            <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                            <Field
                                              name="pronari.surname"
                                              placeholder="Mbiemri i Pronari"
                                              readOnly
                                              className="w-full p-3 pl-10 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                                            />
                                            <ErrorMessage name="pronari.surname" component="p" className="text-red-500 text-sm mt-1" />
                                          </div>
                                          <div className="relative">
                                            <FiRoad className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                            <Field
                                              name="pronari.street"
                                              placeholder="Rruga e Pronarit"
                                              readOnly
                                              className="w-full p-3 pl-10 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                                            />
                                            <ErrorMessage name="pronari.street" component="p" className="text-red-500 text-sm mt-1" />
                                          </div>
                                        </>
                                      )}
                  

                <button
                  type="submit"
                  className="w-full bg-rose-600 text-white p-3 rounded-lg hover:bg-rose-700 transition"
                  disabled={strength < 4}
                >
                  Regjistrohu
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center mt-6">
            Keni llogari?{" "}
            <Link to="/signin" className="text-rose-600 hover:underline">
              Kyçu këtu
            </Link>
          </p>

          <Link
            to="/"
            className="block mt-6 text-center text-rose-600 hover:underline"
          >
            ← Kthehu në ballinë
          </Link>
        </div>
      </div>

      {/* Right side - Gradient background with animated text centered */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-rose-700 via-red-500 to-red-700 items-center justify-center">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center px-10">
          {animatedText}
        </h2>
      </div>
    </div>
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
