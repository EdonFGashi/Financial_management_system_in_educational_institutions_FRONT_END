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
import UserProfile from "./pages/komuna/UserProfile";

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
import OperationsList from "./admin/OperationsList";
import RolePermissions from "./admin/RolePermissions";
import RoleBasedRegister from "./routes/RegisterRoute";


// const routes = [
//   { path: "/", component: Home },
//   { path: "/signin", component: Login },
//   { path: "/register", component: RoleBasedRegister,
//     allowedRoles: ["SuperAdmin","admin"]
//   },

//   {
//     path: "/perdoruesit",
//     component: UsersManagement,
//     allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla", ],
//   },
//   {
//     path: "/operations",
//     component: OperationsList,
//     allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla"],
//   },
//   {
//     path: "/rolePermissions",
//     component: RolePermissions,
//     allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla"],
//   },

//   // Komuna
//   { 
//     path: "/komuna/shkolla/listashkollave",
//     component: ListaShkollave,
//     allowedRoles: ["SuperAdmin", "Admin", "Komunë"]
//   },
//   { 
//     path: "/komuna/shto-shkolle",
//     component: ShtoShkolle,
//     allowedRoles: ["SuperAdmin", "Admin", "Komuna"]
//   },

//   {
//     path: "/komuna/dashboard",
//     component: KomunaDashboard,
//     allowedRoles: ["SuperAdmin", "Admin", "Komunë"],
//   },
//   {
//     path: "/komuna/porosite/lista",
//     component: ListaPorosive,
//     allowedRoles: ["SuperAdmin","Admin", "Komunë"],
//   },
//   {
//     path: "/komuna/porosite/raporte",
//     component: RaportetPorosi,
//     allowedRoles: ["SuperAdmin", "Admin",  "Komunë"],
//   },
//   {
//   path: "/komuna/buxheti/historiku",
//   component: BuxhetiHistoriku,
//   allowedRoles: ["SuperAdmin","Admin", "Komunë"]
//   },

//   { 
//     path: "/komuna/buxheti",
//     component: NdarjaBuxhetit,
//     allowedRoles: ["SuperAdmin","Admin", "Komunë"]
//   },

//   {
//   path: "/komuna/kompanite",
//   component: KomunaListaKompanive,
//   allowedRoles: ["SuperAdmin", "Admin", "Komunë"],
// },


//   // Shkolla
//   {
//     path: "/shkolla/dashboard",
//     component: ShkollaDashboard,
//     allowedRoles: ["SuperAdmin", "Admin", "Shkolla"],
//   },
//   {
//     path: "/shkolla/inventari",
//     component: InventariAktual,
//     allowedRoles: ["SuperAdmin","Admin", "Shkolla"],
//   },
//   {
//     path: "/shkolla/porosite/market",
//     component: Market,
//     allowedRoles: ["SuperAdmin","Admin", "Shkolla"],
//   },
//   {
//     path: "/shkolla/porosite/shporta",
//     component: Shporta,
//     allowedRoles: ["SuperAdmin", "Admin",  "Shkolla"],
//   },
//   {
//     path: "/shkolla/porosite/historiku",
//     component: Historiku,
//     allowedRoles: ["SuperAdmin", "Admin", "Shkolla"],
//   },
//   {
//     path: "/shkolla/stafi/menaxhimi",
//     component: StafiShkolles,
//     allowedRoles: ["SuperAdmin", "Admin",  "Shkollë"],
//   },
//   {
//     path: "/shkolla/stafi/oret-shtese",
//     component: OretShtese,
//     allowedRoles: ["SuperAdmin", "Admin", "Shkollë"],
//   },
//   {
//     path: "/shkolla/stafi/ndalesat",
//     component: Ndalesat,
//     allowedRoles: ["SuperAdmin", "Admin",  "Shkollë"],
//   },

//   // Kompania

//   {
//     path: "/kompania/dashboard",
//     component: KompaniaDashboard,
//     allowedRoles: ["SuperAdmin","Admin", "Kompania"]
//   },
  
//   { path: "/kompania/regjistri", component: RegjistriProdukteve, allowedRoles: ["SuperAdmin", "Admin", "Kompania"], },
//   { path: "/kompania/porosite/lista", component: ListaPorosiveKompani, allowedRoles: ["SuperAdmin", "Admin", "Kompania"],},
//   { path: "/kompania/porosite/raporte", component: RaportiPorosiveKompani, allowedRoles: ["SuperAdmin","Admin", "Kompania"], },

    

