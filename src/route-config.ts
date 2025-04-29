import RedirectToLandingPage from "./RedirectToLandingPage";
import Signup from "./AuthForm";
import Home from "./pages/Home";
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import Register from "./Register";
import Login from "./auth/Login";

const routes = [
    { path: "/", component: Home },
  { path: "/signin", component: Login },
  // { path: "/signup", component: SignUp },
  { path: "/register", component: Register },

  // Komuna
  { path: "/komuna/dashboard", component: KomunaDashboard, isAdmin: false},
  { path: "/komuna/porosite/lista", component: ListaPorosive, isAdmin: false},
  { path: "/komuna/porosite/raporte", component: RaportetPorosi ,isAdmin: false},

  // Shkolla
  { path: "/shkolla/dashboard", component: ShkollaDashboard, isAdmin: true },
  { path: "/shkolla/porosite/market", component: Market , isAdmin: true},
  { path: "/shkolla/porosite/shporta", component: Shporta , isAdmin: true},
  { path: "/shkolla/porosite/historiku", component: Historiku , isAdmin: true},
  { path: "/shkolla/stafi/menaxhimi", component: StafiShkolles , isAdmin: true},
  // { path: "/shkolla/stafi/ndalesat", component: NdalesatPage },
  // { path: "/shkolla/stafi/oret-shtese", component: OretShtesePage },

  // Kompania
  { path: "/kompania/dashboard", component: KompaniaDashboard, isAdmin: true },
  // { path: "/kompania/porosite/market", component: Market },
  // { path: "/kompania/porosite/shporta", component: Shporta },

  {path: '*', component: RedirectToLandingPage}
    
];

export default routes;