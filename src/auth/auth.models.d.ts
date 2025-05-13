import internal from "stream";

export interface claim {
  name: string;
  value: string;
}

export interface userCredentials {
  email: string;
  password: string;
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
  personalNumber: string;
}

export interface userRegisterCredentialsKompania{
  email: string;
  password: string;
  role: "Kompani";
  EmriKompanis: string;
  Sherbimi:string;
  NrXhirollogaris: number;
  Qyteti: string;
  KompaniaRruga: string;
  personalNumber: string;
}

export type userRegisterCredentials =
  | userRegisterCredentialsKomuna
  | userRegisterCredentialsShkolla;

export interface authenticationResponse {
  token: string;
  expiration: Date;
}
