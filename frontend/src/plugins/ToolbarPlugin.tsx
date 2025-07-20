import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  type ElementFormatType,
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
  Undo2,
  Redo2,
} from 'lucide-react';
import {
  $isHeadingNode,
  $createHeadingNode,
  type HeadingTagType,
} from '@lexical/rich-text';

interface TextFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

type BlockType = 'paragraph' | HeadingTagType;
type AlignmentType = 'left' | 'center' | 'right' | 'justify';

const HEADING_OPTIONS: { value: BlockType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
];

const ALIGNMENT_OPTIONS: {
  type: AlignmentType;
  icon: React.ComponentType<{ size: number }>;
  label: string;
}[] = [
  { type: 'left', icon: AlignLeft, label: 'Align left' },
  { type: 'center', icon: AlignCenter, label: 'Align center' },
  { type: 'right', icon: AlignRight, label: 'Align right' },
  { type: 'justify', icon: AlignJustify, label: 'Align justify' },
];

// Custom hooks
function useUndoRedo() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const unregisterUndo = editor.registerCommand<boolean>(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const unregisterRedo = editor.registerCommand<boolean>(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUndo();
      unregisterRedo();
    };
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return { canUndo, canRedo, undo, redo };
}

function useEditorState() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState<TextFormats>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const [alignment, setAlignment] = useState<AlignmentType>('left');
  const [blockType, setBlockType] = useState<BlockType>('paragraph');

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        setFormats({
          bold: selection.hasFormat('bold'),
          italic: selection.hasFormat('italic'),
          underline: selection.hasFormat('underline'),
          strikethrough: selection.hasFormat('strikethrough'),
        });

        const anchorNode = selection.anchor.getNode();
        const topNode = anchorNode.getTopLevelElementOrThrow();

        setAlignment((topNode.getFormatType?.() ?? 'left') as AlignmentType);
        setBlockType($isHeadingNode(topNode) ? topNode.getTag() : 'paragraph');
      });
    });
  }, [editor]);

  return { formats, alignment, blockType };
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  'aria-label': string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  'aria-label': ariaLabel,
  children,
}: ToolbarButtonProps) {
  const baseClasses = 'p-1 rounded-md transition-colors';
  const activeClasses = active ? 'bg-blue-100 text-blue-600' : 'text-gray-700';
  const disabledClasses = disabled
    ? 'text-gray-400 cursor-not-allowed'
    : 'hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
      aria-label={ariaLabel}
      aria-pressed={active}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}

interface HeadingSelectProps {
  value: BlockType;
  onChange: (value: BlockType) => void;
}

function HeadingSelect({ value, onChange }: HeadingSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as BlockType);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="text-sm border border-gray-300 rounded p-1 bg-white"
      aria-label="Block type"
    >
      {HEADING_OPTIONS.map(({ value: optionValue, label }) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { formats, alignment, blockType } = useEditorState();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();

  const handleTextFormat = useCallback(
    (format: keyof TextFormats) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const handleAlignment = useCallback(
    (alignmentType: AlignmentType) => {
      editor.dispatchCommand(
        FORMAT_ELEMENT_COMMAND,
        alignmentType as ElementFormatType,
      );
    },
    [editor],
  );

  const handleHeadingChange = useCallback(
    (newBlockType: BlockType) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchorNode = selection.anchor.getNode();
        const blockElement = anchorNode.getTopLevelElementOrThrow();
        const currentFormat = blockElement.getFormatType?.() ?? 'left';

        const newNode =
          newBlockType === 'paragraph'
            ? $createParagraphNode()
            : $createHeadingNode(newBlockType);

        newNode.setFormat(currentFormat);
        newNode.append(...blockElement.getChildren());
        blockElement.replace(newNode);
      });
    },
    [editor],
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-gray-300 mb-2 px-2 py-1 bg-white"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Block Type Selection */}
      <HeadingSelect value={blockType} onChange={handleHeadingChange} />

      {/* Text Format Buttons */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => handleTextFormat('bold')}
          active={formats.bold}
          aria-label="Bold"
        >
          <Bold size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => handleTextFormat('italic')}
          active={formats.italic}
          aria-label="Italic"
        >
          <Italic size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => handleTextFormat('underline')}
          active={formats.underline}
          aria-label="Underline"
        >
          <Underline size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => handleTextFormat('strikethrough')}
          active={formats.strikethrough}
          aria-label="Strikethrough"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
      </div>

      {/* Alignment Buttons */}
      <div className="flex items-center gap-1">
        {ALIGNMENT_OPTIONS.map(({ type, icon: Icon, label }) => (
          <ToolbarButton
            key={type}
            onClick={() => handleAlignment(type)}
            active={alignment === type}
            aria-label={label}
          >
            <Icon size={18} />
          </ToolbarButton>
        ))}
      </div>

      {/* Undo/Redo Buttons */}
      <div className="flex items-center gap-1 ml-auto">
        <ToolbarButton onClick={undo} disabled={!canUndo} aria-label="Undo">
          <Undo2 size={18} />
        </ToolbarButton>

        <ToolbarButton onClick={redo} disabled={!canRedo} aria-label="Redo">
          <Redo2 size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
}
