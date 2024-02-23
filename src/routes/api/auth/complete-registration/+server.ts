import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import * as db from "$lib/server/db";
import { verifyCredentialRegistration } from "$lib/server/auth/registration";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session?.registrationId == null) {
    error(400, "Something went wrong. Please try again.");
  }

  const registration = await db.getRegistration(session.registrationId);

  if (registration === undefined) {
    error(400, "Something went wrong. Please try again.");
  }

  const challenge = await db.getAndClearChallenge(session.sessionId);

  if (!challenge) {
    error(400, "Something went wrong. Please try again.");
  }

  if (challenge.expires <= new Date()) {
    error(400, "Session timed out. Please try again.");
  }

  const body: RegistrationResponseJSON = await event.request.json();
  const verification = await verifyCredentialRegistration(body, challenge.content);

  if (!verification) {
    error(400, "Invalid passkey");
  }

  if (!verification.verified) {
    error(400, "Invalid passkey");
  }

  if (!verification.registrationInfo) {
    error(400, "Invalid passkey");
  }

  const userToCreate = {
    userHandle: registration.userHandle,
    credential: {
      credentialId: isoBase64URL.fromBuffer(verification.registrationInfo.credentialID),
      publicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      canBeBackedUp: verification.registrationInfo.credentialDeviceType === "multiDevice",
      isBackedUp: verification.registrationInfo.credentialBackedUp,
    }
  }

  const user = await db.createUser(session.sessionId, registration.registrationId, userToCreate);

  if (user === null) {
    error(400, "It wasn't possible to create your account. Please try again.");
  }

  return json({ success: true });
}