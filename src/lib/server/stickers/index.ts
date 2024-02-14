import * as db from '$lib/server/db';
import { addHours } from '$lib/server/dates';

const stickersPerPacket = 2;
const packetHour = 18;

let sampler: null | (() => number) = null;

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
  if (sampler === null) {
    sampler = await createStickerSampler();
  }

  const packetStickersIds = new Set<number>();

  while (packetStickersIds.size < stickersPerPacket) {
    const stickerId = sampler();
    if (!packetStickersIds.has(stickerId)) {
      packetStickersIds.add(stickerId);
    }
  }

  return await db.getStickersByIds(Array.from(packetStickersIds));
}

const createStickerSampler = async () => {
  // Shiny stickers are twice as rare as regular stickers.
  const stickers = (await db.getStickersForSampling())
    .map(s => ({
      stickerId: s.stickerId,
      weight: s.isShiny ? 1 : 2,
    }));

  const cumulativeWeights: number[] = [];
  let cumulativeWeight = 0;

  for (const sticker of stickers) {
    cumulativeWeight += sticker.weight;
    cumulativeWeights.push(cumulativeWeight);
  }

  const sample = () => {
    const randomValue = Math.floor(Math.random() * cumulativeWeight);
    const index = cumulativeWeights.findIndex(weight => weight > randomValue);
    return stickers[index].stickerId;
  }

  return sample;
}