import { randomBytes } from "crypto";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema";

const users = [
  {
    album: [1],
    deck: [2],
  },
  {
    album: [1, 2],
    deck: [1],
  },
  {
    album: [1, 2, 3],
    deck: [2],
  },
];

const stickers = [
  {
    number: 1,
    title: "Planet Earth",
    location: "Milky Way",
    description: "A planet 150,000,000 kilometers (93,000,000 miles) from the sun that contains the only known life in the universe.",
    url: "https://photojournal.jpl.nasa.gov/browse/PIA00114.gif",
    isRare: true,
  },
  {
    number: 2,
    title: "Teotihuacan",
    location: "Mexico",
    description: "An ancient Mesoamerican city located 40 kilometers (25 miles) northeast of modern-day Mexico City.",
    url: "https://news.artnet.com/app/news-upload/2021/04/GettyImages-122225161-256x256.jpg",
    isRare: false,
  },
  {
    number: 3,
    title: "Edinburgh Castle",
    location: "Scotland",
    description: "A historic castle built in the 11th century on an extinct volcano.",
    url: "https://i.redd.it/k6oixfvuzrc71.jpg",
    isRare: false,
  },
];

type Db = PostgresJsDatabase<typeof schema>;

async function seed(connection: postgres.Sql) {
  const db = drizzle(connection, { schema });

  const stickers = await insertStickers(db);
  await insertUsers(db, stickers);
}

async function insertStickers(db: Db) {
  const toInsert: (typeof schema.stickers.$inferInsert)[] = stickers
    .map(s => ({
      number: s.number,
      title: s.title,
      location: s.location,
      description: s.description,
      imageUrl: s.url,
      isRare: s.isRare,
    }));

  const insertedRows = await db
    .insert(schema.stickers)
    .values(toInsert)
    .returning({
      id: schema.stickers.stickerId,
      number: schema.stickers.number
    });

  return new Map(insertedRows.map(r => [r.number, r.id]));
}

async function insertUsers(db: Db, stickers: Map<number, number>) {
  const ownedStickersToInsert: (typeof schema.ownedStickers.$inferInsert)[] = [];

  for (const user of users) {
    const toInsert: typeof schema.users.$inferInsert = {
      userHandle: randomBytes(32).toString("base64url"),
      registeredUtc: new Date(),
    };

    const insertedRow = (await db
      .insert(schema.users)
      .values(toInsert)
      .returning({ id: schema.users.userId }))[0];

    ownedStickersToInsert.push(
      ...user.album.map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        isInAlbum: true,
      })));

    ownedStickersToInsert.push(
      ...user.deck.map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        isInAlbum: false,
      })));
  }

  await db.insert(schema.ownedStickers).values(ownedStickersToInsert);
}

async function run() {
  if (process.argv.length < 3) {
    console.error("Connection string missing.");
    process.exit(1);
  }

  const connectionString = process.argv[2];
  const connection = postgres(connectionString);

  try {
    await seed(connection);
    console.log('Finished seeding database');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    connection.end();
  }
}

run();
