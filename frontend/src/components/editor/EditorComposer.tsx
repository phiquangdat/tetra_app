import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import ToolbarPlugin from '../../plugins/ToolbarPlugin';
import OnChangePlugin from '../../plugins/OnChangePlugin';
import Placeholder from '../../context/editor/PlaceHolder';

const editorConfig = {
  namespace: 'ArticleEditor',
  onError: (error: Error) => {
    throw error;
  },
  nodes: [],
  theme: {
    paragraph: 'mb-2',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
  },
};

const EditorComposer = () => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border border-gray-400 rounded-lg p-2">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[300px] outline-none p-4" />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
};

export default EditorComposer;
