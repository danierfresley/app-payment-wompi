import { render } from '@testing-library/react';
import { CardBrandMarks } from './CardBrandMarks';

describe('CardBrandMarks', () => {
  it('highlights the detected brand', () => {
    const { container } = render(<CardBrandMarks brand="visa" />);
    expect(container.querySelectorAll('.is-on')).toHaveLength(1);
  });
});
