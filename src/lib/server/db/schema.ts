import { boolean, customType, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return "bytea";
  },
});

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

export const credentials = pgTable("credentials", {
  credentialId: text("credential_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.userId),
  publicKey: bytea("public_key").notNull(),
  counter: integer("counter").notNull(),
  createdUtc: timestamp("created_utc").notNull(),
  lastUsedUtc: timestamp("last_used_utc").notNull(),
  canBeBackedUp: boolean("can_be_backed_up").notNull(),
  isBackedUp: boolean("is_backed_up").notNull(),
});

export const sessions = pgTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.registrationId),
  userId: integer("user_id").references(() => users.userId),
  credentialId: text("credential_id").references(() => credentials.credentialId),
  createdUtc: timestamp("created_utc").notNull(),
  expiresUtc: timestamp("expires_utc").notNull(),
  challenge: text("challenge"),
  challengeExpiresUtc: timestamp("challenge_expires_utc"),
});

export const stickers = pgTable("stickers", {
  stickerId: serial("sticker_id").primaryKey(),
  number: integer("number").notNull().unique(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  isShiny: boolean("is_shiny").notNull(),
});

export const ownedStickers = pgTable("owned_stickers", {
  ownedStickerId: serial("owned_sticker_id").primaryKey(),
  stickerId: integer("sticker_id").notNull().references(() => stickers.stickerId),
  userId: integer("user_id").notNull().references(() => users.userId),
  receivedUtc: timestamp("received_utc").notNull(),
  isInAlbum: boolean("is_in_album").notNull(),
});
