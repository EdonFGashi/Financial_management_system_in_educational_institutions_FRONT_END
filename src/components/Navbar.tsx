import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Ballina" },
    { to: "/dashboard", label: "Paneli" },
  ];

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-black font-semibold underline underline-offset-4"
      : "text-black";

  return (
    <nav className="bg-white px-6 py-4 shadow-md flex items-center justify-between border-b border-gray-200">
      {/* Brand */}
      <Link
        to="/"
        className="text-2xl font-extrabold tracking-wide text-black hover:opacity-90 transition"
      >
        Financa<span className="text-gray-400">Edu</span>
      </Link>

      {/* Links */}
      <div className="flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative text-lg font-medium transition duration-200 ${isActive(
              link.to
            )} after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all after:duration-300`}
          >
            {link.label}
          </Link>
        ))}

        {/* Login Button */}
        <Link
          to="/signin"
          className="px-5 py-2 bg-black text-white rounded-xl font-medium shadow-md hover:bg-gray-800 transition"
        >
          Log In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
