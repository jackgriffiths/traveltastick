import { endSession } from "$lib/server/sessions";
import type { PageServerLoad } from "./$types";
import { redirect, type Actions } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.session?.userId ?? null;

  if (userId === null) {
    throw redirect(302, "/login");
  }

  const credentials = await db.getCredentialDetails(userId);

  return {
    userId: userId,
    credentials: credentials,
  }
}

export const actions: Actions = {
  logout: (event) => {
    if (event.locals.session) {
      endSession(event.cookies, event.locals.session.sessionId);
      throw redirect(302, "/login");
    }
  }
}