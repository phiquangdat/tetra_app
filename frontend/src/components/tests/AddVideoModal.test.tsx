import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AddVideoModal from '../admin/createModule/AddVideoModal';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';

// Mock ModuleContext hook
vi.mock('../../context/admin/ModuleContext', () => ({
  useModuleContext: () => ({
    id: 'module-1',
    updateModuleField: vi.fn(),
    setModuleState: vi.fn(),
  }),
}));

// Mock points helper
vi.mock('../../utils/pointsHelpers.ts', () => ({
  adjustModulePoints: vi.fn(async () => ({ id: 'module-1', points: 1234 })),
  applyModulePointsDelta: vi.fn(async () => ({ id: 'module-1', points: 1234 })),
}));

// Mock the content save API used by ContentBlockContext.saveContent
vi.mock('../../services/unit/content/unitContentApi.ts', () => ({
  saveVideoContent: vi.fn(async () => ({ id: 'new-video-id' })),
  updateVideoContent: vi.fn(),
  saveArticleContent: vi.fn(),
  updateArticleContent: vi.fn(),
  saveQuizContent: vi.fn(),
  updateQuizContent: vi.fn(),
}));

const AddVideoModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <AddVideoModal {...props} />
    </ContentBlockContextProvider>
  </UnitContextProvider>
);

describe('AddVideoModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it('renders the modal header', () => {
    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Video',
    );
  });

  it('disables Save until title, URL, and description are valid', async () => {
    const user = userEvent.setup();

    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const saveBtn = screen.getByRole('button', { name: /save/i });
    // initially disabled (empty fields)
    expect(saveBtn).toBeDisabled();

    // Title only -> still disabled
    await user.type(screen.getByLabelText(/title/i), 'Some title');
    expect(saveBtn).toBeDisabled();

    // Description only -> still disabled
    await user.type(screen.getByLabelText(/description/i), 'Short description');
    expect(saveBtn).toBeDisabled();

    // Invalid URL -> still disabled
    await user.type(
      screen.getByPlaceholderText('Paste video URL here (MP4 or YouTube)'),
      'notaurl',
    );
    expect(saveBtn).toBeDisabled();

    // Valid YouTube URL -> enabled
    const urlInput = screen.getByPlaceholderText(
      'Paste video URL here (MP4 or YouTube)',
    );
    await user.clear(urlInput);
    await user.type(urlInput, 'https://youtu.be/dQw4w9WgXcQ');

    await waitFor(() => {
      expect(saveBtn).toBeEnabled();
    });
  });

  it('saves video and calls onClose with valid input', async () => {
    const user = userEvent.setup();
    const { saveVideoContent } = await import(
      '../../services/unit/content/unitContentApi'
    );

    render(
      <AddVideoModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    // Fill fields
    await user.type(screen.getByLabelText(/title/i), 'Test Video Title');
    await user.type(
      screen.getByLabelText(/description/i),
      'This is a test video description.',
    );
    await user.type(
      screen.getByPlaceholderText('Paste video URL here (MP4 or YouTube)'),
      'https://youtu.be/dQw4w9WgXcQ',
    );

    const saveBtn = screen.getByRole('button', { name: /save/i });
    await waitFor(() => expect(saveBtn).toBeEnabled());
    await user.click(saveBtn);

    // The ContentBlockContext uses saveVideoContent under the hood
    await waitFor(() => {
      expect(saveVideoContent).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalled();
    });

    // Optional: verify the payload shape (unit_id, content_type, etc.)
    const lastCallArg = (saveVideoContent as any).mock.calls[0][0];
    expect(lastCallArg).toMatchObject({
      unit_id: 'unit-1',
      content_type: 'video',
      title: 'Test Video Title',
      content: 'This is a test video description.',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      // sort_order will be computed (likely 0 on an empty unit) — just assert it’s a number
      sort_order: expect.any(Number),
    });
  });
});
