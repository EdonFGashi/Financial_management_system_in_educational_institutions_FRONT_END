import axiosInstance from "./api/axiosInstance"; 
import { urlAccounts } from "./endpoints";
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
        response = await axiosInstance.post(`${urlAccounts}/register-komuna`, dto);
      } else if (values.role === "Shkolla") {
        const dto: userRegisterCredentialsShkolla = {
          email: values.email,
          password: values.password,
          role: values.role,
          shkollaName: values.shkollaName,
          komunaId: values.komunaId,
          shkollaStreet: values.shkollaStreet,
          drejtori: {
            personalNumber: values.drejtori.personalNumber,
            name: values.drejtori.name,
            surname: values.drejtori.surname,
            street: values.drejtori.street,
          },
        };
        response = await axiosInstance.post(`${urlAccounts}/register-shkolla`, dto);
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
    drejtori: {
      personalNumber: "",
      name: "",
      surname: "",
      street: "",
    },
  } as userRegisterCredentials}
  onSubmit={register}
/>
    </>
  );
}
