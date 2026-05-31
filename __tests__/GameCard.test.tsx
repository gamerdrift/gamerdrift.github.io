// __tests__/GameCard.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCard from '../app/components/GameCard';

test('renders game title and description', () => {
  const game = {
    id: 1,
    title: 'Test Game',
    description: 'A test description',
    coverImage: 'https://example.com/cover.jpg',
    gameUrl: 'https://example.com/game',
  };
  render(<GameCard game={game} />);
  expect(screen.getByText('Test Game')).toBeInTheDocument();
  expect(screen.getByText('A test description')).toBeInTheDocument();
  const button = screen.getByRole('button', { name: /play now/i });
  expect(button).toBeInTheDocument();
});
