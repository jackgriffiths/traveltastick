import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import * as db from "$lib/server/db";
import { verifyCredentialRegistration } from "$lib/server/auth/registration";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session?.registrationId == null) {
    error(400);
  }

  const registration = await db.getRegistration(session.registrationId);

  if (registration === undefined) {
    error(400);
  }

  const challenge = await db.getAndClearChallenge(session.sessionId);

  if (!challenge) {
    error(400);
  }

  if (challenge.expires <= new Date()) {
    error(400);
  }

  const body: RegistrationResponseJSON | undefined = await event.request.json();

  if (body === undefined) {
    error(400);
  }

  const verification = await verifyCredentialRegistration(body, challenge.content);

  if (!verification) {
    error(400);
  }

  if (!verification.verified) {
    error(400);
  }

  if (!verification.registrationInfo) {
    error(400);
  }

  const userToCreate = {
    userHandle: registration.userHandle,
    credential: {
      credentialId: verification.registrationInfo.credentialID,
      publicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.counter,
      canBeBackedUp: verification.registrationInfo.credentialDeviceType === "multiDevice",
      isBackedUp: verification.registrationInfo.credentialBackedUp,
    }
  }

  const user = await db.createUser(session.sessionId, registration.registrationId, userToCreate);

  if (user === null) {
    error(400);
  }

  return json({ success: true });
}