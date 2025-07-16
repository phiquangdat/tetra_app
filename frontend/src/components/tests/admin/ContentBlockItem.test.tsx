import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentBlockItem from '../../../components/admin/module/ContentBlockItem';

vi.mock('../../../components/admin/module/VideoBlock', () => ({
  default: () => <div>Mocked VideoBlock</div>,
}));

vi.mock('../../../components/admin/module/ArticleBlock', () => ({
  default: () => <div>Mocked ArticleBlock</div>,
}));

describe('ContentBlockItem', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <ContentBlockItem id="1" type="video" isOpen={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders video block when open and type is video', () => {
    render(<ContentBlockItem id="1" type="video" isOpen={true} />);
    expect(screen.getByText('Mocked VideoBlock')).toBeInTheDocument(); // ✅ match mock
  });

  it('renders article block when type is article', () => {
    render(<ContentBlockItem id="2" type="article" isOpen={true} />);
    expect(screen.getByText('Mocked ArticleBlock')).toBeInTheDocument(); // ✅ match mock
  });

  it('renders fallback for unsupported type', () => {
    render(<ContentBlockItem id="3" type="other" isOpen={true} />);
    expect(screen.getByText(/unsupported content type/i)).toBeInTheDocument();
  });
});
