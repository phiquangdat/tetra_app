import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TextNode, ParagraphNode } from 'lexical';

import ToolbarPlugin from '../../plugins/ToolbarPlugin';
import OnChangePlugin from '../../plugins/OnChangePlugin';
import Placeholder from '../../context/editor/PlaceHolder';

const editorConfig = {
  namespace: 'ArticleEditor',
  onError: (error: Error) => {
    throw error;
  },
  nodes: [TextNode, ParagraphNode],
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
    },
    heading: {
      h1: 'text-2xl font-bold',
      h2: 'text-xl font-semibold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
};

export default function EditorComposer() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border border-gray-400 rounded-lg p-2">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[300px] outline-none p-4" />
          }
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
}
