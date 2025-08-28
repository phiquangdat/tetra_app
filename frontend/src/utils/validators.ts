/**
 * Checks if an image exists at the given URL by attempting to load it.
 * Returns a promise that resolves to true if the image loads successfully,
 * or false if it fails to load.
 */

export const isImageUrlRenderable = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
};
