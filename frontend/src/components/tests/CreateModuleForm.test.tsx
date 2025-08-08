import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CreateModuleForm from '../admin/createModule/CreateModuleForm';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import * as validators from '../../utils/validators';

// Mock module API calls used under the hood by the context/hook
vi.mock('../../services/module/moduleApi.ts', () => ({
  createModule: vi.fn().mockResolvedValue({ id: 'mod-123', status: 'draft' }),
  updateModule: vi.fn().mockResolvedValue({ id: 'mod-123', status: 'draft' }),
  deleteModule: vi.fn().mockResolvedValue('deleted'),
}));

const renderWithProviders = () =>
  render(
    <MemoryRouter>
      <UnitContextProvider>
        <ModuleContextProvider>
          <CreateModuleForm />
        </ModuleContextProvider>
      </UnitContextProvider>
    </MemoryRouter>,
  );

beforeAll(() => {
  window.URL.revokeObjectURL = vi.fn();
  vi.stubGlobal('scrollTo', vi.fn());
});

describe('CreateModuleForm', () => {
  it('renders all form fields', async () => {
    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(true);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(true);

    renderWithProviders();

    expect(screen.getByLabelText(/module title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/module description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/module topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points awarded/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cover picture url/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save module/i }),
    ).toBeInTheDocument();
  });

  it('lets the user input values into fields & see cover preview', async () => {
    const user = userEvent.setup();
    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(true);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(true);

    renderWithProviders();

    const title = screen.getByLabelText(/module title/i);
    await user.clear(title);
    await user.type(title, 'React Basics');
    expect(title).toHaveValue('React Basics');

    const topic = screen.getByLabelText(/module topic/i);
    await user.selectOptions(topic, 'cybersecurity');
    expect(topic).toHaveValue('cybersecurity');

    const cover = screen.getByLabelText(/cover picture url/i);
    await user.clear(cover);
    await user.type(cover, 'https://example.com/image.jpg');
    expect(cover).toHaveValue('https://example.com/image.jpg');
  });

  it('shows an error banner when invalid image URL is provided and user tries to save', async () => {
    const user = userEvent.setup();
    // Make URL invalid so the form validation (formErrors) kicks in
    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(false);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(false);

    renderWithProviders();

    const cover = screen.getByLabelText(/cover picture url/i);
    await user.clear(cover);
    await user.type(cover, 'not-a-valid-url');

    // Click Save to trigger formErrors rendering
    await user.click(screen.getByRole('button', { name: /save module/i }));

    // The UI shows this exact message (from useModuleSave’s formErrors)
    expect(
      await screen.findByText(/cover picture must be a valid url/i),
    ).toBeInTheDocument();
  });

  it('saves a new module (create) and shows success banner', async () => {
    const user = userEvent.setup();
    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(true);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(true);

    renderWithProviders();

    await user.type(screen.getByLabelText(/module title/i), 'My New Module');
    await user.type(
      screen.getByLabelText(/module description/i),
      'A great module description.',
    );
    await user.selectOptions(
      screen.getByLabelText(/module topic/i),
      'cybersecurity',
    );
    const points = screen.getByLabelText(/points awarded/i);
    await user.clear(points);
    await user.type(points, '10');
    const cover = screen.getByLabelText(/cover picture url/i);
    await user.clear(cover);
    await user.type(cover, 'https://example.com/image.jpg');

    await user.click(screen.getByRole('button', { name: /save module/i }));

    // Success banner from CreateModuleForm (useModuleSave.successSaved)
    expect(
      await screen.findByText(/module saved successfully/i),
    ).toBeInTheDocument();
  });

  it('allows editing after initial save and saves updates (update)', async () => {
    const user = userEvent.setup();
    vi.spyOn(validators, 'isValidImageUrl').mockReturnValue(true);
    vi.spyOn(validators, 'isImageUrlRenderable').mockResolvedValue(true);

    renderWithProviders();

    // Initial save
    await user.type(screen.getByLabelText(/module title/i), 'Initial Title');
    await user.type(
      screen.getByLabelText(/module description/i),
      'Initial Description',
    );
    await user.selectOptions(
      screen.getByLabelText(/module topic/i),
      'cybersecurity',
    );
    const points = screen.getByLabelText(/points awarded/i);
    await user.clear(points);
    await user.type(points, '5');
    await user.type(
      screen.getByLabelText(/cover picture url/i),
      'https://example.com/image.jpg',
    );

    await user.click(screen.getByRole('button', { name: /save module/i }));

    // Success banner appears; read-only details view is rendered now
    expect(
      await screen.findByText(/module saved successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Initial Title')).toBeInTheDocument();

    // Go back to edit mode
    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Update fields and save again
    const title = await screen.findByLabelText(/module title/i);
    const desc = screen.getByLabelText(/module description/i);
    await user.clear(title);
    await user.type(title, 'Updated Title');
    await user.clear(desc);
    await user.type(desc, 'Updated Description');

    await user.click(screen.getByRole('button', { name: /save module/i }));

    // Success banner again
    expect(
      await screen.findByText(/module saved successfully/i),
    ).toBeInTheDocument();

    // After saving, it returns to read view again—assert updated values there
    expect(screen.getByText('Updated Title')).toBeInTheDocument();
    expect(screen.getByText('Updated Description')).toBeInTheDocument();
  });
});
