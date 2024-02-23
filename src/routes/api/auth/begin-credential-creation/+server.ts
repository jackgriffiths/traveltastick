import { error, json, type RequestHandler } from "@sveltejs/kit";
import { getCredentialRegistrationOptions } from "$lib/server/auth/registration";
import { addMilliseconds } from "$lib/dates";
import * as db from "$lib/server/db";
import { setSessionChallenge } from "$lib/server/sessions";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;
  
  if (!session || session.userId === null) {
    error(401, "Unauthenticated");
  }

  const userHandle = await db.getUserHandle(session.userId);

  if (!userHandle) {
    error(400, "User not found");
  }

  const existingCredentialIds = await db.getCredentialIds(session.userId);

  const body = await event.request.json();
  const userName = body?.userName?.toString() ?? "";
  const registrationOptions = await getCredentialRegistrationOptions(userHandle, userName, existingCredentialIds);

  const now = new Date();
  const challenge = registrationOptions.challenge;
  const challengeExpiresUtc = addMilliseconds(now, registrationOptions.timeout!);

  await setSessionChallenge(session.sessionId, challenge, challengeExpiresUtc);

  return json(registrationOptions);
}