import { validateBlocks } from './validateBlocks.js';
import { markdownToBlocks } from './markdownToBlocks.js';

/**
 * Read a File object and return its text content.
 * Works for .txt files.
 */
function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Read a .docx File as ArrayBuffer and convert to markdown via mammoth + turndown.
 */
async function convertDocxToMarkdown(file) {
  const [{ default: mammoth }, { default: TurndownService }] = await Promise.all([import('mammoth'), import('turndown')]);
  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  return turndown.turndown(result.value);
}

/**
 * Convert an uploaded document file into an array of blocks.
 *
 * Supported formats:
 *   - .txt   → read as plain text, parse as markdown
 *   - .docx  → convert via mammoth → turndown → markdown → blocks
 *
 * @param {File} file - A File object from a file input
 * @returns {Promise<Array<{id: string, type: string, content: any}>>}
 */
export async function convertDocumentToBlocks(file) {
  const name = file.name.toLowerCase();

  if (file.size > 20 * 1024 * 1024) throw new Error('Please choose a file smaller than 20 MB.');
  if (name.endsWith('.json')) return validateBlocks(JSON.parse(await readAsText(file)));

  if (/\.(txt|md|markdown)$/.test(name)) {
    const text = await readAsText(file);
    return markdownToBlocks(text);
  }

  if (name.endsWith('.docx')) {
    const md = await convertDocxToMarkdown(file);
    return markdownToBlocks(md);
  }

  throw new Error(`Unsupported file type: ${file.name}. Please upload a .txt, .md, .json or .docx file.`);
}
