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
    return error(400, "ID missing");
  }

  if (Number.isNaN(ownedStickerId)) {
    return error(400, "ID is not a number");
  }

  const ownedSticker = await db.getOwnedSticker(ownedStickerId);

  if (ownedSticker == null || ownedSticker.userId !== userId) {
    return error(400, "Invalid ID");
  }

  if (ownedSticker.isInAlbum) {
    return error(400, "Sticker is in album");
  }

  await db.discard(ownedStickerId);

  return json({ success: true });
}