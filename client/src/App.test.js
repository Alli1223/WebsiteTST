import { render, screen } from '@testing-library/react';
jest.mock('react-calendar', () => () => null);
import App from './App';

test('renders header', () => {
  render(<App />);
  const header = screen.getByText(/Tree Gallery/i);
  expect(header).toBeInTheDocument();
});
