import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import InventariAktual from "./pages/Shkolla/porosite/InventariAktual";
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";


function App() {
  return (
    <Router>
      <AnimatedRoutes>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          // Komuna
          <Route path="/komuna/dashboard" element={<KomunaDashboard />} />
          <Route path="/komuna/porosite/lista" element={<ListaPorosive />} />
          <Route path="/komuna/porosite/raporte" element={<RaportetPorosi />} />
          // Shkolla
          <Route path="/shkolla/dashboard" element={<ShkollaDashboard />} />
          <Route path="/shkolla/porosite/market" element={<Market />} />
          <Route path="/shkolla/porosite/shporta" element={<Shporta />} />
          <Route path="/shkolla/porosite/historiku" element={<Historiku/>} />
          <Route path="/shkolla/stafi/menaxhimi" element={<StafiShkolles />} />
          <Route path="/shkolla/porosite/inventari" element={<InventariAktual />} />


          {/*<Route path="/shkolla/stafi/ndalesat" element={<NdalesatPage />} />*/}
          {/*<Route path="/shkolla/stafi/oret-shtese" element={<OretShtesePage />} />*/}
          // Kompania
          <Route path="/kompania/dashboard" element={<KompaniaDashboard />} />
          {/* <Route path="/kompania/porosite/market" element={<Market />} />
          <Route path="/kompania/porosite/shporta" element={<Shporta />} /> */}
        </Routes>
      </AnimatedRoutes>
    </Router>
  );
}

export default App;
