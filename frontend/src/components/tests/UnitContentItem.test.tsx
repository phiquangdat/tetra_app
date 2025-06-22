import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import UnitContentItem from '../user/modules/Syllabus/UnitContentItem';

const renderUnitContentItem = (
  type: 'video' | 'article' | 'quiz',
  title: string,
) => {
  render(<UnitContentItem type={type} title={title} />);
};

describe('UnitContentItem Component', () => {
  it('renders the video content correctly', () => {
    renderUnitContentItem('video', 'Introduction to AI');

    expect(screen.getByText(/Introduction to AI/i)).toBeInTheDocument();
  });

  it('renders the article content correctly', () => {
    renderUnitContentItem('article', 'AI Adoption in Business');

    expect(screen.getByText(/AI Adoption in Business/i)).toBeInTheDocument();
  });

  it('renders the quiz content correctly', () => {
    renderUnitContentItem('quiz', 'AI Knowledge Quiz');

    expect(screen.getByText(/AI Knowledge Quiz/i)).toBeInTheDocument();
  });
});
