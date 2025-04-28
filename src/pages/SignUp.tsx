import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as FiIcons from "react-icons/fi";

const FiUser = FiIcons.FiUser as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const FiMail = FiIcons.FiMail as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const FiLock = FiIcons.FiLock as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

function SignUp() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [animatedText, setAnimatedText] = useState("");
  const fullText = "Krijoni një llogari për të menaxhuar financat lehtësisht.";

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

  useEffect(() => {
    checkStrength(password);
    setPasswordMatch(password === confirmPassword || confirmPassword === "");
  }, [password, confirmPassword]);

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  };

  const strengthLabel = ["Shumë e dobët", "E dobët", "Mesatare", "Perfekte"];
  const strengthColor = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sign Up form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">
            Regjistrohu
          </h1>
          <p className="text-gray-600 mb-8">
            Krijoni një llogari të re për të vazhduar.
          </p>

          <form className="space-y-5">
            <div className="relative">
              <FiUser className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Emri i plotë"
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <FiMail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                placeholder="Email-i juaj"
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="Fjalëkalimi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {password && (
              <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`h-2 ${strengthColor[strength - 1]}`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                ></div>
              </div>
            )}

            {password && (
              <p
                className={`text-sm ${
                  strength < 3 ? "text-red-500" : "text-green-600"
                }`}
              >
                Forca e fjalëkalimit:{" "}
                <strong>{strengthLabel[strength - 1]}</strong>
              </p>
            )}

            <div className="relative">
              <FiLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="Konfirmo fjalëkalimin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border ${
                  passwordMatch ? "border-gray-300" : "border-red-500"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {!passwordMatch && (
              <p className="text-sm text-red-500">
                ⚠️ Fjalëkalimet nuk përputhen!
              </p>
            )}

            <button
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
              disabled={strength < 4 || !passwordMatch}
            >
              Regjistrohu
            </button>
          </form>

          <p className="text-center mt-6">
            Keni llogari?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Kyçu këtu
            </Link>
          </p>

          <Link
            to="/"
            className="block mt-6 text-center text-indigo-600 hover:underline"
          >
            ← Kthehu në ballinë
          </Link>
        </div>
      </div>

      {/* Right side - Gradient background with animated text centered */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-indigo-500 via-blue-500 to-blue-700 items-center justify-center">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-semibold text-center px-10">
          {animatedText}
        </h2>
      </div>
    </div>
  );
}

export default SignUp;
