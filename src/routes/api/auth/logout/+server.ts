import { redirect, type RequestHandler } from "@sveltejs/kit";
import { endSession } from "$lib/server/sessions";

export const POST: RequestHandler = async (event) => {
  if (event.locals.session) {
    await endSession(event.cookies, event.locals.session.sessionId);
  }

  throw redirect(302, "/login");
}