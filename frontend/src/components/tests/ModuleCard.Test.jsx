import { render, screen } from '@testing-library/react';
import ModuleCard from '../ModuleCard';

describe('ModuleCard', () => {
  const mockModule = {
    id: 1,
    title: 'Intro to Python',
    description: 'A beginner-friendly course covering Python fundamentals.',
    points: 50,
    topic: 'Programming',
    coverUrl:
      'https://www.pngall.com/wp-content/uploads/2016/05/Python-Logo-Free-PNG-Image.png',
  };

  it('renders module title', () => {
    render(<ModuleCard module={mockModule} />);
    const title = screen.getByText(/Intro to Python/i);
    expect(title).toBeInTheDocument();
  });

  it('renders module description', () => {
    render(<ModuleCard module={mockModule} />);
    const description = screen.getByText(
      /A beginner-friendly course covering Python fundamentals/i,
    );
    expect(description).toBeInTheDocument();
  });

  it('renders module points', () => {
    render(<ModuleCard module={mockModule} />);
    const points = screen.getByText(/50 points/i);
    expect(points).toBeInTheDocument();
  });

  it('renders module cover image', () => {
    render(<ModuleCard module={mockModule} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockModule.coverUrl);
  });

  it('renders module topic', () => {
    render(<ModuleCard module={mockModule} />);
    const topic = screen.getByText(/Programming/i);
    expect(topic).toBeInTheDocument();
  });

  });
