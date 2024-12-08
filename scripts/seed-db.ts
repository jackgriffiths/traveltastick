import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/server/db/schema";

const stickers = [
  {
    title: "Earth",
    location: "Solar System",
    description: "Situated approximately 149,000,000 kilometres from the Sun, this planet is unique for being home to the only known life in the universe. Its atmosphere, abundant in oxygen and shielded by a magnetic field, creates the perfect conditions for sustaining life.",
    isShiny: true,
  },
  {
    title: "Edinburgh Castle",
    location: "Scotland",
    description: "This historic fortress dominates the skyline of the city from its position atop an extinct volcanic rock. It has a rich history, serving as a royal residence, military garrison, prison, and fortress, and is the most besieged place in Great Britain.",
    isShiny: false,
  },
  {
    title: "Giant's Causeway",
    location: "Northern Ireland",
    description: "Comprised of about 40,000 interlocking basalt columns, this natural wonder is the result of an ancient volcanic fissure eruption. Its unique, hexagonal shapes and stunning coastal location have fascinated visitors and scientists alike for centuries.",
    isShiny: false
  },
  {
    title: "Stonehenge",
    location: "England",
    description: "This prehistoric monument consists of a ring of standing stones, each around 4 metres high, 2.1 metres wide, and weighing about 25 tons. It is believed to have been constructed from 3000 BC to 2000 BC, and its purpose remains a subject of research and speculation.",
    isShiny: false
  },
  {
    title: "Big Ben",
    location: "England",
    description: "This iconic clock tower, standing at 96 metres tall, is part of a larger complex that houses a national parliamentary building. Its chimes have marked the hour with remarkable accuracy since its completion in 1859.",
    isShiny: false
  },
  {
    title: "Buckingham Palace",
    location: "England",
    description: "This residence serves as the administrative headquarters for the monarch and has been the official royal palace since the 19th century. With 775 rooms, including 19 State rooms, it plays host to numerous state occasions and royal hospitality events throughout the year.",
    isShiny: false
  },
  {
    title: "Louvre",
    location: "France",
    description: "Originally built as a fortress in the late 12th century, this structure was transformed into a public museum during the French Revolution in 1793. It houses more than 380,000 objects and displays 35,000 works of art, including the Mona Lisa and the Venus de Milo.",
    isShiny: false
  },
  {
    title: "Notre Dame",
    location: "France",
    description: "This medieval cathedral, dating back to the 12th century, is famed for its French Gothic architecture. A significant restoration project began after a devastating fire in 2019, aiming to preserve its historical significance and architectural beauty.",
    isShiny: false
  },
  {
    title: "Arc de Triomphe",
    location: "France",
    description: "This monument, standing 50 metres tall, was inaugurated in 1836 to honor those who fought and died for the country during the French Revolutionary and Napoleonic Wars. It bears the names of all French victories and generals inscribed on its inner and outer surfaces.",
    isShiny: false
  },
  {
    title: "Eiffel Tower",
    location: "France",
    description: "Constructed as the entrance arch for the 1889 World's Fair, this wrought-iron lattice tower stands 330 metres tall. Initially criticized for its design, it has become a beloved symbol of architectural innovation and one of the most visited monuments in the world.",
    isShiny: false
  },
  {
    title: "Alhambra",
    location: "Spain",
    description: "This fortress complex is renowned for its stunning Islamic art and architectural details, including intricate tile work, arches, and carved wood. It was originally constructed as a small fortress in AD 889 and was later transformed into a royal palace in the mid-13th century.",
    isShiny: false
  },
  {
    title: "Sagrada Familia",
    location: "Spain",
    description: "This architectural masterpiece, designed by Antoni Gaudí, has been under construction since 1882 and is renowned for its intricate facades and towering spires. Once completed, the tallest spire will be 172.5 metres tall and dedicated to Jesus Christ.",
    isShiny: false
  },
  {
    title: "Belém Tower",
    location: "Portugal",
    description: "Constructed in the early 16th century, this fortified tower stands as a significant example of the Portuguese Manueline style. It was originally built to defend the estuary of the Tagus River and later served as a ceremonial gateway to the city.",
    isShiny: false
  },
  {
    title: "Blue Lagoon",
    location: "Iceland",
    description: "This geothermal spa is known for its milky-blue waters rich in minerals reputed for their skin-healing properties. Attracting visitors seeking relaxation and wellness, it offers a unique bathing experience in warm waters averaging 37-39°C, surrounded by a stark and beautiful volcanic landscape.",
    isShiny: false
  },
  {
    title: "Atomium",
    location: "Belgium",
    description: "Constructed for the 1958 Brussels World's Fair, this unique building stands 102 metres tall and forms the shape of a cell of an iron crystal, magnified 165 billion times. It serves both as a museum and an exhibition hall, symbolizing the atomic age and the peaceful use of nuclear energy.",
    isShiny: false
  },
  {
    title: "Rijksmuseum",
    location: "Netherlands",
    description: "This museum is renowned for housing an extensive collection of artworks and historical artifacts, including masterpieces from the 17th-century Golden Age of its country. Among its most famous exhibits is \"The Night Watch\" by Rembrandt.",
    isShiny: false
  },
  {
    title: "Little Mermaid",
    location: "Denmark",
    description: "Unveiled in 1913, this bronze statue, situated on a rock by the waterside, is inspired by Hans Christian Andersen's fairy tale of the same name. Despite its modest size, it has become a symbol of the city, attracting visitors from around the world.",
    isShiny: false
  },
  {
    title: "Pulpit Rock",
    location: "Norway",
    description: "Perched 604 metres above a fjord, this flat-topped cliff offers breathtaking views of the surrounding landscapes. A 4-kilometre trek from the nearest road, it has become a popular hiking destination, attracting adventurers to its natural beauty and sheer cliffs without any safety barriers.",
    isShiny: false
  },
  {
    title: "Stockholm Palace",
    location: "Sweden",
    description: "This royal residence boasts over 600 rooms and is one of the largest palaces in Europe still in use for its original purpose. It also houses several museums, including the Royal Armory, showcasing centuries of royal costumes and armor.",
    isShiny: false
  },
  {
    title: "Helsinki Cathedral",
    location: "Finland",
    description: "This neoclassical cathedral, completed in 1852, stands out for its distinctive white façade, green dome, and surrounding statues of the twelve apostles. It serves as both a city's major tourist attraction and a venue for significant cultural and religious events.",
    isShiny: false
  },
  {
    title: "Brandenburg Gate",
    location: "Germany",
    description: "Constructed in the late 18th century, this monument was built as a symbol of peace. It has played a significant role in the country's history, witnessing numerous historical events and serving as a site for major public gatherings and speeches.",
    isShiny: false
  },
  {
    title: "Neuschwanstein Castle",
    location: "Germany",
    description: "This 19th-century hilltop castle was commissioned by Ludwig II of Bavaria as a retreat and as an homage to Richard Wagner, the composer. Notably, its design served as inspiration for Disneyland's Sleeping Beauty Castle.",
    isShiny: false
  },
  {
    title: "Charles Bridge",
    location: "Czechia",
    description: "This historic bridge, dating back to the 15th century, spans 16 arches and is lined with 30 statues of religious figures. It serves as a pedestrian-only pathway, offering picturesque views of the surrounding city and river.",
    isShiny: false
  },
  {
    title: "Schönbrunn Palace",
    location: "Austria",
    description: "Built in the 17th century, this historic palace includes a vast garden and a zoo, the oldest of its kind in the world. With 1,441 rooms, it served as a summer home for the Habsburg royal family, one of the most powerful dynasties in European history.",
    isShiny: false
  },
  {
    title: "Roman Colosseum",
    location: "Italy",
    description: "Constructed between AD 70 and 80, this ancient amphitheater could hold up to 80,000 spectators and was used for gladiatorial contests and public spectacles. Despite being partially ruined due to earthquakes and stone-robbers, it remains an iconic symbol of Imperial Rome.",
    isShiny: true
  },
  {
    title: "Leaning Tower of Pisa",
    location: "Italy",
    description: "This tower is known worldwide for its unintended tilt, which began during construction in the 12th century due to an inadequate foundation on soft ground. It stands at about 56 metres from the ground on the low side and 57 metres on the high side.",
    isShiny: false
  },
  {
    title: "Bran Castle",
    location: "Romania",
    description: "Often associated with the legend of Dracula, this castle is set against a backdrop of dense forests and rugged mountains. It dates back to the 14th century and now serves as a museum, showcasing art and furniture collected by Queen Marie of Romania.",
    isShiny: false
  },
  {
    title: "Saint Sophia Cathedral",
    location: "Ukraine",
    description: "This architectural masterpiece, known for its intricate mosaics and frescoes, is a landmark example of Byzantine architecture. Built in the 11th century, it has served various religious purposes over the centuries and now functions as a museum.",
    isShiny: false
  },
  {
    title: "Parthenon",
    location: "Greece",
    description: "Dedicated to the goddess Athena, this temple on the Acropolis was completed in 438 BC. Despite suffering damage over the centuries, including a significant explosion in 1687, it remains a symbol of the cultural and political achievements of Athens during its Golden Age.",
    isShiny: false
  },
  {
    title: "Hagia Sophia",
    location: "Turkey",
    description: "Originally constructed as a cathedral in 537 AD, this architectural marvel has served various roles over the centuries, including a mosque and now a museum. With its massive dome, it once held the title of the world's largest cathedral for nearly a thousand years.",
    isShiny: false
  },
  {
    title: "Saint Basil's Cathedral",
    location: "Russia",
    description: "Completed in 1561, this cathedral is renowned for its vibrant, onion-shaped domes and intricate patterns. It was built on the orders of Ivan the Terrible and is located in the heart of Moscow's Red Square.",
    isShiny: false
  },
  {
    title: "Baiterek Tower",
    location: "Kazakhstan",
    description: "This towering structure stands at 105 metres tall and features a unique design that symbolizes a poplar tree holding a golden egg. It offers visitors panoramic views of the city from an observation deck located within the sphere.",
    isShiny: false
  },
  {
    title: "Petra",
    location: "Jordan",
    description: "Carved directly into vibrant red sandstone cliffs, this ancient city dates back to as early as the 5th century BC. Once a thriving trading center and the capital of the Nabatean Kingdom, it features hundreds of tombs, houses, and a theater.",
    isShiny: true
  },
  {
    title: "Burj Khalifa",
    location: "United Arab Emirates",
    description: "Rising to a height of 828 metres, this skyscraper holds the title of the tallest building in the world since its completion in 2010. It boasts 163 floors, housing residential spaces, corporate offices, a hotel, and observation decks that offer unparalleled views of the city skyline and beyond.",
    isShiny: false
  },
  {
    title: "Badshahi Mosque",
    location: "Pakistan",
    description: "Constructed in 1673, this mosque is renowned for its vast courtyard and impressive red sandstone architecture. It can accommodate over 55,000 worshippers, making it one of the largest mosques in the world.",
    isShiny: false
  },
  {
    title: "Taj Mahal",
    location: "India",
    description: "Constructed in the 17th century as a mausoleum by a Mughal emperor in memory of his wife, this iconic structure is renowned for its magnificent white marble architecture and intricate Islamic art. It attracts millions of visitors annually and is considered a symbol of love.",
    isShiny: true
  },
  {
    title: "Sigiriya Fortress",
    location: "Sri Lanka",
    description: "This ancient rock fortress, dating back to the 5th century, is renowned for its palace ruins on top of a massive column of rock nearly 200 metres high. The entrance is marked by a unique gateway in the shape of an enormous lion.",
    isShiny: false
  },
  {
    title: "Mount Everest",
    location: "Nepal",
    description: "Part of the Himalayas, this mountain's peak is the highest point on Earth, at 8,849 metres above sea level. Known for its extreme conditions and challenging terrain, it attracts mountaineers from around the world, many of whom embark on expeditions to reach its summit.",
    isShiny: false
  },
  {
    title: "Great Wall of China",
    location: "China",
    description: "Built over centuries starting from the 7th century BC, this monumental wall stretches more than 21,000 kilometres, making it the world's longest and a testament to ancient engineering. It was primarily constructed across several dynasties to serve as a defense against invasions.",
    isShiny: true
  },
  {
    title: "The Big Buddha",
    location: "Hong Kong",
    description: "This colossal statue stands at 34 metres tall and is made entirely of bronze. It was completed in 1993 and is located atop a series of steps, offering panoramic views of the surrounding area to visitors who make the climb.",
    isShiny: false
  },
  {
    title: "Mount Fuji",
    location: "Japan",
    description: "This towering mountain is celebrated for its symmetrical cone, which is often capped with snow, making it a beloved subject in art and photography. Rising to 3,776 metres, it attracts thousands of climbers and pilgrims every year.",
    isShiny: false
  },
  {
    title: "Golden Bridge",
    location: "Vietnam",
    description: "Opened in 2018, this pedestrian bridge is notable for its 150-metre length and the giant stone hands that appear to support it. Set more than 1,400 metres above sea level, it offers visitors breathtaking views of the surrounding mountains and forest.",
    isShiny: false
  },
  {
    title: "Angkor Wat",
    location: "Cambodia",
    description: "This temple complex, originally constructed in the early 12th century, is the largest religious monument in the world by land area. Initially dedicated to the Hindu god Vishnu, it was gradually transformed into a Buddhist temple towards the end of the 12th century.",
    isShiny: false
  },
  {
    title: "Grand Palace",
    location: "Thailand",
    description: "Constructed in 1782, this complex has been the official residence of the Kings of Siam (and later Thailand) for centuries. It is renowned for its intricate architecture and the Temple of the Emerald Buddha, which houses a highly revered Buddha statue carved from a single block of jade.",
    isShiny: false
  },
  {
    title: "Marina Bay Sands",
    location: "Singapore",
    description: "This integrated resort is known for its distinctive architecture, featuring three 55-story towers connected by a unique sky park. Opened in 2010, it includes a luxury hotel, exhibition center, theater, museum, and one of the largest rooftop infinity pools in the world.",
    isShiny: false
  },
  {
    title: "Borobudur",
    location: "Indonesia",
    description: "This 9th-century Mahayana Buddhist temple is decorated with 2,672 relief panels and 504 Buddha statues. It is the world's largest Buddhist temple, representing the spiritual journey from the life of desire, through meditation, to Nirvana, as depicted in its intricate carvings and stupas.",
    isShiny: false
  },
  {
    title: "Sydney Opera House",
    location: "Australia",
    description: "This performing arts centre, celebrated for its unique shell-like design, stands as a masterpiece of 20th-century architecture. It hosts over 1,500 performances each year, attracting visitors from around the globe to its multiple performance venues.",
    isShiny: false
  },
  {
    title: "CN Tower",
    location: "Canada",
    description: "Once the world's tallest freestanding structure, this communications and observation tower reaches 553.3 metres in height and was completed in 1976. It features a glass floor and a revolving restaurant, offering visitors dramatic panoramic views of the city below.",
    isShiny: false
  },
  {
    title: "Niagara Falls",
    location: "Canada and United States",
    description: "Comprising three separate waterfalls straddling the border, this natural wonder is renowned for its breathtaking views and immense water flow. With a combined average rate of 2,800,000 litres per second, it serves as a major source of hydroelectric power.",
    isShiny: false
  },
  {
    title: "Golden Gate Bridge",
    location: "United States",
    description: "Spanning the strait that connects San Francisco Bay to the Pacific Ocean, this suspension bridge is renowned for its striking International Orange colour. Completed in 1937, it measures approximately 2.7 kilometres in length and is one of the most photographed bridges in the world.",
    isShiny: false
  },
  {
    title: "Mount Rushmore",
    location: "United States",
    description: "Carved into the granite face of a mountain, this monumental sculpture features the 18-metre high heads of four United States presidents: George Washington, Thomas Jefferson, Theodore Roosevelt, and Abraham Lincoln. Completed in 1941, it took 14 years and 400 workers to create.",
    isShiny: false
  },
  {
    title: "Grand Canyon",
    location: "United States",
    description: "This natural wonder, carved by the Colorado River over millions of years, stretches 446 kilometres long, up to 29 kilometres wide, and over 1.8 kilometres deep. It is a popular destination for hiking, rafting, and helicopter tours, attracting millions of visitors each year.",
    isShiny: false
  },
  {
    title: "Statue of Liberty",
    location: "United States",
    description: "This iconic statue was a gift from France, dedicated in 1886 as a symbol of freedom and democracy. Standing at over 93 metres from the ground, it features a woman holding a torch above her head with her right hand and a tablet bearing the date of the American Declaration of Independence in her left.",
    isShiny: false
  },
  {
    title: "Teotihuacan",
    location: "Mexico",
    description: "This ancient Mesoamerican city is known for its vast Avenue of the Dead, lined with impressive pyramids, including the Pyramid of the Sun, one of the largest in the world. It flourished from approximately the 1st to the 7th century AD, playing a crucial role in the cultural and religious development of the region.",
    isShiny: false
  },
  {
    title: "Chichen Itza",
    location: "Mexico",
    description: "Founded in the 6th century AD, this ancient city is a masterpiece of the Mayan civilization. It is renowned for \"El Castillo,\" a massive pyramid that aligns with astronomical events, showcasing the civilization's sophisticated celestial knowledge by the 1st millennium AD.",
    isShiny: true
  },
  {
    title: "Panama Canal",
    location: "Panama",
    description: "This 82-kilometre-long waterway connects the Atlantic and Pacific Oceans, significantly reducing the maritime journey between the east and west coasts of the Americas. Completed in 1914, it plays an important role in facilitating international maritime trade.",
    isShiny: false
  },
  {
    title: "Las Lajas Sanctuary",
    location: "Colombia",
    description: "Nestled in a canyon and spanning a river, this church was built between 1916 and 1949, inspired by a reported miracle. Its stunning architecture and its location amidst waterfalls and greenery, make it a unique blend of natural beauty and human craftsmanship.",
    isShiny: false
  },
  {
    title: "Rainbow Mountain",
    location: "Peru",
    description: "Situated in the Andes of Peru, this mountain is known for its striking, multicoloured layers of rock. It has become a popular hiking destination in recent years, drawing visitors who trek to its summit at over 5,200 metres above sea level for breathtaking views.",
    isShiny: false
  },
  {
    title: "Machu Picchu",
    location: "Peru",
    description: "Perched high in the Andes Mountains, this 15th-century Inca citadel is known for its sophisticated dry-stone construction and is believed to have been a royal estate or sacred religious site. It was abandoned following the Spanish Conquest and not rediscovered by the world until 1911.",
    isShiny: true
  },
  {
    title: "Salar de Uyuni",
    location: "Bolivia",
    description: "Covering over 10,000 square kilometres, this is the world's largest salt flat, formed by prehistoric lakes that evaporated long ago. It is especially famous for its mirror-like effect during the wet season, creating a surreal landscape that reflects the sky above perfectly.",
    isShiny: false
  },
  {
    title: "Moai",
    location: "Easter Island",
    description: "These monolithic human figures were carved by the Rapa Nui people between the years 1250 and 1500. Standing up to 33 feet high and weighing as much as 82 tons, they are believed to represent the ancestors of the islanders, serving as a symbol of authority and power.",
    isShiny: false
  },
  {
    title: "Obelisk of Buenos Aires",
    location: "Argentina",
    description: "This monument stands 67.5 metres tall and was constructed in 1936 to commemorate 400 years since the first founding of the city. It is located at the intersection of two of the city's major streets, serving as a central meeting point and iconic symbol.",
    isShiny: false,
  },
  {
    title: "Iguazu Falls",
    location: "Argentina and Brazil",
    description: "Spanning over 2.7 kilometres, this natural wonder consists of approximately 275 falls, with the highest drop reaching up to 82 metres. It is set amidst a lush, subtropical national park that serves as a habitat for diverse wildlife, including many rare and endangered species.",
    isShiny: false,
  },
  {
    title: "Christ the Redeemer",
    location: "Brazil",
    description: "Standing atop a mountain, this massive statue of Jesus Christ measures 30 metres in height, with its arms spanning 28 metres wide. Completed in 1931, it overlooks the city of Rio de Janeiro below, symbolizing peace and welcoming visitors with open arms.",
    isShiny: true
  },
  {
    title: "La Mano",
    location: "Uruguay",
    description: "This sculpture features five human fingers partially buried in sand, creating an eerie effect of a hand reaching out from the ground. Created by Chilean artist Mario Irarrázabal in 1982, it has become an iconic symbol and a favorite photo spot for tourists visiting the area.",
    isShiny: false
  },
  {
    title: "Pyramids of Giza",
    location: "Egypt",
    description: "Constructed as tombs for pharaohs over 4,500 years ago, these pyramids are the last remaining wonder of the ancient world. The largest, known as the Great Pyramid, was the tallest man-made structure for over 3,800 years.",
    isShiny: true
  },
  {
    title: "Mount Kilimanjaro",
    location: "Tanzania",
    description: "Standing as Africa's highest peak, this mountain rises dramatically above the surrounding savannah, reaching an altitude of approximately 5,895 metres. It is unique for its three volcanic cones and is one of the few places on the equator to have a permanent ice cap.",
    isShiny: false
  },
  {
    title: "Victoria Falls",
    location: "Zimbabwe and Zambia",
    description: "Spanning 1.7 kilometres wide and 108 metres high, this waterfall is known for being one of the largest and most famous in the world, generating mists that can be seen from more than 20 kilometres away. It serves as a natural border between the two countries and is home to a wide variety of wildlife.",
    isShiny: false
  },
  {
    title: "Okavango Delta",
    location: "Botswana",
    description: "This natural wonder is one of the world's largest inland deltas. It is famous for its seasonal flooding, which transforms the area into a vibrant wetland attracting a diverse array of wildlife, including elephants, hippos, and crocodiles, as well as numerous bird species.",
    isShiny: false
  },
  {
    title: "Table Mountain",
    location: "South Africa",
    description: "This flat-topped mountain overlooks Cape Town and is famous for its stunning panoramic views and rich biodiversity. It offers various hiking trails and a cableway to the summit, providing visitors with a unique view of the surrounding landscape and sea.",
    isShiny: false
  },
];

