import { asc, eq, and } from "drizzle-orm";
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