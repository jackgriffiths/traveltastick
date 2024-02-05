import { asc } from "drizzle-orm";
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