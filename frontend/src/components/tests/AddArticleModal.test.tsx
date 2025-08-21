import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddArticleModal from '../admin/createModule/AddArticleModal';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';
import { useEffect } from 'react';

vi.mock('../../context/admin/ModuleContext', () => ({
  useModuleContext: () => ({
    id: 'module-1',
    updateModuleField: vi.fn(),
    setModuleState: vi.fn(),
  }),
}));

vi.mock('../../utils/pointsHelpers.ts', () => ({
  adjustModulePoints: vi.fn(async () => ({ id: 'module-1', points: 1234 })),
}));

vi.mock('../../../utils/editor/EditorComposer.tsx', async () => {
  const React = await import('react');
  const { useEditorStateContext } = await import(
    '../../utils/editor/contexts/EditorStateContext'
  );
  return {
    default: function MockEditor() {
      const { setEditorContent } = useEditorStateContext();
      useEffect(() => {
        setEditorContent('Some article content');
      }, [setEditorContent]);
      return <div role="textbox" data-lexical-editor="true" />;
    },
  };
});

vi.mock('../../services/unit/content/unitContentApi.ts', () => ({
  saveArticleContent: vi.fn(async () => ({ id: 'new-article-id' })),
  updateArticleContent: vi.fn(),
  saveVideoContent: vi.fn(),
  updateVideoContent: vi.fn(),
  saveQuizContent: vi.fn(),
  updateQuizContent: vi.fn(),
}));

const AddArticleModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <EditorStateProvider>
        <AddArticleModal {...props} />
      </EditorStateProvider>
    </ContentBlockContextProvider>
  </UnitContextProvider>
);

describe('AddArticleModal (new version)', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it('renders the modal header', () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /Add New Article/i,
    );
  });

  it('Save is disabled with empty title, then enabled after typing title (editor is initialized non-empty)', async () => {
    const user = userEvent.setup();

    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    // Initially title is empty -> Save disabled
    expect(saveButton).toBeDisabled();

    // Type title — editor is already initialized with "<p></p>", so Save becomes enabled
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'My Title');
    expect(saveButton).toBeEnabled();
  });

  it('saves article and calls onClose with valid input', async () => {
    const user = userEvent.setup();
    const { saveArticleContent } = await import(
      '../../services/unit/content/unitContentApi'
    );

    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Article Title');

    const textboxes = screen.getAllByRole('textbox');
    const editor = textboxes.find(
      (el) =>
        el.getAttribute('contenteditable') === 'true' ||
        el.getAttribute('data-lexical-editor') === 'true',
    );
    expect(editor).toBeTruthy();

    // Type some content
    if (editor) {
      await user.click(editor);
      await user.type(editor, 'Some article content');
    }

    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    expect(saveArticleContent).toHaveBeenCalledTimes(1);
  });

  it('renders a single-file input labeled "Attachment" after the Title field', () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        unitId="unit-1"
        unitNumber={1}
      />,
    );

    const titleInput = screen.getByLabelText('Title');
    const fileInput = screen.getByLabelText('Attachment') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).not.toHaveAttribute('multiple');

    const isAfter =
      (titleInput.compareDocumentPosition(fileInput) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
      0;
    expect(isAfter).toBe(true);
  });
});
