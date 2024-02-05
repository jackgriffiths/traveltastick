import type { PageServerLoad } from "./$types";
import * as db from "$lib/server/db";

export const load: PageServerLoad = async () => {
    return {
        stickers: await db.getStickers(),
    }
}