import axios from "axios";
import { getToken } from "../auth/handleJWT";
import Swal from "sweetalert2";

export default function configureIntercetor() {
  axios.interceptors.request.use(
    function (config) {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
  // Response Interceptor (for error handling and showing alerts)
  axios.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const rawMessage = error.response.data;

        const message =
          typeof rawMessage === "string"
            ? rawMessage
            : rawMessage?.message || "Something went wrong.";

        Swal.fire("Error", message, "error"); // Show SweetAlert with error message
      }
      return Promise.reject(error); // Pass the error back for further handling
    }
  );
}
