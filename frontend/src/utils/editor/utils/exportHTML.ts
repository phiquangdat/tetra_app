import { $generateHtmlFromNodes } from '@lexical/html';
import type { LexicalEditor } from 'lexical';

export function generateHtml(editor: LexicalEditor): string {
  let html = '';
  editor.update(() => {
    html = $generateHtmlFromNodes(editor, null);
  });
  return html;
}
