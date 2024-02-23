import { endSession } from "$lib/server/sessions";
import type { PageServerLoad } from "./$types";
import { redirect, type Actions } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const session = event.locals.session;

  if (session === null || session.userId === null) {
    throw redirect(302, "/login");
  }

  const credentials = await db.getCredentialDetails(session.userId);
  const currentCredentialId = await db.getSessionCredential(session.sessionId);

  return {
    userId: session.userId,
    credentials: credentials,
    currentCredentialId: currentCredentialId,
  }
}

export const actions: Actions = {
  logout: async (event) => {
    if (event.locals.session) {
      await endSession(event.cookies, event.locals.session.sessionId);
      throw redirect(302, "/login");
    }
  }
}