import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

test('renders message passed as prop', () => {
  render(<MyComponent message="Hello, world!" />);
  const messageElement = screen.getByText(/Hello, world!/i);
  expect(messageElement).toBeInTheDocument();
});
