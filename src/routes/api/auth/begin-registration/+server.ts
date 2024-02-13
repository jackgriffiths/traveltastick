
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { addMilliseconds } from "$lib/server/dates";
import { getOrCreateRegistration, getRegistrationOptions } from "$lib/server/auth/registration";
import { setSessionChallenge, startRegistrationSession } from "$lib/server/sessions";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;
  
  if (session && session.userId !== null) {
    // User is already registered and should not be calling this endpoint.
    error(400);
  }

  const registration = await getOrCreateRegistration(session?.registrationId ?? null);

  const body = await event.request.json();
  const userName = (body.userName as string | undefined) ?? "";
  const registrationOptions = await getRegistrationOptions(registration.userHandle, userName);

  const now = new Date();
  const challenge = registrationOptions.challenge;
  const challengeExpiresUtc = addMilliseconds(now, registrationOptions.timeout!);

  if (session === null || session.registrationId !== registration.registrationId) {
    await startRegistrationSession(event.cookies, registration.registrationId, challenge, challengeExpiresUtc);
  } else {
    await setSessionChallenge(session.sessionId, challenge, challengeExpiresUtc);
  }

  return json(registrationOptions);
}
