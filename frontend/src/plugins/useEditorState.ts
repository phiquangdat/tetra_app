import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';

export interface TextFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export type AlignmentType = 'left' | 'center' | 'right' | 'justify';
export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export function useEditorState() {
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