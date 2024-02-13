import type { Handle } from "@sveltejs/kit";
import { getSession } from "$lib/server/sessions";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = await getSession(event.cookies);
  return resolve(event);
}