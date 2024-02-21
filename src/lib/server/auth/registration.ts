import { randomBytes } from "crypto";
import { generateRegistrationOptions, verifyRegistrationResponse, type GenerateRegistrationOptionsOpts, type VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import * as auth from "$lib/server/auth";
import * as db from "$lib/server/db";

const generateUserHandle = () => {
  return randomBytes(32).toString("base64url");
}

export const getOrCreateAccountRegistration = async (registrationId: number | null) => {
  if (registrationId !== null) {
    return (await db.getRegistration(registrationId))!;
  }

  const userHandle = generateUserHandle();
  registrationId = await db.createRegistration(userHandle);

  return {
    registrationId: registrationId,
    userHandle: userHandle,
  }
}

export const getCredentialRegistrationOptions = async (userHandle: string, userName: string, excludeCredentialIds?: Uint8Array[]) => {
  const options: GenerateRegistrationOptionsOpts = {
    rpID: auth.rpId,
    rpName: auth.rpName,
    userID: userHandle,
    userName: userName,
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: auth.supportedAlgorithmIds,
    timeout: auth.timeoutMilliseconds,
    excludeCredentials: excludeCredentialIds?.map(id => ({
      id: id,
      type: "public-key",
    })),
  };

  return await generateRegistrationOptions(options);
}

export const verifyCredentialRegistration = async (registration: RegistrationResponseJSON, expectedChallenge: string) => {
  try {
    const options: VerifyRegistrationResponseOpts = {
      response: registration,
      expectedRPID: auth.rpId,
      expectedOrigin: auth.rpOrigin,
      expectedChallenge: expectedChallenge,
      requireUserVerification: false,
      supportedAlgorithmIDs: auth.supportedAlgorithmIds,
    };

    return await verifyRegistrationResponse(options);
  } catch (err) {
    console.error(err);
    return null;
  }
}
