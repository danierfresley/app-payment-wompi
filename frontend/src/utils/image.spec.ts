import { productImageSrc } from './image';

describe('productImageSrc', () => {
  it('keeps local paths untouched', () => {
    expect(productImageSrc('/images/lamp.jpg', 800)).toBe('/images/lamp.jpg');
  });

  it('rebuilds remote urls without duplicating width', () => {
    const src = productImageSrc(
      'https://images.unsplash.com/photo-x?auto=format&fit=crop&w=1200&q=70',
      800,
    );
    expect(src).toContain('w=800');
    expect(src.match(/[?&]w=/g)).toHaveLength(1);
  });
});
