import axiosInstance from "./api/axiosInstance";
import { urlKompania } from "./endpoints";
import {
  authenticationResponse,
  userRegisterCredentialsKompania,
} from "./auth/auth.models";
import { useContext, useState } from "react";
import AuthenticationContext from "./auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { getClaims, saveToken } from "./auth/handleJWT";
import KompaniRegister from "./auth/RegisterKompani";
import axios from "axios";
import TwoFAVerificationModal from "./components/TwoFAVerificationModal";
import Swal from "sweetalert2";

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const { update } = useContext(AuthenticationContext);
  const navigate = useNavigate();

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [codeToVerify, setCodeToVerify] = useState("");
  const [formValues, setFormValues] =
    useState<userRegisterCredentialsKompania | null>(null);

  async function register(values: userRegisterCredentialsKompania) {
    try {
      setErrors([]); // Clear previous errors

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

      setFormValues(dto); // Save form values for final registration

      // Make the API request to send the 2FA code
      const sendCodeResponse = await axios.post(
        "http://localhost:5102/api/TwoFA/send-code",
        {
          email: values.email,
        }
      );
      console.log("MODALI: ", sendCodeResponse.data.succeeded);
      console.log("MODALIII: ", sendCodeResponse.data.data);

      if (sendCodeResponse.data.succeeded) {
        setShow2FAModal(true); // Show modal upon success
      } else {
        setErrors(["Dështoi dërgimi i kodit të verifikimit."]);
      }
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors(["Gabim gjatë dërgimit të kodit."]);
      }
    }
  }

  async function verifyAndRegister(code: string) {
    try {
      console.log("U hi te modalo");
      if (!formValues) return;

      const verifyResponse = await axios.post(
        "http://localhost:5102/api/TwoFA/verify-code",
        {
          email: formValues.email,
          code,
        }
      );
      console.log("VERIFIKIMI ", verifyResponse.data.succeeded);
      if (verifyResponse.data.succeeded) {
        console.log("TE DHENAT E FORMES: ", formValues);
        const response = await axiosInstance.post(`${urlKompania}`, formValues);

        console.log("TE DHENAT E REGJISTRIMIT: ", response.data);
        if (response.data) {
          console.log("U REGJISTRU : ", response);
          setShow2FAModal(false);
        
          const okej = await Swal.fire({
            title: "Njoftim",
            text: `Llogaria juaj është regjistruar me sukses !`,
            icon: "info", // You can use 'success', 'warning', 'error', etc. depending on the context
            confirmButtonColor: "#16a34a",
            confirmButtonText: "OK"
          });
          if (okej.isConfirmed) {
            navigate("/signin");
          }
        }
      } else {
        Swal.fire({
          title: "Gabim",
          text: "Kodi nuk është i saktë ose ka skaduar!",
          icon: "error",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK"
        });
      }
    } catch (error: any) {
      setErrors(["Gabim gjatë verifikimit ose regjistrimit."]);
    } finally {
      // setShow2FAModal(false);
    }
  }

  return (
    <>
      <KompaniRegister
        model={
          {
            email: "",
            password: "",
            role: "Kompani",
            EmriKompanis: "",
            Sherbimi: "",
            NrXhirologaris: 0,
            Qyteti: 0,
            KompaniaRruga: "",
            PronariNumriPersonal: 0,
          } as userRegisterCredentialsKompania
        }
        onSubmit={register}
      />
      <TwoFAVerificationModal
        isOpen={show2FAModal} // Pass the correct state
        email={formValues?.email || ""} // Pass the email from form values
        onCancel={() => setShow2FAModal(false)} // Close modal on cancel
        onVerify={verifyAndRegister} // Handle verification when the form is submitted
      />
    </>
  );
}
