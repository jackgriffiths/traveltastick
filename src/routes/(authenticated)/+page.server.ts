import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.session?.userId ?? null;

  if (userId === null) {
    throw redirect(302, "/sign-in");
  }

  const stickers = await db.getStickers();
  const stickersInAlbum = await db.getStickersInAlbum(userId);

  return {
    stickers: stickers,
    stickersInAlbum: stickersInAlbum,
  }
}