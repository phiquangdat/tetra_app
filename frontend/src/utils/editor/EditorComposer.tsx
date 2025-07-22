import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { TextNode, ParagraphNode, type EditorThemeClasses } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';

import { ImageNode } from './nodes/ImageNode';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import OnChangePlugin from './plugins/OnChangePlugin';
import Placeholder from './PlaceHolder';
import type { JSX } from 'react';

interface EditorComposerProps {
  initialValue?: string;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  autoFocus?: boolean;
  onError?: (error: Error) => void;
}

interface EditorConfig {
  namespace: string;
  onError: (error: Error) => void;
  nodes: Array<any>;
  theme: EditorThemeClasses;
  editorState?: string;
}

// Theme configuration
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

// Node configuration
const getEditorNodes = () => [
  TextNode,
  ParagraphNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  ImageNode,
];

const defaultErrorHandler = (error: Error) => {
  console.error('Editor error:', error);
  throw error;
};

// Create editor configuration
const createEditorConfig = (
  onError?: (error: Error) => void,
  initialValue?: string,
): EditorConfig => ({
  namespace: 'ArticleEditor',
  onError: onError || defaultErrorHandler,
  nodes: getEditorNodes(),
  theme: createEditorTheme(),
  editorState: initialValue,
});

interface ContentEditableProps {
  minHeight: string;
  className?: string;
}

function EditorContentEditable({
  minHeight,
  className = '',
}: ContentEditableProps) {
  const baseClasses = 'min-h-[300px] outline-none p-4';

  return (
    <ContentEditable
      role="textbox"
      aria-label="Article content"
      className={`${baseClasses} ${className}`}
      style={{ minHeight }}
    />
  );
}

interface ErrorBoundaryProps {
  onError?: (error: Error) => void;
  children: JSX.Element;
}

function EditorErrorBoundary({ onError, children }: ErrorBoundaryProps) {
  const handleError = (error: Error) => {
    if (onError) {
      onError(error);
    } else {
      defaultErrorHandler(error);
    }
  };

  return (
    <LexicalErrorBoundary onError={handleError}>
      {children}
    </LexicalErrorBoundary>
  );
}

export default function EditorComposer({
  initialValue,
  minHeight = '300px',
  className = '',
  autoFocus = true,
  onError,
}: EditorComposerProps = {}) {
  const editorConfig = createEditorConfig(onError, initialValue);

  const containerClasses = `
    border 
    border-gray-400 
    rounded-lg 
    p-2
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarPlugin />

        <RichTextPlugin
          contentEditable={<EditorContentEditable minHeight={minHeight} />}
          placeholder={<Placeholder />}
          ErrorBoundary={({ children }) => (
            <EditorErrorBoundary
              onError={onError}
              children={children as JSX.Element}
            />
          )}
        />

        <OnChangePlugin />
        <HistoryPlugin />
        <ListPlugin />
        <TabIndentationPlugin />

        {autoFocus && <AutoFocusPlugin />}
      </LexicalComposer>
    </div>
  );
}

export { createEditorConfig, createEditorTheme, getEditorNodes };
export type { EditorComposerProps, EditorConfig };
