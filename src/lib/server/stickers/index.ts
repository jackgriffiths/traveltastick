import * as db from '$lib/server/db';

const stickersPerPacket = 2;

export const generatePacket = async () => {
  // Not worried about performance at this point because
  // this method will be replaced with one that samples
  // the stickers using some sort of distribution.

  const allStickerIds = await db.getStickerIds();
  const packetStickersIds = new Set<number>();

  while (packetStickersIds.size < stickersPerPacket) {
    const randomIndex = Math.floor(Math.random() * allStickerIds.length);
    const randomStickerId = allStickerIds[randomIndex];

    if (!packetStickersIds.has(randomStickerId)) {
      packetStickersIds.add(randomStickerId);
    }
  }

  return await db.getStickersByIds(Array.from(packetStickersIds));
}