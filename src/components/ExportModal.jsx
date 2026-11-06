import { useState, useRef, useEffect } from 'react';
import { Download, Upload, X, Copy, Check, FileJson, FileText, FileUp, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { convertDocumentToBlocks } from '../utils/documentImport';
import { blocksToMarkdown } from '../utils/blocksToMarkdown';
import { blocksToHtml, downloadFile } from '../utils/documentExport';
import { validateBlocks } from '../utils/validateBlocks';

const ExportModal = ({ isOpen, onClose, initialTab = 'json' }) => {
  const blocks = useStore((s) => s.blocks);
  const importBlocks = useStore(s => s.importBlocks);
  const activeDocument = useStore(s => s.documents.find(d => d.id === s.activeDocumentId));
  const [importMode, setImportMode] = useState('append');
  const filename = (activeDocument?.title || 'Untitled document').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80) || 'document';
  const [tab, setTab] = useState(initialTab);
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

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const focusable = () => [...modalRef.current.querySelectorAll('button:not(:disabled), textarea, select, input:not([type="file"])')];
    focusable()[0]?.focus();
    const trap = e => {
      if (e.key !== 'Tab') return;
      const items = focusable(), first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [isOpen]);

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

  const handleDownload = downloadFile;

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
      importBlocks(newBlocks, importMode);
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
      validateBlocks(parsed);
      importBlocks(parsed, importMode);
      onClose();
    } catch (error) {
      setImportError(error instanceof SyntaxError ? 'Invalid JSON. Please check your input.' : error.message);
    }
  };

  const tabs = [
    { key: 'json', label: 'JSON', icon: FileJson },
    { key: 'markdown', label: 'Markdown', icon: FileText },
    { key: 'html', label: 'HTML / PDF', icon: FileText },
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
                   shadow-2xl shadow-black/20 overflow-hidden max-h-[90dvh] overflow-y-auto"
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
                  onClick={() => handleDownload(jsonOutput, `${filename}.json`, 'application/json')}
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
                  onClick={() => handleDownload(markdownOutput, `${filename}.md`, 'text/markdown')}
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

          {tab === 'html' && <div className="space-y-3">
            <p className="text-sm text-text-secondary">Download a standalone HTML document. To save as PDF, open the file in your browser and choose Print → Save as PDF.</p>
            <button className="px-4 py-2 rounded-lg bg-accent text-white focus-ring" onClick={() => handleDownload(blocksToHtml(blocks, activeDocument?.title), `${filename}.html`, 'text/html')}>Download HTML / print to PDF</button>
          </div>}
          {tab === 'import' && (
            <div className="space-y-5">
              <label className="block text-sm font-medium">Import destination
                <select aria-label="Import destination" value={importMode} onChange={e => setImportMode(e.target.value)} className="block w-full mt-2 p-2 rounded border border-border-default bg-bg-primary">
                  <option value="append">Append to current document</option>
                  <option value="replace">Replace current document (can be undone)</option>
                </select>
              </label>
              {/* Document Import */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <FileUp size={15} />
                  Import Document
                </h3>
                <p className="text-xs text-text-secondary mb-3">
                  Upload a <strong>.txt, .md, .json</strong> or <strong>.docx</strong> file to convert it into blocks.
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
                    accept=".txt,.md,.markdown,.json,.docx"
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
                      <p className="text-xs text-text-muted">.txt, .md, .json or .docx files</p>
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
                  <span className="text-text-muted"> Choose append or replace above.</span>
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
