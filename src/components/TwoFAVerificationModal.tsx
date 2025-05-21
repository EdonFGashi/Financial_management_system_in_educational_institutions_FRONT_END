import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

interface TwoFAVerificationModalProps {
  isOpen: boolean;
  email: string;
  onCancel: () => void;
  onVerify: (code: string) => void;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required("Kodi është i detyrueshëm")
    .length(6, "Kodi duhet të jetë 6 shifra"),
});

export default function TwoFAVerificationModal({
  isOpen,
  email,
  onCancel,
  onVerify,
}: TwoFAVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds instead of 10 minutes

  useEffect(() => {
    if (!isOpen) return;

    // Reset timer when modal opens
    setTimeLeft(60); // 1 minute in seconds

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // Return with color formatting based on time remaining
    return secs < 10 && mins === 0
      ? `<span class="text-red-600 font-bold">${mins}:${secs.toString().padStart(2, "0")}</span>`
      : `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get color class based on time remaining
  const getTimeColor = (seconds: number): string => {
    if (seconds <= 10) return "bg-red-200 text-red-800 animate-pulse";
    if (seconds <= 30) return "bg-amber-200 text-amber-800";
    return "bg-rose-200 text-rose-800";
  };

  if (!isOpen) return null;

  const handleVerify = async (values: { code: string }) => {
    setIsLoading(true);
    try {
      await onVerify(values.code);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl p-0 shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 py-6 px-8 relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400 opacity-50"></div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Verifikimi me dy faktorë
          </h2>
          <p className="text-rose-100 mt-1 text-sm">
            Ju lutemi shkruani kodin për të vazhduar
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6 bg-rose-50 rounded-lg p-4 border border-rose-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mr-4 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Kodi është dërguar në</p>
                <p className="font-bold text-rose-700">{email}</p>
                <div className="flex items-center mt-1">
                  <div className={`${getTimeColor(timeLeft)} px-2 py-0.5 rounded-full flex items-center`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3 w-3 mr-1 ${timeLeft <= 10 ? "animate-ping" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Kodi skadon për <span className={`font-bold ${timeLeft <= 10 ? "text-red-700" : ""}`}>{formatTime(timeLeft).replace(/<\/?span[^>]*>/g, '')}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Kontrolloni emailin tuaj dhe shkruani kodin 6-shifror që keni marrë.
              <span className="font-medium text-rose-600"> Kodi është i vlefshëm vetëm për 1 minutë!</span>
            </p>
            
            {timeLeft <= 10 && (
              <div className="mt-2 text-red-600 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Kujdes! Koha po mbaron.
              </div>
            )}
            
            {timeLeft === 0 && (
              <div className="mt-2 bg-red-100 border border-red-200 rounded p-2 text-red-700 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kodi ka skaduar. Ju lutem kërkoni një kod të ri.
              </div>
            )}
          </div>

          <Formik
            initialValues={{ code: "" }}
            validationSchema={validationSchema}
            onSubmit={handleVerify}
          >
            <Form className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-rose-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                  Kodi i verifikimit
                </label>
                <div className="relative">
                  <Field
                    name="code"
                    id="code"
                    type="text"
                    placeholder="······"
                    className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-center font-mono text-xl tracking-[0.5em] bg-gray-50 shadow-inner"
                    maxLength={6}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <ErrorMessage
                  name="code"
                  component="p"
                  className="text-rose-600 text-sm mt-2 font-medium flex items-center"
                />
              </div>

              <div className="flex justify-end items-center pt-3 border-t border-gray-100">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Anulo
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || timeLeft <= 0}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Duke verifikuar...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Verifiko
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}
