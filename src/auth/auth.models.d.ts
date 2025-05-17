
export interface claim {
  name: string;
  value: string;
}

export interface userCredentials {
  email: string;
  password: string;
}

export interface userRegisterCredentialsAdmin {
  email: string;
  password: string;
  role: "Admin";
}

export interface userRegisterCredentialsKomuna {
  email: string;
  password: string;
  role: "Komunë";
  qyteti: string;
  nrPopullsis?: number | null;
  buxhetiAktual?: number | null;
  ditaNdarjesAuto?: boolean;
}

export interface userRegisterCredentialsShkolla {
  email: string;
  password: string;
  role: "Shkollë";
  EmriShkolles: string;
  komunaId: string;
  ShkollaRruga: string;
  DrejtoriNumriPersonal: number;
}

export interface userRegisterCredentialsKompania {
  email: string;
  password: string;
  role: "Kompani";
  EmriKompanis: string;
  Sherbimi: string;
  NrXhirologaris: number;
  Qyteti: string;
  KompaniaRruga: string;
  PronariNumriPersonal: number; 
  // KodiPostal?: string; // optional if you want
}

export type userRegisterCredentials =
  | userRegisterCredentialsKomuna
  | userRegisterCredentialsShkolla
  | userRegisterCredentialsAdmin;

export interface authenticationResponse {
  token: string;
  expiration: Date;
}
