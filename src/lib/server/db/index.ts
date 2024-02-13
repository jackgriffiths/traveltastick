import { asc, eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DB_CONNECTION_STRING } from "$env/static/private";
import * as schema from "$lib/server/db/schema";

const connection = postgres(DB_CONNECTION_STRING);
const db = drizzle(connection, { schema });

export const createRegistration = async (userHandle: string) => {
  const rows = await db
    .insert(schema.registrations)
    .values({
      userHandle: userHandle,
    })
    .returning({
      registrationId: schema.registrations.registrationId,
    });

  return rows[0].registrationId;
}

export const getRegistration = async (registrationId: number) => {
  return await db.query.registrations.findFirst({
    columns: {
      registrationId: true,
      userHandle: true,
    },
    where: () => eq(schema.registrations.registrationId, registrationId),
  });
}

export const createRegistrationSession = async (params: { sessionId: string, registrationId: number, createdUtc: Date, expiresUtc: Date, challenge: string, challengeExpiresUtc: Date }) => {
  const rows = await db
    .insert(schema.sessions)
    .values({
      sessionId: params.sessionId,
      registrationId: params.registrationId,
      createdUtc: params.createdUtc,
      expiresUtc: params.expiresUtc,
      challenge: params.challenge,
      challengeExpiresUtc: params.challengeExpiresUtc,
    })
    .returning({
      sessionId: schema.sessions.sessionId,
    });

  return rows[0].sessionId;
}

export const createAuthenticationSession = async (params: { sessionId: string, createdUtc: Date, expiresUtc: Date, challenge: string, challengeExpiresUtc: Date }) => {
  const rows = await db
    .insert(schema.sessions)
    .values({
      sessionId: params.sessionId,
      createdUtc: params.createdUtc,
      expiresUtc: params.expiresUtc,
      challenge: params.challenge,
      challengeExpiresUtc: params.challengeExpiresUtc,
    })
    .returning({
      sessionId: schema.sessions.sessionId,
    });

  return rows[0].sessionId;
}

export const getSession = async (sessionId: string) => {
  return await db.query.sessions.findFirst({
    columns: {
      sessionId: true,
      registrationId: true,
      userId: true,
      expiresUtc: true,
    },
    where: () => eq(schema.sessions.sessionId, sessionId),
  });
}

export const deleteSession = async (sessionId: string) => {
  await db
    .delete(schema.sessions)
    .where(eq(schema.sessions.sessionId, sessionId));
}

export const getAndClearChallenge = async (sessionId: string) => {
  const challenge = await db.query.sessions.findFirst({
    columns: {
      challenge: true,
      challengeExpiresUtc: true,
    },
    where: () => eq(schema.sessions.sessionId, sessionId),
  });

  if (challenge?.challenge) {
    await db
      .update(schema.sessions)
      .set({
        challenge: null,
        challengeExpiresUtc: null,
      })
      .where(eq(schema.sessions.sessionId, sessionId));

    return {
      content: challenge.challenge,
      expires: challenge.challengeExpiresUtc!,
    }
  } else {
    return null;
  }
}

export const updateChallenge = async (sessionId: string, challenge: string, expiresUtc: Date) => {
  await db
    .update(schema.sessions)
    .set({
      challenge: challenge,
      challengeExpiresUtc: expiresUtc,
    })
    .where(eq(schema.sessions.sessionId, sessionId));
}

export const createUser = async (sessionId: string, registrationId: number, userToCreate: { userHandle: string, credential: { credentialId: Uint8Array, publicKey: Uint8Array, counter: number }}) => {
  return await db.transaction(async (tx) => {

    // Create the user.
    const users = await tx
      .insert(schema.users)
      .values({
        userHandle: userToCreate.userHandle,
        registeredUtc: new Date(),
      })
      .returning({
        userId: schema.users.userId,
      });
    const user = users[0];

    // Save the credentials.
    await tx
      .insert(schema.credentials)
      .values({
        credentialId: toHex(userToCreate.credential.credentialId),
        publicKey: toHex(userToCreate.credential.publicKey),
        userId: user.userId,
        counter: userToCreate.credential.counter,
      });

    // Link the session to the user instead of the registration.
    await tx
      .update(schema.sessions)
      .set({
        registrationId: null,
        userId: user.userId,
      })
      .where(eq(schema.sessions.sessionId, sessionId));

    // Delete the registration.
    await tx
      .delete(schema.registrations)
      .where(eq(schema.registrations.registrationId, registrationId));

    return {
      userId: user.userId
    };
  });
}

export const saveUserAuthentication = async (sessionId: string, userId: number, credential: { credentialId: Uint8Array, counter: number }) => {
  await db.transaction(async (tx) => {

    // Save the latest details about the credential.
    await tx
      .update(schema.credentials)
      .set({
        counter: credential.counter
      })
      .where(eq(schema.credentials.credentialId, toHex(credential.credentialId)));

    // Link the session to the user.
    await tx
      .update(schema.sessions)
      .set({
        registrationId: null,
        userId: userId,
      })
      .where(eq(schema.sessions.sessionId, sessionId));
  });
}

export const getCredential = async (credentialId: Uint8Array) => {
  return await db.query.credentials.findFirst({
    columns: {
      userId: true,
      publicKey: true,
      counter: true,
    },
    where: () => eq(schema.credentials.credentialId, toHex(credentialId)),
  });
}

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

export const getStickersInAlbum = async (userId: number) => {
  const ownedStickers = await db.query.ownedStickers.findMany({
    columns: {
      stickerId: true,
    },
    where: () => and(
      eq(schema.ownedStickers.userId, userId),
      eq(schema.ownedStickers.isInAlbum, true)),
  });

  return ownedStickers.map(s => s.stickerId);
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

export const getLastPacketDateTime = async (userId: number) => {
  const user = await db.query.users.findFirst({
    columns: {
      lastPacketUtc: true,
    },
    where: () => eq(schema.users.userId, userId),
  });

  return user?.lastPacketUtc ?? null;
}

export const addPacketToDeck = async (userId: number, stickerIds: number[], openedUtc: Date) => {
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.ownedStickers)
      .values(stickerIds.map(id => ({
        stickerId: id,
        userId: userId,
        isInAlbum: false,
      })));

    await tx
      .update(schema.users)
      .set({ lastPacketUtc: openedUtc })
      .where(eq(schema.users.userId, userId));
  })
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

const toHex = (arr: Uint8Array) => {
  return Buffer.from(arr).toString("hex");
}