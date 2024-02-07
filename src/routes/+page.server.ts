import type { PageServerLoad } from "./$types";
import { userId } from "$lib/server/auth";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async () => {
    const stickers = userId === null ? [] : await db.getStickers();
    const stickersInAlbum = userId === null ? [] : await db.getStickersInAlbum(userId);

    return {
        stickers: stickers,
        stickersInAlbum: stickersInAlbum,
    }
}