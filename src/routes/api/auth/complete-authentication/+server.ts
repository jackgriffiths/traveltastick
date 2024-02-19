import { error, json, type RequestHandler } from "@sveltejs/kit";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { verifyAuthentication } from "$lib/server/auth/authentication";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session === null) {
    error(400);
  }

  const challenge = await db.getAndClearChallenge(session.sessionId);

  if (!challenge) {
    error(400);
  }

  if (challenge.expires <= new Date()) {
    error(400);
  }

  const body: AuthenticationResponseJSON | undefined = await event.request.json();

  if (body === undefined) {
    error(400);
  }

  const verification = await verifyAuthentication(body, challenge.content);

  if (!verification || !verification.result) {
    error(400, { message: "Passkey not recognised. Please try another one."});
  }

  if (!verification.result.verified) {
    error(400, { message: "Passkey not recognised. Please try another one."});
  }

  const authenticator = verification.result.authenticationInfo;

  const credential = {
    credentialId: authenticator.credentialID,
    counter: authenticator.newCounter,
    canBeBackedUp: authenticator.credentialDeviceType === "multiDevice",
    isBackedUp: authenticator.credentialBackedUp,
  }

  await db.saveUserAuthentication(session.sessionId, verification.userId, credential);

  return json({ success: true });
}