const christmasStickers = [
  {
    title: "Santa Claus",
    location: "",
    description: "",
    isShiny: true,
  },
  {
    title: "Reindeer",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Christmas Tree",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Christmas Presents",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Posadas",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Piñata",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Christmas Lights",
    location: "",
    description: "",
    isShiny: true,
  },
  {
    title: "Christmas Market",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Ponche",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Tamales",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Candy Canes",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Mince Pies",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Christmas Dinner",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Ensalada de Manzana",
    location: "",
    description: "",
    isShiny: true,
  },
  {
    title: "Snowman",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Poinsettia",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Holly",
    location: "",
    description: "",
    isShiny: false,
  },
  {
    title: "Nutcracker Soldier",
    location: "",
    description: "",
    isShiny: true,
  },
  {
    title: "Rosca de Reyes",
    location: "",
    description: "",
    isShiny: false,
  },
];

type Db = PostgresJsDatabase<typeof schema>;

async function seed(connection: postgres.Sql) {
  const db = drizzle(connection, { schema });

  const stickers = await insertStickers(db);
  await insertChristmasStickers(db);
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
      isChristmasSpecial: false,
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

async function insertChristmasStickers(db: Db) {
  const toInsert: (typeof schema.stickers.$inferInsert)[] = christmasStickers
    .map((s, index) => ({
      number: index + 1,
      title: s.title,
      location: s.location,
      description: s.description || "TODO",
      isShiny: s.isShiny,
      isChristmasSpecial: true,
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
  const allStickerNumbers = [...stickers.keys()];

  for (let i = 0; i < 1000; i++) {
    const toInsert: typeof schema.users.$inferInsert = {
      userHandle: randomBytes(32).toString("base64url"),
      registeredUtc: new Date(),
    };

    const insertedRow = (await db
      .insert(schema.users)
      .values(toInsert)
      .returning({ id: schema.users.userId }))[0];

    const numberOfStickersInAlbum = Math.ceil(Math.random() * allStickerNumbers.length);
    const numberOfStickersInDeck = Math.ceil(Math.random() * 10);

    const stickersInAlbum = [...allStickerNumbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, numberOfStickersInAlbum);

    const stickersInDeck: number[] = [];
    for (let i = 0; i < numberOfStickersInDeck; i++) {
      stickersInDeck.push(allStickerNumbers[Math.floor(Math.random() * allStickerNumbers.length)]);
    }

    const ownedStickersToInsert: (typeof schema.ownedStickers.$inferInsert)[] = [];

    ownedStickersToInsert.push(
      ...stickersInAlbum.map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        receivedUtc: new Date(),
        isInAlbum: true,
      })));

    ownedStickersToInsert.push(
      ...stickersInDeck.map(number => ({
        userId: insertedRow.id,
        stickerId: stickers.get(number)!,
        receivedUtc: new Date(),
        isInAlbum: false,
      })));

    await db.insert(schema.ownedStickers).values(ownedStickersToInsert);
  }
}

async function updateDescriptions(connection: postgres.Sql) {
  const db = drizzle(connection, { schema });

  for (const sticker of stickers) {
    await db.update(schema.stickers)
      .set({ description: sticker.description || "TODO" })
      .where(eq(schema.stickers.title, sticker.title))
  }
}

async function run() {
  if (process.argv.length < 3) {
    console.error("Connection string missing.");
    process.exit(1);
  }

  const connectionString = process.argv[2];
  const connection = postgres(connectionString);

  try {
    if (process.argv.length > 3 && process.argv[3] === "--descriptions-only") {
      await updateDescriptions(connection);
      console.log("Finished updating descriptions")
    } else {
      await seed(connection);
      console.log('Finished seeding database');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    connection.end();
  }
}

run();
