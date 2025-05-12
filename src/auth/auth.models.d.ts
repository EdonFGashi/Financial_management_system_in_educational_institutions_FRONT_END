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
  role: "Shkolla";
  shkollaName: string;
  komunaId: string;
  shkollaStreet: string;
  drejtori: {
    personalNumber: string;
    name: string;
    surname: string;
    street: string;
  };
}

export type userRegisterCredentials =
  | userRegisterCredentialsKomuna
  | userRegisterCredentialsShkolla;

export interface authenticationResponse {
  token: string;
  expiration: Date;
}
