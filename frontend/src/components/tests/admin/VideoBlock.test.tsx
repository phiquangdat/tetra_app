import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoBlock from '../../../components/admin/module/VideoBlock';
import { fetchVideoContentById } from '../../../services/unit/unitApi';
import * as videoHelpers from '../../../utils/videoHelpers';
import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('../../../services/unit/unitApi', () => ({
  fetchVideoContentById: vi.fn(),
}));

const mockVideo = {
  id: '1',
  title: 'Demo Video',
  url: 'https://youtube.com/embed/demo',
  content: 'Demo content',
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
    (fetchVideoContentById as any).mockResolvedValueOnce(mockVideo);
    render(<VideoBlock id="1" />);

    await waitFor(() => {
      expect(screen.getByText('Video title')).toBeInTheDocument();
      expect(screen.getByText('Demo Video')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });
});
