import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SignUp() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    checkStrength(password);
    setPasswordMatch(password === confirmPassword || confirmPassword === '');
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
  const strengthColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-indigo-800"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
      }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Regjistrohu</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Emri i plotë"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
          <input
            type="email"
            placeholder="Email-i juaj"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
          <input
            type="password"
            placeholder="Fjalëkalimi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200"
          />

          {password && (
            <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
              <div
                className={`h-2 ${strengthColor[strength - 1]}`}
                style={{ width: `${(strength / 4) * 100}%` }}
              ></div>
            </div>
          )}

          {password && (
            <p className={`text-sm ${strength < 3 ? 'text-red-500' : 'text-green-600'}`}>
              Forca e fjalëkalimit: <strong>{strengthLabel[strength - 1]}</strong>
            </p>
          )}

          <input
            type="password"
            placeholder="Konfirmo fjalëkalimin"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full p-3 rounded-lg border ${passwordMatch ? 'border-gray-200' : 'border-red-500'}`}
          />

          {!passwordMatch && (
            <p className="text-sm text-red-500">⚠️ Fjalëkalimet nuk përputhen!</p>
          )}

          <button
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
            disabled={strength < 4 || !passwordMatch}
          >
            Regjistrohu
          </button>
        </form>

        <p className="text-center mt-4">
          Keni llogari?{" "}
          <Link className="text-indigo-600 hover:underline" to="/signin">
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
  );
}

export default SignUp;
