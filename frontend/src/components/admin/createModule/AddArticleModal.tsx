import { useState } from 'react';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: { title: string; content: string }) => void;
}

function AddArticleModal({ isOpen, onClose, onSave }: AddArticleModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSave({ title, content });
      setTitle('');
      setContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  const icons = {
    edit: (
      <svg
        className="svg-icon"
        style={{
          width: '1em',
          height: '1em',
          verticalAlign: 'middle',
          fill: 'currentColor',
          overflow: 'hidden',
        }}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M358.277408 561.800219c-0.596588 0.759293-1.193175 1.559519-1.461281 2.52245l-46.050826 168.836313c-2.685155 9.829879 0.065492 20.422122 7.342222 27.889187 5.442966 5.317099 12.614296 8.239662 20.252253 8.239662 2.52245 0 5.050016-0.301875 7.537673-0.962931l167.638021-45.722344c0.26913 0 0.399089 0.23536 0.601704 0.23536 1.925862 0 3.817955-0.700965 5.246491-2.161223l448.270537-448.205045c13.31526-13.332656 20.61655-31.494295 20.61655-51.254338 0-22.38994-9.496282-44.770669-26.126031-61.356416L919.809521 117.458155c-16.604166-16.629749-39.016619-26.143427-61.396325-26.143427-19.754926 0-37.915541 7.303336-51.264571 20.602224L358.944604 560.241724C358.478999 560.669466 358.609982 561.302893 358.277408 561.800219M923.791206 228.575906l-44.526099 44.49233-72.180949-73.327052 43.894719-43.895743c6.935969-6.973832 20.384259-5.956665 28.353768 2.041496l42.363853 42.402739c4.420683 4.41352 6.941086 10.289344 6.941086 16.099676C928.610978 221.151819 926.914336 225.473241 923.791206 228.575906M437.999101 568.842613l323.465043-323.483462 72.216765 73.376171-322.863339 322.847989L437.999101 568.842613 437.999101 568.842613zM379.065873 699.990558l23.375383-85.799108 62.352093 62.358233L379.065873 699.990558 379.065873 699.990558zM927.623487 406.192186c-16.968463 0-31.904641 13.796214-31.970132 30.994921l0 419.411255c0 21.913079-17.796318 38.907125-39.744189 38.907125L166.418752 895.505487c-21.914102 0-38.247092-16.991999-38.247092-38.907125L128.17166 166.360935c0-21.930475 16.331967-38.441521 38.247092-38.441521l473.184973 0c17.063631 0 30.908964-15.163351 30.908964-32.232099 0-17.034978-13.846356-31.68156-30.908964-31.68156L161.703357 64.005756c-53.42477 0-97.827049 44.216038-97.827049 97.67253l0 699.637518c0 53.458539 44.403303 98.422613 97.827049 98.422613l698.884364 0c53.463656 0 98.967012-44.964074 98.967012-98.422613l0-424.324148C959.489242 419.9884 944.587857 406.192186 927.623487 406.192186" />
      </svg>
    ),
    close: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="text-gray-600">{icons.edit}</div>
            <h2 className="text-lg font-medium text-gray-900">Article</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            {icons.close}
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="p-6 pb-0 flex-1 overflow-y-auto">
            <div className="mb-6 max-w-110">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div className="mb-6">
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your article..."
                className="w-full h-80 px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-00 outline-none transition-colors resize-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end p-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 w-24 h-10"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddArticleModal;
