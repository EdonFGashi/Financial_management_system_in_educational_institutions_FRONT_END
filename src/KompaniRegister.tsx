import axiosInstance from "./api/axiosInstance"; 
import {urlKompania } from "./endpoints";
import {
  authenticationResponse,
  userRegisterCredentialsKompania,
} from "./auth/auth.models";
import { useContext, useState } from "react";
import AuthenticationContext from "./auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./auth/handleJWT";
import KompaniRegister from "./auth/RegisterKompani";

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  async function register(values: userRegisterCredentialsKompania) {
    console.log("Submitted values:", values);
    try {
      setErrors([]);
      let response;

        console.log("Registering a Kompania ");
        const dto: userRegisterCredentialsKompania = {
          email: values.email,
          password: values.password,
          role: values.role,
          Qyteti: values.Qyteti,
          EmriKompanis: values.EmriKompanis,
          Sherbimi: values.Sherbimi,
          NrXhirologaris: values.NrXhirologaris,
          KompaniaRruga: values.KompaniaRruga,
          PronariNumriPersonal: values.PronariNumriPersonal

        };
        response = await axiosInstance.post(`${urlKompania}`, dto);

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
      <KompaniRegister
  model={{
  email: "",
  password: "",
  role: "Kompani",
  EmriKompanis: "",
  Sherbimi: "",
  NrXhirologaris: 0,
  Qyteti: "",
  KompaniaRruga: "",
  PronariNumriPersonal: 0
  } as userRegisterCredentialsKompania}
  onSubmit={register}
/>
    </>
  );
}
