import { asc, eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DB_CONNECTION_STRING } from "$env/static/private";
import * as schema from "$lib/server/db/schema";

const connection = postgres(DB_CONNECTION_STRING);
const db = drizzle(connection, { schema });

export const getStickers = async () => {
  return await db.query.stickers.findMany({
    columns: {
      stickerId: true,
      number: true,
      title: true,
      location: true,
      description: true,
      imageUrl: true,
    },
    orderBy: [asc(schema.stickers.number)]
  });
}

export const getStickersByIds = async (ids: number[]) => {
  return await db.query.stickers.findMany({
    columns: {
      stickerId: true,
      number: true,
      title: true,
      location: true,
      imageUrl: true,
    },
    where: () => inArray(schema.stickers.stickerId, ids),
    orderBy: [asc(schema.stickers.number)]
  });
}

export const getStickerIds = async () => {
  const stickers = await db.query.stickers.findMany({
    columns: {
      stickerId: true,
    }
  });

  return stickers.map(s => s.stickerId);
}

export const getDeck = async (userId: number) => {
  return await db
    .select({
      ownedStickerId: schema.ownedStickers.ownedStickerId,
      stickerId: schema.ownedStickers.stickerId,
      number: schema.stickers.number,
      title: schema.stickers.title,
      location: schema.stickers.location,
      imageUrl: schema.stickers.imageUrl,
    })
    .from(schema.ownedStickers)
    .where(and(eq(schema.ownedStickers.userId, userId), eq(schema.ownedStickers.isInAlbum, false)))
    .orderBy(asc(schema.ownedStickers.ownedStickerId))
    .innerJoin(schema.stickers, eq(schema.ownedStickers.stickerId, schema.stickers.stickerId));
}

export const getOwnedSticker = async (ownedStickerId: number) => {
  const ownedSticker = await db.query.ownedStickers.findFirst({
    columns: {
      stickerId: true,
      userId: true,
    },
    where: () => eq(schema.ownedStickers.ownedStickerId, ownedStickerId),
  });

  return ownedSticker ?? null;
}

export const addToDeck = async (userId: number, stickerIds: number[]) => {
  const toInsert = stickerIds.map(id => ({
    stickerId: id,
    userId: userId,
    isInAlbum: false,
  } as typeof schema.ownedStickers.$inferInsert));

  await db
    .insert(schema.ownedStickers)
    .values(toInsert);
}

export const isInAlbum = async (params: { stickerId: number, userId: number }) => {
  const ownedSticker = await db.query.ownedStickers.findFirst({
    columns: {
      ownedStickerId: true,
    },
    where: () => and(
      eq(schema.ownedStickers.userId, params.userId),
      eq(schema.ownedStickers.stickerId, params.stickerId),
      eq(schema.ownedStickers.isInAlbum, true)
    )
  });

  return ownedSticker != undefined;
}

export const addToAlbum = async (ownedStickerId: number) => {
  await db
    .update(schema.ownedStickers)
    .set({ isInAlbum: true })
    .where(eq(schema.ownedStickers.ownedStickerId, ownedStickerId));
}
