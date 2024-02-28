import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.session?.userId ?? null;

  if (userId === null) {
    // This prevents a bug where: the user is redirected
    // to sign in, they then sign in, the site navigates
    // to the home page, then they duplicate the tab,
    // and the new tab displays the sign in page instead,
    // even though the user has a session cookie for an
    // authenticated user. This issue of being taken back
    // to the sign-in page was also noticed on an Android
    // phone, simply when reselecting the tab. In the case
    // of the duplicate tab, the server is not hit so the
    // browsers seem to be caching the original root (/)
    // request, which redirects to /sign-in, and just
    // displaying that cached HTML. More investigation is
    // necessary to determine the best resolution for this
    // issue.
    event.setHeaders({ "Cache-Control": "no-store" });
    throw redirect(302, "/sign-in");
  }

  const stickers = await db.getStickers();
  const stickersInAlbum = await db.getStickersInAlbum(userId);

  return {
    stickers: stickers,
    stickersInAlbum: stickersInAlbum,
  }
}