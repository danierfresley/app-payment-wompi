import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { createTestStore } from './test-utils';

jest.mock('./services/api', () => ({
  api: { listProducts: jest.fn().mockResolvedValue([]) },
}));

describe('App', () => {
  it('renders the storefront', () => {
    render(
      <Provider store={createTestStore()}>
        <App />
      </Provider>,
    );
    expect(screen.getByText('Atelier Norte')).toBeInTheDocument();
  });
});
