export const getStickerImageUrl = (stickerNumber: number) => {
  return `/stickers/${stickerNumber.toString().padStart(3, "0")}.jpg`;
}