import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { verifyAuthentication } from "$lib/server/auth/authentication";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session === null) {
    error(400, "Something went wrong. Please try again.");
  }

  const challenge = await db.getAndClearChallenge(session.sessionId);

  if (!challenge) {
    error(400, "Something went wrong. Please try again.");
  }

  if (challenge.expires <= new Date()) {
    error(400, "Session timed out. Please try again.");
  }

  const body: AuthenticationResponseJSON = await event.request.json();
  const verification = await verifyAuthentication(body, challenge.content);

  if (!verification || !verification.result) {
    error(400, "Passkey not recognised. Please try another one.");
  }

  if (!verification.result.verified) {
    error(400, "Passkey not recognised. Please try another one.");
  }

  const authenticator = verification.result.authenticationInfo;

  const credential = {
    credentialId: isoBase64URL.fromBuffer(authenticator.credentialID),
    counter: authenticator.newCounter,
    canBeBackedUp: authenticator.credentialDeviceType === "multiDevice",
    isBackedUp: authenticator.credentialBackedUp,
  }

  await db.saveUserAuthentication(session.sessionId, verification.userId, credential);

  return json({ success: true });
}