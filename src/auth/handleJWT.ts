import { authenticationResponse, claim } from "./auth.models";

//i ruajme tokenat ne local storage
const tokenKey = "token";
const expirationKey = "token-expiration";
const role = "roleOfUser";
const email = "emailOfUser";

function base64UrlDecode(base64UrlString: string): string {
  let base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  try {
    // Convert Base64 -> binary string -> UTF-8 string
    const binaryString = atob(base64);
    const utf8Decoder = new TextDecoder("utf-8");
    const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    return utf8Decoder.decode(bytes);
  } catch (e) {
    console.error("Invalid Base64 string:", base64UrlString);
    throw e;
  }
}


export function saveToken(authData: authenticationResponse) {
  localStorage.setItem(tokenKey, authData.token);
  localStorage.setItem(expirationKey, authData.expiration.toString());
}

export function getClaims(): claim[] {
  const token = localStorage.getItem(tokenKey);

  if (!token) {
    return [];
  }

  const expiration = localStorage.getItem(expirationKey)!;
  const expirationDate = new Date(expiration);

  if (expirationDate <= new Date()) {
    logout();
    return []; //the token has expired
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    console.error("Invalid JWT format");
    return [];
  }

  const payload = parts[1];
  const decodedPayload = JSON.parse(base64UrlDecode(payload));

  const response: claim[] = [];

  for (const key in decodedPayload) {
    response.push({ name: key, value: decodedPayload[key] });
  }

  console.log("RESPONSIII");
  console.log(response);
  console.log("Decoded payload:", decodedPayload);

  const roleClaim = response.find((c) => c.name === "role")?.value || "";
  const emailClaim = response.find((c) => c.name === "email")?.value || "";

  localStorage.setItem(role, roleClaim.toString());
  localStorage.setItem(email, emailClaim.toString());
  console.log("User role:", roleClaim);
  console.log("Role from session: ", localStorage.getItem(role));

  return response;
}

export function logout(update?: (claims: claim[]) => void) {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(expirationKey);
  localStorage.removeItem(role);
  localStorage.removeItem(email);
  if (update) update([]);
  console.log("Roli pas daljes", localStorage.getItem(role));
  console.log("tokeni pas daljes", localStorage.getItem(tokenKey));
  console.log("emaili pas daljes", localStorage.getItem(email));
}

export function getToken() {
  return localStorage.getItem(tokenKey);
}

// export function getClaims(): claim[] {
//     const token = localStorage.getItem("token");
//     if (!token) return [];

//     const payload = token.split(".")[1];
//     const decodedPayload = JSON.parse(atob(payload));
//     const claims: claim[] = [];

//     for (const key in decodedPayload) {
//       claims.push({ name: key, value: decodedPayload[key] });
//     }

//     return claims;
//   }

// const claims = getClaims();
// const roleClaim = claims.find(c => c.name === "role")?.value;
// console.log("User role:", roleClaim);
