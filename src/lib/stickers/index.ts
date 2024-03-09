// The sticker images are in the lib folder instead of the static
// folder because assets in the static folder are not served by SvelteKit
// with any cache headers, whereas assets in the lib folder are treated as
// immutable. Lib folder assets get cache buster file names and have a
// value of "immutable" in the Cache-Control header.

// Because the sticker images don't have stable file names, their file
// paths need to be imported (Vite takes care of resolving the dynamic
// file path). It's not practical to import every sticker image
// individually within Svelte components. Instead they are all imported
// here accessed dynamically.

const imageUrls = import.meta.glob(`/src/lib/images/stickers/*.jpg`, {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const getStickerImageUrl = (title: string) => {
  // Single quotes have been removed from the image file names
  // because Vite cannot build the application if there is an
  // import statement for a file with a single quote.
  const sanitizedTitle = title.replaceAll("'", "");
  const sourceFilePath = `/src/lib/images/stickers/${sanitizedTitle}.jpg`;
  return imageUrls[sourceFilePath] ?? "";
}

export const getStickerHeadingId = (title: string) => {
  return title.replaceAll(/[ '"]/g, "_");
}