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
  it('renders the Create New Module heading', async () => {
    renderWithProviders(<CreateModulePage />);
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: /create new module/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the Module Details section', async () => {
    renderWithProviders(<CreateModulePage />);
    const details = await screen.findByText(/module details/i);
    expect(details).toBeInTheDocument();
  });

  it('renders the Add new unit button', async () => {
    renderWithProviders(<CreateModulePage />);
    const addUnitButton = await screen.findByRole('button', {
      name: /add new unit/i,
    });
    expect(addUnitButton).toBeInTheDocument();
  });
});
