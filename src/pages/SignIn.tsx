import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';


const FiMail = FiIcons.FiMail as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiLock = FiIcons.FiLock as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiEye = FiIcons.FiEye as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FiEyeOff = FiIcons.FiEyeOff as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [animatedText, setAnimatedText] = useState('');
  const fullText = 'Hyni në platformë dhe filloni menaxhimin tuaj me lehtësi.';

  // Smooth repeating typewriter effect
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

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 py-16 bg-white">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">Mirësevini</h1>
          <p className="text-gray-600 mb-8">Kyçuni për të vazhduar në platformën tuaj.</p>

          <form className="space-y-5">
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Fjalëkalimi"
                className="w-full p-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Kyçu
            </button>
          </form>

          <p className="text-center mt-6">
            Nuk keni llogari?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Regjistrohu këtu
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

export default SignIn;