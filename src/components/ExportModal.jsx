import { useState, useRef, useEffect } from 'react';
import { Download, Upload, X, Copy, Check, FileJson, FileText, FileUp, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { convertDocumentToBlocks } from '../utils/documentImport';

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
  const replaceAllBlocks = useStore((s) => s.replaceAllBlocks);
  const [tab, setTab] = useState('json');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const modalRef = useRef(null);

  // Document import state
  const [docFile, setDocFile] = useState(null);
  const [docImporting, setDocImporting] = useState(false);
  const [docError, setDocError] = useState('');
  const fileInputRef = useRef(null);

  const switchTab = (key) => {
    setTab(key);
    setCopied(false);
    setDocFile(null);
    setDocError('');
    setDocImporting(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      setDocError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setDocFile(file);
      setDocError('');
    }
  };

  const handleConvertAndImport = async () => {
    if (!docFile) return;
    setDocImporting(true);
    setDocError('');
    try {
      const newBlocks = await convertDocumentToBlocks(docFile);
      if (newBlocks.length === 0) {
        setDocError('No blocks could be extracted from the document.');
        return;
      }
      replaceAllBlocks(newBlocks);
      onClose();
    } catch (err) {
      setDocError(err.message || 'Failed to convert document.');
    } finally {
      setDocImporting(false);
    }
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setImportError('Invalid format: expected an array of blocks.');
        return;
      }
      const valid = parsed.every((b) => b.id && b.type && 'content' in b);
      if (!valid) {
        setImportError('Invalid format: each block needs id, type, and content.');
        return;
      }
      replaceAllBlocks(parsed);
      onClose();
    } catch {
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.15s ease-out forwards' }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-bg-primary border border-border-default rounded-2xl
                   shadow-2xl shadow-black/20 overflow-hidden"
        style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-secondary/50">
          <h2 id="modal-title" className="text-sm font-bold text-text-primary tracking-tight">Export / Import Document</h2>
          <button
            id="export-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary 
                       hover:bg-bg-hover active:scale-95 transition-all duration-150 focus-ring"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-default bg-bg-secondary/30 px-2 pt-2 gap-1" role="tablist">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`export-tab-${key}`}
              role="tab"
              aria-selected={tab === key}
              onClick={() => switchTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold
                         transition-all duration-150 rounded-t-lg focus-ring
                         ${tab === key
                           ? 'text-text-primary bg-bg-primary border-t border-x border-border-default shadow-xs'
                           : 'text-text-muted hover:text-text-primary hover:bg-bg-hover/50'
                         }`}
            >
              <Icon size={14} />
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
            <div className="space-y-5">
              {/* Document Import */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <FileUp size={15} />
                  Import Document
                </h3>
                <p className="text-xs text-text-secondary mb-3">
                  Upload a <strong>.txt</strong> or <strong>.docx</strong> file to convert it into blocks.
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-default rounded-lg p-5
                             text-center cursor-pointer hover:border-accent/50 
                             hover:bg-bg-hover/30 transition-colors duration-150"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {docFile ? (
                    <div className="space-y-2">
                      <FileText size={24} className="mx-auto text-accent" />
                      <p className="text-sm font-medium text-text-primary">{docFile.name}</p>
                      <p className="text-xs text-text-muted">
                        {(docFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={24} className="mx-auto text-text-muted" />
                      <p className="text-sm text-text-secondary">
                        Drop a file here or click to browse
                      </p>
                      <p className="text-xs text-text-muted">.txt or .docx files only</p>
                    </div>
                  )}
                </div>

                {docError && (
                  <p className="text-xs text-danger mt-2">{docError}</p>
                )}

                <button
                  id="export-import-doc-btn"
                  onClick={handleConvertAndImport}
                  disabled={!docFile || docImporting}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-accent text-white hover:bg-accent-hover 
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors duration-150 w-full justify-center"
                >
                  {docImporting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <FileUp size={15} />
                  )}
                  {docImporting ? 'Converting...' : 'Convert & Import'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border-default" />
                <span className="text-xs text-text-muted font-medium">or</span>
                <div className="flex-1 h-px bg-border-default" />
              </div>

              {/* JSON Import */}
              <div>
                <p className="text-sm text-text-secondary mb-2">
                  Paste a BlockForge JSON export to import blocks.
                  <span className="text-text-muted"> This will replace all current blocks.</span>
                </p>
                <textarea
                  id="export-import-textarea"
                  value={importText}
                  onChange={(e) => { setImportText(e.target.value); setImportError(''); }}
                  placeholder='[{"id":"...","type":"text","content":"Hello"}]'
                  rows={6}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg p-4
                             text-xs font-mono text-text-primary placeholder-text-placeholder
                             resize-none outline-none focus:border-border-focus
                             transition-colors duration-200"
                />
                {importError && (
                  <p className="text-xs text-danger mt-1">{importError}</p>
                )}
                <button
                  id="export-import-btn"
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-accent text-white hover:bg-accent-hover 
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors duration-150 w-full justify-center"
                >
                  <Upload size={15} />
                  Import Blocks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
