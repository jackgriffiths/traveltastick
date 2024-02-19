import { randomBytes } from "crypto";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema";

const users = [
  {
    album: null,
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
    title: "Planet Earth",
    location: "Milky Way",
    description: "A planet 150,000,000 kilometers (93,000,000 miles) from the sun that contains the only known life in the universe.",
    isShiny: true,
  },
  {
    title: "Edinburgh Castle",
    location: "Scotland",
    description: "A historic castle built in the 11th century on an extinct volcano.",
    isShiny: false,
  },
  {
    title: "Giant's Causeway",
    location: "Northern Ireland",
    description: "",
    isShiny: false
  },
  {
    title: "Stonehenge",
    location: "England",
    description: "",
    isShiny: false
  },
  {
    title: "Big Ben",
    location: "England",
    description: "",
    isShiny: false
  },
  {
    title: "Buckingham Palace",
    location: "England",
    description: "",
    isShiny: false
  },
  {
    title: "Louvre",
    location: "France",
    description: "",
    isShiny: false
  },
  {
    title: "Notre Dame",
    location: "France",
    description: "",
    isShiny: false
  },
  {
    title: "Arc de Triomphe",
    location: "France",
    description: "",
    isShiny: false
  },
  {
    title: "Eiffel Tower",
    location: "France",
    description: "",
    isShiny: false
  },
  {
    title: "Alhambra",
    location: "Spain",
    description: "",
    isShiny: false
  },
  {
    title: "La Sagrada Familia",
    location: "Spain",
    description: "",
    isShiny: false
  },
  {
    title: "Belém Tower",
    location: "Portugal",
    description: "",
    isShiny: false
  },
  {
    title: "Blue Lagoon",
    location: "Iceland",
    description: "",
    isShiny: false
  },
  {
    title: "Atomium",
    location: "Belgium",
    description: "",
    isShiny: false
  },
  {
    title: "Rijksmuseum",
    location: "Netherlands",
    description: "",
    isShiny: false
  },
  {
    title: "Little Mermaid",
    location: "Denmark",
    description: "",
    isShiny: false
  },
  {
    title: "Pulpit Rock",
    location: "Norway",
    description: "",
    isShiny: false
  },
  {
    title: "Stockholm Palace",
    location: "Sweden",
    description: "",
    isShiny: false
  },
  {
    title: "Helsinki Cathedral",
    location: "Finland",
    description: "",
    isShiny: false
  },
  {
    title: "Brandenburg Gate",
    location: "Germany",
    description: "",
    isShiny: false
  },
  {
    title: "Neuschwanstein Castle",
    location: "Germany",
    description: "",
    isShiny: false
  },
  {
    title: "Charles Bridge",
    location: "Czechia",
    description: "",
    isShiny: false
  },
  {
    title: "Schönbrunn Palace",
    location: "Austria",
    description: "",
    isShiny: false
  },
  {
    title: "Roman Colosseum",
    location: "Italy",
    description: "",
    isShiny: true
  },
  {
    title: "Leaning Tower of Pisa",
    location: "Italy",
    description: "",
    isShiny: false
  },
  {
    title: "Bran Castle",
    location: "Romania",
    description: "",
    isShiny: false
  },
  {
    title: "Saint Sophia Cathedral",
    location: "Ukraine",
    description: "",
    isShiny: false
  },
  {
    title: "Parthenon",
    location: "Greece",
    description: "",
    isShiny: false
  },
  {
    title: "Hagia Sophia",
    location: "Turkey",
    description: "",
    isShiny: false
  },
  {
    title: "Saint Basil's Cathedral",
    location: "Russia",
    description: "",
    isShiny: false
  },
  {
    title: "Baiterek Tower",
    location: "Kazakhstan",
    description: "",
    isShiny: false
  },
  {
    title: "Petra",
    location: "Jordan",
    description: "",
    isShiny: true
  },
  {
    title: "Kuwait Towers",
    location: "Kutwait",
    description: "",
    isShiny: false
  },
  {
    title: "Burj Khalifa",
    location: "United Arab Emirates",
    description: "",
    isShiny: false
  },
  {
    title: "Badshahi Mosque",
    location: "Pakistan",
    description: "",
    isShiny: false
  },
  {
    title: "Taj Mahal",
    location: "India",
    description: "",
    isShiny: true
  },
  {
    title: "Sigiriya Fortress",
    location: "Sri Lanka",
    description: "",
    isShiny: false
  },
  {
    title: "Mount Everest",
    location: "Nepal",
    description: "",
    isShiny: false
  },
  {
    title: "Great Wall of China",
    location: "China",
    description: "",
    isShiny: true
  },
  {
    title: "The Big Buddha",
    location: "Hong Kong",
    description: "",
    isShiny: false
  },
  {
    title: "Mount Fuji",
    location: "Japan",
    description: "",
    isShiny: false
  },
  {
    title: "Golden Bridge",
    location: "Vietnam",
    description: "",
    isShiny: false
  },
  {
    title: "Halong Bay",
    location: "Vietnam",
    description: "",
    isShiny: false
  },
  {
    title: "Angkor Wat",
    location: "Cambodia",
    description: "",
    isShiny: false
  },
  {
    title: "Grand Palace",
    location: "Thailand",
    description: "",
    isShiny: false
  },
  {
    title: "Marina Bay Sands",
    location: "Singapore",
    description: "",
    isShiny: false
  },
  {
    title: "Borobudur",
    location: "Indonesia",
    description: "",
    isShiny: false
  },
  {
    title: "Sydney Opera House",
    location: "Australia",
    description: "",
    isShiny: false
  },
  {
    title: "CN Tower",
    location: "Canada",
    description: "",
    isShiny: false
  },
  {
    title: "Niagara Falls",
    location: "Canada and United States",
    description: "",
    isShiny: false
  },
  {
    title: "Golden Gate Bridge",
    location: "United States",
    description: "",
    isShiny: false
  },
  {
    title: "Mount Rushmore",
    location: "United States",
    description: "",
    isShiny: false
  },
  {
    title: "Grand Canyon",
    location: "United States",
    description: "",
    isShiny: false
  },
  {
    title: "Statue of Liberty",
    location: "United States",
    description: "",
    isShiny: false
  },
  {
    title: "Teotihuacan",
    location: "Mexico",
    description: "",
    isShiny: false
  },
  {
    title: "Chichen Itza",
    location: "Mexico",
    description: "",
    isShiny: true
  },
  {
    title: "Panama Canal",
    location: "Panama",
    description: "",
    isShiny: false
  },
  {
    title: "Las Lajas Sanctuary",
    location: "Colombia",
    description: "",
    isShiny: false
  },
  {
    title: "Rainbow Mountain",
    location: "Peru",
    description: "",
    isShiny: false
  },
  {
    title: "Machu Picchu",
    location: "Peru",
    description: "",
    isShiny: true
  },
  {
    title: "Salar de Uyuni",
    location: "Bolivia",
    description: "",
    isShiny: false
  },
  {
    title: "Moai",
    location: "Easter Island",
    description: "",
    isShiny: false
  },
  {
    title: "Obelisk of Buenos Aires",
    location: "Argentina",
    description: "",
    isShiny: false,
  },
  {
    title: "Iguazu Falls",
    location: "Argentina and Brazil",
    description: "",
    isShiny: false,
  },
  {
    title: "Christ the Redeemer",
    location: "Brazil",
    description: "",
    isShiny: true
  },
  {
    title: "La Mano",
    location: "Uruguay",
    description: "",
    isShiny: false
  },
  {
    title: "Hassan II Mosque",
    location: "Morocco",
    description: "",
    isShiny: false
  },
  {
    title: "Pyramids of Giza",
    location: "Egypt",
    description: "",
    isShiny: true
  },
  {
    title: "Mount Kilimanjaro",
    location: "Tanzania",
    description: "",
    isShiny: false
  },
  {
    title: "Victoria Falls",
    location: "Zimbabwe and Zambia",
    description: "",
    isShiny: false
  },
  {
    title: "Okavango Delta",
    location: "Botswana",
    description: "",
    isShiny: false
  },
  {
    title: "Table Mountain",
    location: "South Africa",
    description: "",
    isShiny: false
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
    .map((s, index) => ({
      number: index + 1,
      title: s.title,
      location: s.location,
      description: s.description || "TODO",
      isShiny: s.isShiny,
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

  const allStickerNumbers = [...stickers.values()];

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
      ...(user.album ?? allStickerNumbers).map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        receivedUtc: new Date(),
        isInAlbum: true,
      })));

    ownedStickersToInsert.push(
      ...user.deck.map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        receivedUtc: new Date(),
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
