
import { Link } from 'react-router-dom';

function SignIn() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-indigo-800"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}    
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Kyçu</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email-i juaj"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
          <input
            type="password"
            placeholder="Fjalëkalimi"
            className="w-full p-3 rounded-lg border border-gray-200"
          />
          <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition">
            Kyçu
          </button>
        </form>
        <p className="text-center mt-4">
          Nuk keni llogari?{" "}
          <Link className="text-indigo-600 hover:underline" to="/signup">
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
  );
}

export default SignIn;
