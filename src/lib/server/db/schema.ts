import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
    userId: serial("user_id").primaryKey(),
    lastPacketUtc: timestamp("last_packet_utc"),
});

export const stickers = pgTable("stickers", {
    stickerId: serial("sticker_id").primaryKey(),
    number: integer("number").notNull().unique(),
    title: text("title").notNull(),
    location: text("location").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url").notNull(),
})

export const ownedStickers = pgTable("owned_stickers", {
    ownedStickerId: serial("owned_sticker_id").primaryKey(),
    stickerId: integer("sticker_id").notNull().references(() => stickers.stickerId),
    userId: integer("user_id").notNull().references(() => users.userId),
    isInAlbum: boolean("is_in_album").notNull(),
});
