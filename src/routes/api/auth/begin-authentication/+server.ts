import { error, json, type RequestHandler } from "@sveltejs/kit";
import { getAuthenticationOptions } from "$lib/server/auth/authentication";
import { addMilliseconds } from "$lib/dates";
import { setSessionChallenge, startAuthenticationSession } from "$lib/server/sessions";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session && session.userId !== null) {
    // User is already registered and should not be calling this endpoint.
    error(400, "Already authenticated");
  }

  const authenticationOptions = await getAuthenticationOptions();

  const now = new Date();
  const challenge = authenticationOptions.challenge;
  const challengeExpiresUtc = addMilliseconds(now, authenticationOptions.timeout!);

  if (session === null) {
    await startAuthenticationSession(event.cookies, challenge, challengeExpiresUtc);
  } else {
    await setSessionChallenge(session.sessionId, challenge, challengeExpiresUtc);
  }

  return json(authenticationOptions);
}