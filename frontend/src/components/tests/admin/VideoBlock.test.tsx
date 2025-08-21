import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../context/admin/ModuleContext.tsx', () => ({
  useModuleContext: () => ({
    id: undefined,
    updateModuleField: vi.fn(),
    setModuleState: vi.fn(),
    isEditing: false,
    setIsEditing: vi.fn(),
    isDirty: false,
  }),
  ModuleContextProvider: ({ children }: any) => children,
}));

vi.mock('../../../services/unit/unitApi', () => ({
  fetchVideoContentById: vi.fn(),
}));

import * as videoHelpers from '../../../utils/videoHelpers';
import { fetchVideoContentById } from '../../../services/unit/unitApi';
import { UnitContextProvider } from '../../../context/admin/UnitContext';
import VideoBlock from '../../../components/admin/module/VideoBlock';

const mockVideo = {
  id: '1',
  title: 'Demo Video',
  url: 'https://youtube.com/embed/demo',
  content: 'Demo content',
  points: 7,
};

describe('VideoBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(videoHelpers, 'validateVideoUrl').mockReturnValue({
      isValid: true,
      isYouTube: true,
      embedUrl: 'https://youtube.com/embed/demo',
    });
  });

  it('fetches and displays video details', async () => {
    (fetchVideoContentById as unknown as vi.Mock).mockResolvedValueOnce(
      mockVideo,
    );

    render(
      <UnitContextProvider>
        <VideoBlock id="1" />
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Video title')).toBeInTheDocument();
      expect(screen.getByText('Demo Video')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Demo content')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });
});
