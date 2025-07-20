import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';
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
import { $isHeadingNode, $createHeadingNode } from '@lexical/rich-text';

const headingTags = ['paragraph', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [alignment, setAlignment] = useState<string>('left');
  const [blockType, setBlockType] = useState<string>('paragraph');

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

          const anchorNode = selection.anchor.getNode();
          const topNode = anchorNode.getTopLevelElementOrThrow();

          setAlignment(topNode.getFormatType?.() ?? 'left');
          setBlockType(
            $isHeadingNode(topNode) ? topNode.getTag() : 'paragraph',
          );
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

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBlockType(value);

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        for (const node of selection.getNodes()) {
          const topNode = node.getTopLevelElementOrThrow();

          if (value === 'paragraph') {
            if ($isHeadingNode(topNode)) {
              const paragraph = $createParagraphNode();
              paragraph.append(...topNode.getChildren());
              topNode.replace(paragraph);
            }
          } else if ($isHeadingNode(topNode)) {
            topNode.setTag(value as any);
          } else {
            const heading = $createHeadingNode(value as any);
            if (
              'getChildren' in topNode &&
              typeof topNode.getChildren === 'function'
            ) {
              heading.append(...topNode.getChildren());
            }
            topNode.replace(heading);
          }
        }
      }
    });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-gray-300 mb-2 px-2 py-1"
      role="toolbar"
    >
      {/* Heading Dropdown */}
      <select
        value={blockType}
        onChange={handleHeadingChange}
        className="text-sm border border-gray-300 rounded p-1"
        aria-label="Block type"
      >
        {headingTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag === 'paragraph' ? 'Paragraph' : `Heading ${tag.slice(1)}`}
          </option>
        ))}
      </select>

      {/* FORMAT BUTTONS */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={formatButton(formats.bold)}
        aria-label="Bold"
        aria-pressed={formats.bold}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={formatButton(formats.italic)}
        aria-label="Italic"
        aria-pressed={formats.italic}
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={formatButton(formats.underline)}
        aria-label="Underline"
        aria-pressed={formats.underline}
      >
        <Underline size={18} />
      </button>
      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
        className={formatButton(formats.strikethrough)}
        aria-label="Strikethrough"
        aria-pressed={formats.strikethrough}
      >
        <Strikethrough size={18} />
      </button>

      {/* ALIGNMENT BUTTONS */}
      {['left', 'center', 'right', 'justify'].map((alignmentType) => (
        <button
          key={alignmentType}
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignmentType as any)
          }
          className={alignButton(alignmentType)}
          aria-label={`Align ${alignmentType}`}
          aria-pressed={alignment === alignmentType}
        >
          {
            {
              left: <AlignLeft size={18} />,
              center: <AlignCenter size={18} />,
              right: <AlignRight size={18} />,
              justify: <AlignJustify size={18} />,
            }[alignmentType]
          }
        </button>
      ))}
    </div>
  );
}
