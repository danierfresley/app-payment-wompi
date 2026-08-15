export const productImageSrc = (imageUrl: string, width?: number): string => {
  if (!imageUrl.startsWith('http')) {
    return imageUrl;
  }
  try {
    const url = new URL(imageUrl);
    if (width) {
      url.searchParams.set('w', String(width));
    }
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('q', '70');
    url.searchParams.set('fm', 'jpg');
    return url.toString();
  } catch {
    return imageUrl;
  }
};
