import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import { useEffect, useState } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Update toolbar state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
      });
    });
  }, [editor]);

  const buttonStyle = (active: boolean) =>
    `p-1 rounded-md hover:bg-gray-200 transition ${
      active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
    }`;

  return (
    <div className="flex gap-2 border-b border-gray-300 mb-2 px-2 py-1">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={buttonStyle(isBold)}
        aria-label="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={buttonStyle(isItalic)}
        aria-label="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={buttonStyle(isUnderline)}
        aria-label="Underline"
      >
        <Underline size={18} />
      </button>
    </div>
  );
}
