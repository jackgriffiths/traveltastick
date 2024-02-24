import { error, json, type RequestHandler } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async (event) => {
  const session = event.locals.session;

  if (session == null || session.userId == null) {
    error(401, "Unauthenticated");
  }

  const data = await event.request.json();
  const credentialId: string = data?.credentialId?.toString();

  if (!credentialId) {
    error(400, "Credential ID missing");
  }

  const credentialUserId = await db.getUserFromCredential(credentialId);

  if (credentialUserId !== session.userId) {
    error(400, "Invalid credential ID");
  }

  const sessionCredentialId = await db.getSessionCredential(session.sessionId);

  if (credentialId === sessionCredentialId) {
    // Users cannot delete the credential that they are using because we can't be sure
    // that they still have access to an alternative credential to sign in with in the
    // future.
    error(400, "Before you can delete this passkey, you need to sign in with a different passkey.");
  }

  await db.deleteCredential(credentialId);

  return json({ success: true });
}