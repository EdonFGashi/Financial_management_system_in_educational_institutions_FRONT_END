function Footer() {
    return (
      <footer
        className="bg-gray-900 text-gray-400 text-center py-10 text-sm"
      >
        <div className="max-w-4xl mx-auto">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} Sistemi i Menaxhimit të Financave
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-white transition">Rreth Nesh</a>
            <a href="#" className="hover:text-white transition">Kontakt</a>
            <a href="#" className="hover:text-white transition">Privatësia</a>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            Krijuar nga studentët e Universitetit të Prishtinës - FIEK
          </p>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  