//   { path: "*", component: RedirectToLandingPage },
// ];

const routes = [
  { path: "/", component: Home },
  { path: "/signin", component: Login },
  { path: "/register", component: RoleBasedRegister,
    allowedRoles: ["SuperAdmin","admin", "Komunë", "komune"]
  },

  {
    path: "/perdoruesit",
    component: UsersManagement,
    allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/operations",
    component: OperationsList,
    allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/rolePermissions",
    component: RolePermissions,
    allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "Shkolla", "Komunë", "komune"],
  },

  // Komuna
  { 
    path: "/komuna/shkolla/listashkollave",
    component: ListaShkollave,
    allowedRoles: ["SuperAdmin", "Admin", "Komunë", "Komunë", "komune"]
  },
  { 
    path: "/komuna/shto-shkolle",
    component: ShtoShkolle,
    allowedRoles: ["SuperAdmin", "Admin", "Komuna", "Komunë", "komune"]

  },

  {
    path: "/komuna/dashboard",
    component: KomunaDashboard,
    allowedRoles: ["SuperAdmin", "Admin", "Komunë", "Komunë", "komune"],
  },
  {
    path: "/komuna/porosite/lista",
    component: ListaPorosive,
    allowedRoles: ["SuperAdmin","Admin", "Komunë", "Komunë", "komune"],
  },
  {
    path: "/komuna/porosite/raporte",
    component: RaportetPorosi,
    allowedRoles: ["SuperAdmin", "Admin",  "Komunë", "Komunë", "komune"],
  },
  {
  path: "/komuna/buxheti/historiku",
  component: BuxhetiHistoriku,
  allowedRoles: ["SuperAdmin","Admin", "Komunë", "Komunë", "komune"]
  },

  { 
    path: "/komuna/buxheti",
    component: NdarjaBuxhetit,
    allowedRoles: ["SuperAdmin","Admin", "Komunë", "Komunë", "komune"]
  },

  {
  path: "/komuna/kompanite",
  component: KomunaListaKompanive,
  allowedRoles: ["SuperAdmin", "Admin", "Komunë", "Komunë", "komune"],
},


  // Shkolla
  {
    path: "/shkolla/dashboard",
    component: ShkollaDashboard,
    allowedRoles: ["SuperAdmin", "Admin", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/shkolla/inventari",
    component: InventariAktual,
    allowedRoles: ["SuperAdmin","Admin", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/shkolla/porosite/market",
    component: Market,
    allowedRoles: ["SuperAdmin","Admin", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/shkolla/porosite/shporta",
    component: Shporta,
    allowedRoles: ["SuperAdmin", "Admin",  "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/shkolla/porosite/historiku",
    component: Historiku,
    allowedRoles: ["SuperAdmin", "Admin", "Shkolla", "Komunë", "komune"],
  },
  {
    path: "/shkolla/stafi/menaxhimi",
    component: StafiShkolles,
    allowedRoles: ["SuperAdmin", "Admin",  "Shkolla", "Komunë", "komune"],

  },
  {
    path: "/shkolla/stafi/oret-shtese",
    component: OretShtese,
    allowedRoles: ["SuperAdmin", "Admin", "Shkolla", "Komunë", "komune"],

  },
  {
    path: "/shkolla/stafi/ndalesat",
    component: Ndalesat,
    allowedRoles: ["SuperAdmin", "Admin",  "Shkolla", "komuKomunëne", "komune"],

  },

  // Kompania

  {
    path: "/kompania/dashboard",
    component: KompaniaDashboard,
    allowedRoles: ["SuperAdmin","Admin", "Kompania", "Komunë", "komune"]
  },
  
  { path: "/kompania/regjistri", component: RegjistriProdukteve, allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "komune"], },
  { path: "/kompania/porosite/lista", component: ListaPorosiveKompani, allowedRoles: ["SuperAdmin", "Admin", "Kompania", "Komunë", "komune"],},
  { path: "/kompania/porosite/raporte", component: RaportiPorosiveKompani, allowedRoles: ["SuperAdmin","Admin", "Kompania", "Komunë", "komune"], },

  { 
    path: "/komuna/profile", 
    component: UserProfile,
    allowedRoles: ["SuperAdmin", "Admin", "Komunë", "Shkolla", "Kompania"]
  },

  { path: "*", component: RedirectToLandingPage },
];

export default routes;
