import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import UnitForm from '../admin/createModule/UnitForm';

const mockUnit = {
  unitNumber: 1,
  title: '',
  description: '',
  content: null,
};

describe('UnitForm', () => {
  beforeEach(() => {
    render(<UnitForm unitNumber={mockUnit.unitNumber} onChange={() => {}} />);
  });

  it('renders the form elements correctly', () => {
    expect(screen.getByLabelText('Unit Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Content Blocks')).toBeInTheDocument();
  });

  it('allows user to input text into the unit title field', async () => {
    const input = screen.getByLabelText('Unit Title');
    await userEvent.type(input, 'Test Unit');
    expect(input).toHaveValue('Test Unit');
  });

  it('allows user to input text into the unit description field', async () => {
    const textarea = screen.getByLabelText('Unit Description');
    await userEvent.type(textarea, 'This is a test description.');
    expect(textarea).toHaveValue('This is a test description.');
  });

  it('allows user to select a content block', async () => {
    const select = screen.getByLabelText('Content Blocks');
    await userEvent.selectOptions(select, 'addVideo');
    expect(select).toHaveValue('addVideo');
  });

  it('toggles unit visibility when clicking on the unit header', async () => {
    const unitHeader = screen.getByText(/Unit 1/i);
    expect(screen.getByLabelText('Unit Title')).toBeInTheDocument();
    await userEvent.click(unitHeader);
    expect(screen.queryByLabelText('Unit Title')).not.toBeInTheDocument();
    await userEvent.click(unitHeader);
    expect(screen.getByLabelText('Unit Title')).toBeInTheDocument();
  });

  it('allows user to click the Save button', async () => {
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(saveButton);
    expect(saveButton).toBeInTheDocument();
  });
});
