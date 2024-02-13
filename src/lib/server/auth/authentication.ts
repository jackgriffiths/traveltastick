import { generateAuthenticationOptions, verifyAuthenticationResponse, type GenerateAuthenticationOptionsOpts, type VerifyAuthenticationResponseOpts } from "@simplewebauthn/server"
import * as auth from "$lib/server/auth";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import * as db from "$lib/server/db";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";

export const getAuthenticationOptions = async () => {
  const options: GenerateAuthenticationOptionsOpts = {
    rpID: auth.rpId,
    userVerification: "preferred",
    timeout: auth.timeoutMilliseconds,
  };

  return await generateAuthenticationOptions(options);
}

export const verifyAuthentication = async (authentication: AuthenticationResponseJSON, expectedChallenge: string) => {
  try {
    const credentialId = isoBase64URL.toBuffer(authentication.id);
    const credential = await db.getCredential(credentialId);
  
    if (!credential) {
      return null;
    }

    const options: VerifyAuthenticationResponseOpts = {
      response: authentication,
      expectedRPID: auth.rpId,
      expectedOrigin: auth.rpOrigin,
      expectedChallenge: expectedChallenge,
      requireUserVerification: false,
      authenticator: {
        credentialID: credentialId,
        credentialPublicKey: isoUint8Array.fromHex(credential.publicKey),
        counter: credential.counter,
      }
    };
  
    const verification = await verifyAuthenticationResponse(options);

    return {
      result: verification,
      userId: credential.userId,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}