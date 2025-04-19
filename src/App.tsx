import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import AnimatedRoutes from "./components/AnimatedRoutes";

function App() {
  return (
    <Router>
      <AnimatedRoutes>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/komuna/dashboard" element={<KomunaDashboard />} />
          <Route path="/komuna/porosite/lista" element={<ListaPorosive />} />
          <Route path="/komuna/porosite/raporte" element={<RaportetPorosi />} />
        </Routes>
      </AnimatedRoutes>
    </Router>
  );
}

export default App;
