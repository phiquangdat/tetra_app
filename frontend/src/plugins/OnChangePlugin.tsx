import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { useEditorStateContext } from '../context/editor/EditorStateContext';

export default function OnChangePlugin() {
  const [editor] = useLexicalComposerContext();
  const { setEditorContent } = useEditorStateContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const json = JSON.stringify(editorState);
        setEditorContent(json);
      });
    });
  }, [editor]);

  return null;
}
