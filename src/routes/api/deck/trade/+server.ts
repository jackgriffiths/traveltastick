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
    return error(400, "ID missing");
  }

  if (Number.isNaN(ownedStickerId)) {
    return error(400, "ID is not a number");
  }

  if (recipientUserId == null || typeof recipientUserId !== "number") {
    return error(400, "Recipient User ID missing");
  }

  if (Number.isNaN(recipientUserId)) {
    return error(400, "Recipient User ID is not a number");
  }

  const ownedSticker = await db.getOwnedSticker(ownedStickerId);

  if (ownedSticker == null || ownedSticker.userId !== userId) {
    return error(400, "Invalid ID");
  }

  if (ownedSticker.isInAlbum) {
    return error(400, "This sticker is in your album and cannot be traded.");
  }

  if (userId === recipientUserId) {
    return error(400, "Cannot send sticker to yourself.");
  }

  if (!await db.isValidUserId(recipientUserId)) {
    return error(400, "User ID not recognised. Please confirm with your friend what their ID is.");
  }

  await db.transfer(ownedStickerId, recipientUserId);

  return json({ success: true });
}