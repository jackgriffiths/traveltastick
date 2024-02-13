import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const registrations = pgTable("registrations", {
  registrationId: serial("registration_id").primaryKey(),
  userHandle: text("user_handle").notNull(),
});

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  userHandle: text("user_handle").notNull(),
  registeredUtc: timestamp("registered_utc").notNull(),
  lastPacketUtc: timestamp("last_packet_utc"),
});

export const sessions = pgTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.registrationId),
  userId: integer("user_id").references(() => users.userId),
  createdUtc: timestamp("created_utc").notNull(),
  expiresUtc: timestamp("expires_utc").notNull(),
  challenge: text("challenge"),
  challengeExpiresUtc: timestamp("challenge_expires_utc"),
});

export const credentials = pgTable("credentials", {
  credentialId: text("credential_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.userId),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull(),
});

export const stickers = pgTable("stickers", {
  stickerId: serial("sticker_id").primaryKey(),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const ownedStickers = pgTable("owned_stickers", {
  ownedStickerId: serial("owned_sticker_id").primaryKey(),
  stickerId: integer("sticker_id").notNull().references(() => stickers.stickerId),
  userId: integer("user_id").notNull().references(() => users.userId),
  isInAlbum: boolean("is_in_album").notNull(),
});
