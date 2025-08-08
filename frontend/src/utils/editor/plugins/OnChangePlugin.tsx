import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { useEditorStateContext } from '../contexts/EditorStateContext';
import { $generateHtmlFromNodes } from '@lexical/html';

export default function OnChangePlugin() {
  const [editor] = useLexicalComposerContext();
  const { setEditorContent } = useEditorStateContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        setEditorContent(html);
      });
    });
  }, [editor, setEditorContent]);

  return null;
}
