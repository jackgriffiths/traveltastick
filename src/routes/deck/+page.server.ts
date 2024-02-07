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
  addToAlbum: async (event) => {
    if (userId == null) {
      return fail(401);
    }

    const formData = await event.request.formData();
    const ownedStickerIdRaw = formData.get("ownedStickerId");

    if (ownedStickerIdRaw == null || typeof ownedStickerIdRaw !== "string") {
      return fail(400, { error: "ID missing"});
    }

    const ownedStickerId = Number.parseInt(ownedStickerIdRaw);
    if (Number.isNaN(ownedStickerId)) {
      return fail(400, { error: "ID is not a number"});
    }

    const ownedSticker = await db.getOwnedSticker(ownedStickerId);

    if (ownedSticker == null || ownedSticker.userId !== userId) {
      return fail(400, { error: "Invalid ID"});
    }

    const isInAlbum = await db.isInAlbum({ stickerId: ownedSticker.stickerId, userId: ownedSticker.userId });

    if (isInAlbum) {
      return fail(400, { error: "Sticker is already in album" });
    }

    await db.addToAlbum(ownedStickerId);
  },
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