import { error, json, type RequestHandler } from "@sveltejs/kit";
import * as db from "$lib/server/db";

export const POST: RequestHandler = async ({ request, locals }) => {
  const userId = locals.session?.userId ?? null;
  
  if (userId === null) {
    return error(401);
  }

  const data = await request.json();
  const ownedStickerId = data.ownedStickerId;
  const recipientUserId = data.recipientUserId;

  if (ownedStickerId == null || typeof ownedStickerId !== "number") {
    return error(400, { message: "ID missing"});
  }

  if (Number.isNaN(ownedStickerId)) {
    return error(400, { message: "ID is not a number"});
  }

  if (recipientUserId == null || typeof recipientUserId !== "number") {
    return error(400, { message: "Recipient User ID missing"});
  }

  if (Number.isNaN(recipientUserId)) {
    return error(400, { message: "Recipient User ID is not a number"});
  }

  const ownedSticker = await db.getOwnedSticker(ownedStickerId);

  if (ownedSticker == null || ownedSticker.userId !== userId) {
    return error(400, { message: "Invalid ID"});
  }

  if (ownedSticker.isInAlbum) {
    return error(400, { message: "Sticker is in album" });
  }

  if (userId === recipientUserId) {
    return error(400, { message: "Sticker already belongs to user"});
  }

  if (!await db.isValidUserId(recipientUserId)) {
    return error(400, { message: "Could not send sticker to user" });
  }

  await db.transfer(ownedStickerId, recipientUserId);

  return json({ message: "success" });
}