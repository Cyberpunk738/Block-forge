import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { markdownToBlocks } from './markdownToBlocks';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

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

  if (name.endsWith('.txt')) {
    const text = await readAsText(file);
    return markdownToBlocks(text);
  }

  if (name.endsWith('.docx')) {
    const md = await convertDocxToMarkdown(file);
    return markdownToBlocks(md);
  }

  throw new Error(`Unsupported file type: ${file.name}. Please upload a .txt or .docx file.`);
}
