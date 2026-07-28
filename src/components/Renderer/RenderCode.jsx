import { memo, useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * RenderCode — Renders monospace code blocks with language badge, line numbers, and copy button.
 */
const RenderCode = memo(({ content }) => {
  const code = content?.code || '';
  const language = content?.language || 'javascript';
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API fallback
    }
  };

  const lines = code.split('\n');

  return (
    <div className="my-5 rounded-xl border border-border-default bg-bg-tertiary/70 overflow-hidden shadow-xs">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-default select-none">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code block"
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary 
                     px-2 py-1 rounded hover:bg-bg-hover transition-colors duration-150 focus-ring"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="flex overflow-x-auto p-4 text-xs font-mono leading-relaxed text-text-primary">
        <div className="select-none pr-4 text-right text-text-muted/40 border-r border-border-default/60 shrink-0">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="pl-4 font-mono whitespace-pre overflow-x-auto flex-1">
          {code}
        </pre>
      </div>
    </div>
  );
});

RenderCode.displayName = 'RenderCode';

export default RenderCode;
