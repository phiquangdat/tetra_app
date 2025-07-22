import { createContext, useContext, useState } from 'react';

interface EditorStateContextType {
  editorContent: string;
  setEditorContent: (content: string) => void;
  onChange: (editorState: any) => void;
}

const EditorStateContext = createContext<EditorStateContextType | null>(null);

export const useEditorStateContext = () => {
  const ctx = useContext(EditorStateContext);
  if (!ctx) throw new Error('EditorStateContext not found');
  return ctx;
};

export const EditorStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [editorContent, setEditorContent] = useState('');

  const onChange = (editorState: any) => {
    editorState.read(() => {
      const html = JSON.stringify(editorState);
      setEditorContent(html);
    });
  };

  return (
    <EditorStateContext.Provider
      value={{ editorContent, setEditorContent, onChange }}
    >
      {children}
    </EditorStateContext.Provider>
  );
};
