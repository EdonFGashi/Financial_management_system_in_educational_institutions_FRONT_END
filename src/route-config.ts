/*
* Auth Routes
*/
import RedirectToLandingPage from "./RedirectToLandingPage";
import Signup from "./AuthForm";
import Register from "./Register";
import Login from "./auth/Login";


/*
* Home routes
*/


import Home from "./pages/Home";

/*
*Komuna routes
*/

import KomunaDashboard from "./pages/komuna/KomunaDashboard";
import ListaPorosive from "./pages/komuna/porosite/ListaPorosive";
import RaportetPorosi from "./pages/komuna/porosite/RaportetPorosi";
import ListaShkollave from "./pages/komuna/shkollat/Shkollat";
import ShtoShkolle from "./pages/komuna/shkollat/ShtoShkolle"; 
import NdarjaBuxhetit from "./pages/komuna/buxheti/NdarjaBuxhetit";
import BuxhetiHistoriku from "./pages/komuna/buxheti/Historiku";
import KomunaListaKompanive from "./pages/komuna/kontraktoret/ListaKompanive";

/*
* Shkolla routes
*/
import ShkollaDashboard from "./pages/Shkolla/ShkollaDashboard";
import InventariAktual from "./pages/Shkolla/InventariAktual";
import Historiku from "./pages/Shkolla/porosite/Historiku";
import Market from "./pages/Shkolla/porosite/Market";
import Shporta from "./pages/Shkolla/porosite/Shporta";
import StafiShkolles from "./pages/Shkolla/stafi/ListaStafit";
import OretShtese from "./pages/Shkolla/stafi/OretShtese";
import Ndalesat from "./pages/Shkolla/stafi/Ndalesat";
import UsersManagement from "./admin/UsersManagement";

/*
* Kompania routes
*/
import KompaniaDashboard from "./pages/Kompania/KompaniaDashboard";
import RegjistriProdukteve from "./pages/Kompania/produktet/regjistriProdukteve";
import ListaPorosiveKompani from "./pages/Kompania/porosite/listaPorosive";
import RaportiPorosiveKompani from "./pages/Kompania/porosite/raportiPorosive";


const routes = [
  { path: "/", component: Home },
  { path: "/signin", component: Login },
  { path: "/register", component: Register },

  {
    path: "/perdoruesit",
    component: UsersManagement,
    allowedRoles: ["admin"],
  },

  // Komuna
  { 
    path: "/komuna/shkolla/listashkollave",
    component: ListaShkollave,
    allowedRoles: ["komun", "admin"]
  },
  { 
    path: "/komuna/shto-shkolle",
    component: ShtoShkolle,
    allowedRoles: ["komun", "admin"]
  },

  {
    path: "/komuna/dashboard",
    component: KomunaDashboard,
    allowedRoles: ["komun", "admin"],
  },
  {
    path: "/komuna/porosite/lista",
    component: ListaPorosive,
    allowedRoles: ["komun", "admin"],
  },
  {
    path: "/komuna/porosite/raporte",
    component: RaportetPorosi,
    allowedRoles: ["komun", "admin"],
  },
  {
  path: "/komuna/buxheti/historiku",
  component: BuxhetiHistoriku,
  allowedRoles: ["komun", "admin"]
  },

  { 
    path: "/komuna/buxheti",
    component: NdarjaBuxhetit,
    allowedRoles: ["komun", "admin"]
  },

  {
  path: "/komuna/kompanite",
  component: KomunaListaKompanive,
  allowedRoles: ["komun", "admin"],
},


  // Shkolla
  {
    path: "/shkolla/dashboard",
    component: ShkollaDashboard,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/inventari",
    component: InventariAktual,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/porosite/market",
    component: Market,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/porosite/shporta",
    component: Shporta,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/porosite/historiku",
    component: Historiku,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/stafi/menaxhimi",
    component: StafiShkolles,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/stafi/oret-shtese",
    component: OretShtese,
    allowedRoles: ["shkoll", "admin"],
  },
  {
    path: "/shkolla/stafi/ndalesat",
    component: Ndalesat,
    allowedRoles: ["shkoll", "admin"],
  },

  // Kompania

  {
    path: "/kompania/dashboard",
    component: KompaniaDashboard,
    allowedRoles: ["kompani", "admin"],
  },
  { path: "/kompania/regjistri", component: RegjistriProdukteve, allowedRoles: ["kompani", "admin"], },
  { path: "/kompania/porosite/lista", component: ListaPorosiveKompani, allowedRoles: ["kompani", "admin"],},
  { path: "/kompania/porosite/raporte", component: RaportiPorosiveKompani, allowedRoles: ["kompani", "admin"], },
    

  { path: "*", component: RedirectToLandingPage },
];

export default routes;
