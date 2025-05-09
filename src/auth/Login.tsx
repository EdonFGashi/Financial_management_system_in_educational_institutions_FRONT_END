import { useContext, useEffect, useState } from "react";
import { authenticationResponse, userCredentials } from "./auth.models";
import axios from "axios";
import { urlAccounts } from "../endpoints";
import AuthForm from "../AuthForm";
// import { getClaims, saveToken } from "./handleJWT";
import AuthenticationContext from "./AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./handleJWT";

export default function Login() {
  const [errors, setErrors] = useState<string[]>([]);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  async function login(credentials: userCredentials) {
    try {
      setErrors([]);
      const response = await axios.post<authenticationResponse>(
        `${urlAccounts}/login`,
        credentials
      );
      saveToken(response.data);
      update(getClaims());
      navigate("/");
      console.log(credentials);
      console.log(response.data);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
          setErrors(["Kredencialet nuk janë të sakta!"]);
      } else {
          setErrors(["Ndodhi një gabim gjatë lidhjes me serverin."]);
      }
  }
  }

    // 👇 Clear errors after 5 seconds
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer); // cleanup
    }
  }, [errors]);

  return (
    <>
      <div className="relative min-h-screen">
  {/* floating error */}
  {errors.length > 0 && (
    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50">
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  )}

  <AuthForm
    model={{ email: "", password: "" }}
    onSubmit={async (values) => await login(values)}
  />
</div>
    </>
  );
}
