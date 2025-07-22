import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  $isListItemNode,
} from '@lexical/list';
import { $createHeadingNode } from '@lexical/rich-text';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback } from 'react';
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
  List,
  ListOrdered,
  ListX,
  Indent,
  Outdent,
  Image,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { HeadingSelect, type BlockType } from './HeadingSelect';
import {
  useEditorState,
  type AlignmentType,
  type TextFormats,
} from './useEditorState';
import { useUndoRedo } from './useUndoRedo';
import { $createImageNode } from '../nodes/ImageNode';

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
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignmentType);
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
        if ($isListNode(blockElement) || $isListItemNode(blockElement)) return;

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

  const handleIndent = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isListItemNode(node) || $isListItemNode(parent)) return;

      editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    });
  }, [editor]);

  const handleOutdent = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isListItemNode(node) || $isListItemNode(parent)) return;

      editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    });
  }, [editor]);

  const handleInsertUnorderedList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const topBlock = node.getTopLevelElementOrThrow();
      if ($isListItemNode(topBlock) || topBlock.getIndent?.() > 0) return;

      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    });
  }, [editor]);

  const handleInsertOrderedList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const node = selection.anchor.getNode();
      const topBlock = node.getTopLevelElementOrThrow();
      if ($isListItemNode(topBlock) || topBlock.getIndent?.() > 0) return;

      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    });
  }, [editor]);

  const handleInsertImage = useCallback(() => {
    const url = prompt('Enter image URL');
    if (!url) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const imageNode = $createImageNode({
        src: url,
        altText: 'Inserted image',
        width: 800,
      });

      const paragraphNode = $createParagraphNode();

      // Insert image and new paragraph
      selection.insertNodes([imageNode, paragraphNode]);

      // Move cursor to the new paragraph
      paragraphNode.selectStart();
    });
  }, [editor]);

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-gray-300 mb-2 px-2 py-1 bg-white"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      <HeadingSelect value={blockType} onChange={handleHeadingChange} />

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

      <div className="flex items-center gap-1">
        {[
          { type: 'left', icon: AlignLeft, label: 'Align left' },
          { type: 'center', icon: AlignCenter, label: 'Align center' },
          { type: 'right', icon: AlignRight, label: 'Align right' },
          { type: 'justify', icon: AlignJustify, label: 'Align justify' },
        ].map(({ type, icon: Icon, label }) => (
          <ToolbarButton
            key={type}
            onClick={() => handleAlignment(type as AlignmentType)}
            active={alignment === type}
            aria-label={label}
          >
            <Icon size={18} />
          </ToolbarButton>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={handleInsertUnorderedList}
          aria-label="Unordered list"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleInsertOrderedList}
          aria-label="Ordered list"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
          aria-label="Remove list"
        >
          <ListX size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={handleIndent} aria-label="Indent">
          <Indent size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={handleOutdent} aria-label="Outdent">
          <Outdent size={18} />
        </ToolbarButton>
      </div>

      <ToolbarButton onClick={handleInsertImage} aria-label="Insert image">
        <Image size={18} />
      </ToolbarButton>

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
