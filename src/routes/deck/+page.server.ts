import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { userId } from "$lib/server/auth";
import * as db from "$lib/server/db";
import { generatePacket } from "$lib/server/stickers";

export const load: PageServerLoad = async () => {
  return {
    deck: userId == null ? [] : await db.getDeck(userId),
  }
}

export const actions: Actions = {
  openPacket: async () => {
    if (userId == null) {
      return fail(401);
    }

    const packet = await generatePacket();
    await db.addToDeck(userId, packet.map(s => s.stickerId));

    return {
      stickers: packet,
    };
  }
}