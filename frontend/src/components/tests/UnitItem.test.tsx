import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UnitItem from '../user/modules/syllabus/UnitItem';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UnitItem Component', () => {
  const mockToggle = vi.fn();

  const mockUnitItem = {
    id: 'b5a40228-6e30-499e-87c7-44eb7c542338',
    title: 'AI in Business Strategies',
    content: [
      { type: 'video' as const, title: 'Introduction to AI' },
      { type: 'article' as const, title: 'AI Adoption in Business' },
    ],
  };

  const renderComponent = (isOpen = false) =>
    render(
      <BrowserRouter>
        <UnitItem
          unit={mockUnitItem}
          isOpen={isOpen}
          onToggle={mockToggle}
          index={0}
        />
      </BrowserRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unit title correctly', () => {
    renderComponent();
    expect(
      screen.getByText(/Unit 1: AI in Business Strategies/i),
    ).toBeInTheDocument();
  });

  it('calls onToggle when the container is clicked', async () => {
    renderComponent();
    const chevronPath = document.querySelector('path[d="M19 9l-7 7-7-7"]');
    await userEvent.click(chevronPath!);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('calls navigate with the correct unit ID when title is clicked', async () => {
    renderComponent();
    const title = screen.getByText(/Unit 1: AI in Business Strategies/i);
    await userEvent.click(title);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/user/unit/b5a40228-6e30-499e-87c7-44eb7c542338',
    );
  });

  it('shows content items when expanded', () => {
    renderComponent(true);
    expect(screen.getByText(/Introduction to AI/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Adoption in Business/i)).toBeInTheDocument();
  });

  it('shows message when there is no content', () => {
    render(
      <BrowserRouter>
        <UnitItem
          unit={{ ...mockUnitItem, content: [] }}
          isOpen={true}
          onToggle={mockToggle}
          index={0}
        />
      </BrowserRouter>,
    );
    expect(
      screen.getByText(/No content available for this unit/i),
    ).toBeInTheDocument();
  });
});
