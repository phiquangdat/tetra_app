/**
 * Checks if a given URL is a valid image URL by extension.
 * Supports: png, jpg, jpeg, gif, webp, bmp, svg
 */
export const isValidImageUrl = (url: string): boolean => {
  const regex = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg)$/i;
  return regex.test(url);
};
