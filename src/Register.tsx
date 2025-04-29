import axios from "axios";
import { urlAccounts } from "./endpoints";
import { authenticationResponse, userCredentials } from "./auth/auth.models";
import { useContext, useState } from "react";
import AuthForm from "./AuthForm";
// import { getClaims, saveToken } from "./handleJWT";
import AuthenticationContext from "./auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./auth/handleJWT";
import AuthRegister from "./auth/AuthRegister";

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  async function register(credentials: userCredentials) {
    try {
      setErrors([]);
      console.log(credentials);
      const response = await axios.post<authenticationResponse>(
        `${urlAccounts}/create`,
        credentials
      );
      saveToken(response.data);
      update(getClaims());
      navigate("/");
      console.log(response);
    } catch (error) {}
  }
  return ( 
    <>
      <AuthRegister
        model={{ email: "", password: "" , organisationName: "", confirmPassword: "", role: ""}}
        onSubmit={async (values) => await register(values)}
      />
    </>
  );
}
