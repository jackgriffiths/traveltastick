import { randomBytes } from "crypto";
import { generateRegistrationOptions, verifyRegistrationResponse, type GenerateRegistrationOptionsOpts, type VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import * as auth from "$lib/server/auth";
import * as db from "$lib/server/db";

const generateUserHandle = () => {
  return randomBytes(32).toString("base64url");
}

export const getOrCreateRegistration = async (registrationId: number | null) => {
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

export const getRegistrationOptions = async (userHandle: string, userName: string) => {
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
  };

  return await generateRegistrationOptions(options);
}

export const verifyRegistration = async (registration: RegistrationResponseJSON, expectedChallenge: string) => {
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
