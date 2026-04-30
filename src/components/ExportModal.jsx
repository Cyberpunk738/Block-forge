import { useState, useRef, useEffect } from 'react';
import { Download, Upload, X, Copy, Check, FileJson, FileText } from 'lucide-react';
import useStore from '../store/useStore';

/**
 * ExportModal — Modal for exporting/importing blocks as JSON or Markdown.
 *
 * Props:
 * - isOpen: boolean — Whether the modal is visible
 * - onClose: () => void — Callback to close the modal
 */

/**
 * Convert blocks array to a Markdown string.
 */
const blocksToMarkdown = (blocks) => {
  return blocks.map((block) => {
    switch (block.type) {
      case 'heading': {
        const level = block.content?.level || 1;
        const prefix = '#'.repeat(Math.min(level, 6));
        return `${prefix} ${block.content?.text || ''}`;
      }
      case 'text':
        return typeof block.content === 'string' ? block.content : '';
      case 'image': {
        const alt = block.content?.alt || 'Image';
        const url = block.content?.url || '';
        return url ? `![${alt}](${url})` : '';
      }
      case 'code': {
        const lang = block.content?.language || '';
        const code = block.content?.code || '';
        return `\`\`\`${lang}\n${code}\n\`\`\``;
      }
      case 'quote': {
        const text = block.content?.text || '';
        const author = block.content?.author;
        const lines = text.split('\n').map((l) => `> ${l}`).join('\n');
        return author ? `${lines}\n> — *${author}*` : lines;
      }
      case 'list': {
        const items = block.content?.items || [];
        const ordered = block.content?.ordered || false;
        return items.map((item, i) =>
          ordered ? `${i + 1}. ${item}` : `- ${item}`
        ).join('\n');
      }
      case 'divider':
        return '---';
      case 'callout': {
        const variant = (block.content?.variant || 'info').toUpperCase();
        const text = block.content?.text || '';
        return `> **${variant}:** ${text}`;
      }
      default:
        return `<!-- Unknown block type: ${block.type} -->`;
    }
  }).join('\n\n');
};

const ExportModal = ({ isOpen, onClose }) => {
  const blocks = useStore((s) => s.blocks);
  const [tab, setTab] = useState('json'); // 'json' | 'markdown' | 'import'
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const jsonOutput = JSON.stringify(blocks, null, 2);
  const markdownOutput = blocksToMarkdown(blocks);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setImportError('Invalid format: expected an array of blocks.');
        return;
      }
      // Validate basic block shape
      const valid = parsed.every((b) => b.id && b.type && 'content' in b);
      if (!valid) {
        setImportError('Invalid format: each block needs id, type, and content.');
        return;
      }
      // Replace blocks in store via localStorage + reload approach
      localStorage.setItem('blockforge-blocks', JSON.stringify(parsed));
      window.location.reload();
    } catch (err) {
      setImportError('Invalid JSON. Please check your input.');
    }
  };

  const tabs = [
    { key: 'json', label: 'JSON', icon: FileJson },
    { key: 'markdown', label: 'Markdown', icon: FileText },
    { key: 'import', label: 'Import', icon: Upload },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg mx-4 bg-bg-secondary border border-border-default rounded-2xl
                   shadow-2xl shadow-black/50 overflow-hidden"
        style={{ animation: 'blockSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <h2 className="text-base font-semibold text-text-primary">Export / Import</h2>
          <button
            id="export-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary 
                       hover:bg-bg-hover transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-default">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`export-tab-${key}`}
              onClick={() => { setTab(key); setCopied(false); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium
                         transition-colors duration-150 border-b-2
                         ${tab === key
                           ? 'text-accent border-accent'
                           : 'text-text-muted hover:text-text-primary border-transparent'
                         }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {tab === 'json' && (
            <div className="space-y-3">
              <pre className="bg-bg-tertiary border border-border-default rounded-lg p-4 
                             text-xs font-mono text-text-secondary overflow-auto max-h-72
                             leading-relaxed">
                {jsonOutput}
              </pre>
              <div className="flex gap-2">
                <button
                  id="export-copy-json"
                  onClick={() => handleCopy(jsonOutput)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  id="export-download-json"
                  onClick={() => handleDownload(jsonOutput, 'blockforge-export.json', 'application/json')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-bg-tertiary text-text-secondary border border-border-default
                             hover:text-text-primary hover:border-border-hover 
                             transition-colors duration-150"
                >
                  <Download size={15} />
                  Download .json
                </button>
              </div>
            </div>
          )}

          {tab === 'markdown' && (
            <div className="space-y-3">
              <pre className="bg-bg-tertiary border border-border-default rounded-lg p-4 
                             text-xs font-mono text-text-secondary overflow-auto max-h-72
                             leading-relaxed whitespace-pre-wrap">
                {markdownOutput || '(No blocks to export)'}
              </pre>
              <div className="flex gap-2">
                <button
                  id="export-copy-md"
                  onClick={() => handleCopy(markdownOutput)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </button>
                <button
                  id="export-download-md"
                  onClick={() => handleDownload(markdownOutput, 'blockforge-export.md', 'text/markdown')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-bg-tertiary text-text-secondary border border-border-default
                             hover:text-text-primary hover:border-border-hover 
                             transition-colors duration-150"
                >
                  <Download size={15} />
                  Download .md
                </button>
              </div>
            </div>
          )}

          {tab === 'import' && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Paste a BlockForge JSON export to import blocks. 
                <span className="text-text-muted"> This will replace all current blocks.</span>
              </p>
              <textarea
                id="export-import-textarea"
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                placeholder='[{"id":"...","type":"text","content":"Hello"}]'
                rows={8}
                className="w-full bg-bg-tertiary border border-border-default rounded-lg p-4
                           text-xs font-mono text-text-primary placeholder-text-placeholder
                           resize-none outline-none focus:border-border-focus
                           transition-colors duration-200"
              />
              {importError && (
                <p className="text-xs text-danger">{importError}</p>
              )}
              <button
                id="export-import-btn"
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           bg-accent text-white hover:bg-accent-hover 
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors duration-150"
              >
                <Upload size={15} />
                Import Blocks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
