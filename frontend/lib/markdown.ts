// lib/markdown.ts
import { marked } from 'marked';

export async function formatMarkdown(text: string): Promise<string> {
    const html = await marked(text, {
        breaks: true, // quebra linha com \n
    });
    return html;
}