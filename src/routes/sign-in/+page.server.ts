import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
  if (event.locals.session?.userId != null) {
    throw redirect(302, "/");
  }
}