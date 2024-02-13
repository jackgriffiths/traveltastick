import { randomBytes } from "crypto";
import type { Cookies } from "@sveltejs/kit";
import { addHours } from "$lib/server/dates";
import * as db from "$lib/server/db";
import { dev } from "$app/environment";

const cookieName = "session";
const sessionLengthHours = 7 * 24; // 7 days

const generateSessionId = () => {
  return randomBytes(32).toString("base64url");
}

export const startRegistrationSession = async (cookies: Cookies, registrationId: number, challenge: string, challengeExpiresUtc: Date) => {
  const now = new Date();
  const expiresUtc = addHours(now, sessionLengthHours);
  
  const sessionId = await db.createRegistrationSession({
    sessionId: generateSessionId(),
    registrationId: registrationId,
    createdUtc: now,
    expiresUtc: expiresUtc,
    challenge: challenge,
    challengeExpiresUtc: challengeExpiresUtc,
  });

  setCookie(cookies, sessionId, expiresUtc);
}

export const startAuthenticationSession = async (cookies: Cookies, challenge: string, challengeExpiresUtc: Date) => {
  const now = new Date();
  const expiresUtc = addHours(now, sessionLengthHours);
  
  const sessionId = await db.createAuthenticationSession({
    sessionId: generateSessionId(),
    createdUtc: now,
    expiresUtc: expiresUtc,
    challenge: challenge,
    challengeExpiresUtc: challengeExpiresUtc,
  });

  setCookie(cookies, sessionId, expiresUtc);
}

export const setSessionChallenge = async (sessionId: string, challenge: string, expiresUtc: Date) => {
  await db.updateChallenge(sessionId, challenge, expiresUtc);
}

export const getSession = async (cookies: Cookies) => {
  const sessionId = cookies.get(cookieName);
  
  if (!sessionId) {
    return null;
  }

  const session = await db.getSession(sessionId);

  if (!session) {
    cookies.delete(cookieName, { path: "/" });
    return null;
  }

  if (session.expiresUtc <= new Date()) {
    await endSession(cookies, sessionId);
    return null;
  }

  return {
    sessionId: session.sessionId,
    registrationId: session.registrationId,
    userId: session.userId,
  }
}

export const endSession = async (cookies: Cookies, sessionId: string) => {
  cookies.delete(cookieName, { path: "/" });
  await db.deleteSession(sessionId);
}

const setCookie = (cookies: Cookies, sessionId: string, expires: Date) => {
  cookies.set(cookieName, sessionId, {
    path: "/",
    secure: !dev,
    httpOnly: true,
    sameSite: "lax",
    expires: expires,
  });
}
