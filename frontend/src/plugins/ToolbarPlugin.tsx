import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FORMAT_ELEMENT_COMMAND } from 'lexical';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [alignment, setAlignment] = useState<string>('left');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setFormats({
            bold: selection.hasFormat('bold'),
            italic: selection.hasFormat('italic'),
            underline: selection.hasFormat('underline'),
            strikethrough: selection.hasFormat('strikethrough'),
          });

          const node = selection.getNodes()[0];
          const parent = node.getParentOrThrow();
          if (parent?.getFormatType) {
            setAlignment(parent.getFormatType());
          } else {
            setAlignment('left');
          }
        }
      });
    });
  }, [editor]);

  const formatButton = (active: boolean) =>
    `p-1 rounded-md hover:bg-gray-200 transition ${
      active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
    }`;

  const alignButton = (align: string) =>
    `p-1 rounded-md hover:bg-gray-200 transition ${
      alignment === align ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
    }`;

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-300 mb-2 px-2 py-1">
      {/* FORMAT BUTTONS */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={formatButton(formats.bold)}
        aria-label="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={formatButton(formats.italic)}
        aria-label="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={formatButton(formats.underline)}
        aria-label="Underline"
      >
        <Underline size={18} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        className={formatButton(formats.strikethrough)}
        aria-label="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>

      {/* ALIGNMENT BUTTONS */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        className={alignButton('left')}
        aria-label="Align Left"
      >
        <AlignLeft size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        className={alignButton('center')}
        aria-label="Align Center"
      >
        <AlignCenter size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        className={alignButton('right')}
        aria-label="Align Right"
      >
        <AlignRight size={18} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
        }
        className={alignButton('justify')}
        aria-label="Align Justify"
      >
        <AlignJustify size={18} />
      </button>
    </div>
  );
}
