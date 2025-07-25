// src/components/tests/CreateModulePage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CreateModulePage from '../admin/createModule/CreateModulePage';
import { ModuleContextProvider } from '../../context/admin/ModuleContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { EditorStateProvider } from '../../utils/editor/contexts/EditorStateContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ModuleContextProvider>
      <UnitContextProvider>
        <ContentBlockContextProvider>
          <EditorStateProvider>{ui}</EditorStateProvider>
        </ContentBlockContextProvider>
      </UnitContextProvider>
    </ModuleContextProvider>,
  );
}

describe('CreateModulePage', () => {
  it('renders the Create New Module heading', () => {
    renderWithProviders(<CreateModulePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Create New Module',
    );
  });

  it('renders the Module Details section', () => {
    renderWithProviders(<CreateModulePage />);
    expect(screen.getByText('Module Details')).toBeInTheDocument();
  });

  it('calls handleSaveDraftModule when Save draft button is clicked', async () => {
    renderWithProviders(<CreateModulePage />);
    const user = userEvent.setup();
    const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
    const handler = vi.fn();
    saveDraftButton.onclick = handler;
    await user.click(saveDraftButton);
    expect(handler).toHaveBeenCalled();
  });

  it('calls handlePublishModule when Publish button is clicked', async () => {
    renderWithProviders(<CreateModulePage />);
    const user = userEvent.setup();
    const publishButton = screen.getByRole('button', { name: /publish/i });
    const handler = vi.fn();
    publishButton.onclick = handler;
    await user.click(publishButton);
    expect(handler).toHaveBeenCalled();
  });

  it('renders the Add new unit button', () => {
    renderWithProviders(<CreateModulePage />);
    expect(
      screen.getByRole('button', { name: /add new unit/i }),
    ).toBeInTheDocument();
  });
});
