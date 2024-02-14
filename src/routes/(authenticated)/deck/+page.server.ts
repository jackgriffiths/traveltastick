import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import * as db from "$lib/server/db";
import { generatePacket, getPacketTimes } from "$lib/server/stickers";

export const load: PageServerLoad = async (event) => {
  const userId = event.locals.session?.userId ?? null;

  if (userId === null) {
    throw redirect(302, "/login");
  }

  const now = new Date();
  const packetTimes = getPacketTimes(now);

  const lastOpened = await db.getLastPacketDateTime(userId);
  const canOpenPacket = lastOpened === null || lastOpened.getTime() < packetTimes.current.getTime();

  return {
    deck: await db.getDeck(userId),
    canOpenPacket: canOpenPacket,
    nextPacket: packetTimes.next,
  }
}

export const actions: Actions = {
  openPacket: async (event) => {
    const userId = event.locals.session?.userId ?? null;

    if (userId === null) {
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