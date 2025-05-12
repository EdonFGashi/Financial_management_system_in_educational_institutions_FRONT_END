import axiosInstance from "./api/axiosInstance"; 
import { urlListShkolla, urlListKomuna } from "./endpoints";
import {
  authenticationResponse,
  userRegisterCredentials,
  userRegisterCredentialsKomuna,
  userRegisterCredentialsShkolla,
} from "./auth/auth.models";
import { useContext, useState } from "react";
import AuthenticationContext from "./auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./auth/handleJWT";
import AuthRegister from "./auth/AuthRegister";

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  async function register(values: userRegisterCredentials) {
    console.log("Submitted values:", values);
    try {
      setErrors([]);
      let response;

      if (values.role === "Komunë") {
        console.log("Registering a Komunë");
        const dto: userRegisterCredentialsKomuna = {
          email: values.email,
          password: values.password,
          role: values.role,
          qyteti: values.qyteti,
          nrPopullsis: values.nrPopullsis ?? 0,
          buxhetiAktual: values.buxhetiAktual ?? 0,
          ditaNdarjesAuto: false,
        };
        response = await axiosInstance.post(`${urlListKomuna}/register-komuna`, dto);
      } else if (values.role === "Shkollë") {
        const dto = {
          Email: values.email,
          Password: values.password,
          EmriShkolles: values.EmriShkolles,
          NrNxenesve: null,
          Qyteti: parseInt(values.komunaId), // converting to int as backend expects int
          DrejtoriNumriPersonal: values.personalNumber,
          KodiPostal: "", // optional, default to empty
          ShkollaRruga: values.ShkollaRruga
        };
        response = await axiosInstance.post(`${urlListShkolla}/register-shkolla`, dto);
      }

      if (response) {
        saveToken(response.data);
        update(getClaims());
        navigate("/");
      }
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors(["Unknown error occurred."]);
      }
    }
  }

  return (
    <>
      <AuthRegister
  model={{
    email: "",
    password: "",
    confirmPassword: "",
    role: "Komunë",
    qyteti: "",
    nrPopullsis: null,
    buxhetiAktual: null,
    ditaNdarjesAuto: false,
    shkollaName: "",
    komunaId: "",
    shkollaStreet: "",
    personalNumber: "",
  } as userRegisterCredentials}
  onSubmit={register}
/>
    </>
  );
}
