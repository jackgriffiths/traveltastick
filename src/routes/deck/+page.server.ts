import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { userId } from "$lib/server/auth";
import * as db from "$lib/server/db";
import { generatePacket, getPacketTimes } from "$lib/server/stickers";
import { getTimeUntil } from "$lib/server/dates";

export const load: PageServerLoad = async () => {
  if (userId === null){
    return {
      deck: [],
      canOpenPacket: false,
      nextPacket: ""
    }
  }

  const now = new Date();
  const packetTimes = getPacketTimes(now);

  const lastOpened = await db.getLastPacketDateTime(userId);
  const canOpenPacket = lastOpened === null || lastOpened.getTime() < packetTimes.current.getTime();

  return {
    deck: await db.getDeck(userId),
    canOpenPacket: canOpenPacket,
    nextPacket: getTimeUntilPacket(now, packetTimes.next),
  }
}

export const actions: Actions = {
  openPacket: async () => {
    if (userId == null) {
      return fail(401, {
        success: false,
        message: "Unauthenticated"
      });
    }

    const now = new Date();
    const packetTimes = getPacketTimes(now);

    const lastOpened = await db.getLastPacketDateTime(userId);
    const canOpenPacket = lastOpened === null || lastOpened.getTime() < packetTimes.current.getTime();

    if (!canOpenPacket) {
      return fail(400, {
        success: false,
        message: "No packet available to open"
      })
    }

    const packet = await generatePacket();
    await db.addPacketToDeck(userId, packet.map(s => s.stickerId), now);

    return {
      success: true,
      stickers: packet,
    };
  }
}

const getTimeUntilPacket = (now: Date, next: Date) => {
  const timeUntil = getTimeUntil(now, next);

  const h = timeUntil.hours;
  const hFormatted = `${h} ${h === 1 ? "hour" : "hours"}`;
  
  const m = timeUntil.minutes;
  const mFormatted = `${m} ${m === 1 ? "minute" : "minutes"}`;
  
  const s = timeUntil.seconds
  const sFormatted = `${s} ${s === 1 ? "second" : "seconds"}`;

  if (h === 0 && m === 0) {
    return sFormatted;
  }

  if (h === 0) {
    return `${mFormatted} and ${sFormatted}`;
  }

  return `${hFormatted} and ${mFormatted}`;
}