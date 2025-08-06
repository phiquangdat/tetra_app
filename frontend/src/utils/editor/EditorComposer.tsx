import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

import { TextNode, ParagraphNode, type EditorThemeClasses } from 'lexical';
// import { useEditorStateContext } from './contexts/EditorStateContext';
import { ImageNode } from './nodes/ImageNode';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import OnChangePlugin from './plugins/OnChangePlugin';
import Placeholder from './PlaceHolder';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';

interface EditorComposerProps {
  initialHTML?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onError?: (error: Error) => void;
}

const createEditorTheme = (): EditorThemeClasses => ({
  paragraph: 'mb-2',
  list: {
    ul: 'list-disc list-inside ml-6',
    ol: 'list-decimal list-inside ml-6',
    listitem: 'mb-1',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
  heading: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',
    h5: 'text-base font-medium',
    h6: 'text-sm font-medium',
  },
  align: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  },
});

const getEditorNodes = () => [
  TextNode,
  ParagraphNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  ImageNode,
];

function LoadInitialContent({ initialHTML }: { initialHTML?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initialHTML) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHTML, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }, [editor, initialHTML]);

  return null;
}

export default function EditorComposer({
  initialHTML = '<p></p>',
  className = '',
  autoFocus = true,
  onError,
}: EditorComposerProps) {
  const editorConfig: InitialConfigType = {
    namespace: 'ArticleEditor',
    onError:
      onError ||
      ((e) => {
        throw e;
      }),
    nodes: getEditorNodes(),
    theme: createEditorTheme(),
  };

  return (
    <div className={`border border-gray-400 rounded-lg p-2 ${className}`}>
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="h-[400px] overflow-y-auto outline-none p-4 rounded-md" />
          }
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin />
        <HistoryPlugin />
        <ListPlugin />
        <TabIndentationPlugin />
        {autoFocus && <AutoFocusPlugin />}
        <LoadInitialContent initialHTML={initialHTML} />
      </LexicalComposer>
    </div>
  );
}
