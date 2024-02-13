import { endSession } from "$lib/server/sessions";
import type { PageServerLoad } from "./$types";
import { redirect, type Actions } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.session?.userId ?? null;

  if (userId === null) {
    throw redirect(302, "/login");
  }

  return {
    userId: userId,
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