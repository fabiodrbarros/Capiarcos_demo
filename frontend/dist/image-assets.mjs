// Delivery copies retain the original artwork; originals are also a network fallback.
export function loadImage(source, fallback) {
  const image = new Image();
  image.decoding = 'async';
  const ready = (async () => {
    for (const url of [source, fallback].filter(Boolean)) {
      image.src = url;
      try {
        await image.decode();
        return image;
      } catch {
        // Retry with the supplied original if the delivery copy is unavailable.
      }
    }
    throw new Error(`Não foi possível carregar ${source}`);
  })();
  return { image, ready };
}
