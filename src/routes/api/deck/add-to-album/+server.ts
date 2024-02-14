import { error, json, type RequestHandler } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ request, locals }) => {
  const userId = locals.session?.userId ?? null;
  
  if (userId === null) {
    return error(401);
  }

  const data = await request.json();
  const ownedStickerId = data.ownedStickerId;

  if (ownedStickerId == null || typeof ownedStickerId !== "number") {
    return error(400, { message: "ID missing"});
  }

  if (Number.isNaN(ownedStickerId)) {
    return error(400, { message: "ID is not a number"});
  }

  const ownedSticker = await db.getOwnedSticker(ownedStickerId);

  if (ownedSticker == null || ownedSticker.userId !== userId) {
    return error(400, { message: "Invalid ID"});
  }

  const isInAlbum = await db.isInAlbum({ stickerId: ownedSticker.stickerId, userId: ownedSticker.userId });

  if (isInAlbum) {
    return error(400, { message: "Sticker is already in album" });
  }

  await db.addToAlbum(ownedStickerId);

  return json({ message: "success" });
}