import * as db from '$lib/server/db';
import { addHours } from '$lib/server/dates';

const stickersPerPacket = 2;
const packetHour = 18;

export const getPacketTimes = (now: Date) => {
  // Find the last time a packet was available.
  let current = new Date(now.getTime());
  current.setUTCHours(packetHour, 0, 0, 0);

  if (current.getTime() > now.getTime()) {
    current = addHours(current, -24);
  }

  // Packets are available every 24 hours.
  const next = addHours(current, 24);

  return {
    current: current,
    next: next,
  }
}

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