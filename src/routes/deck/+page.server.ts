import type { PageServerLoad } from "./$types";
import { userId } from "$lib/server/auth";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async () => {
  return {
    deck: await db.getDeck(userId),
  }
}