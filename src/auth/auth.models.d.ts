import { StringLiteral } from "typescript";

export interface claim {
  name: string;
  value: string;
}

export interface userCredentials {
  username: string;
  password: string;
}

export interface authenticationResponse{
  token: string;
  expiration: Date;
}